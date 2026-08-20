const GITHUB_API = "https://api.github.com";
const GITHUB_GRAPHQL_API = "https://api.github.com/graphql";

function getToken(): string | undefined {
  return import.meta.env.GH_TOKEN;
}

function authHeaders(token?: string): Record<string, string> {
  const headers: Record<string, string> = { Accept: "application/vnd.github+json" };
  if (token) headers.Authorization = `Bearer ${token}`;
  return headers;
}

export function getGithubProfileUrl(username: string): string {
  return `https://github.com/${username}`;
}

export function getPastYearContributionUrl(username: string): string {
  const formatDate = (date: Date) => date.toISOString().slice(0, 10);
  const now = new Date();
  const oneYearAgo = new Date(now);
  oneYearAgo.setUTCFullYear(now.getUTCFullYear() - 1);
  return `${getGithubProfileUrl(username)}?tab=overview&from=${formatDate(oneYearAgo)}&to=${formatDate(now)}`;
}

export type ContributionStats = {
  totalContributions: number;
  lastYearContributions: number;
};

const contributionStatsCache = new Map<string, Promise<ContributionStats | null>>();

export function fetchContributionStats(username: string): Promise<ContributionStats | null> {
  const cached = contributionStatsCache.get(username);
  if (cached) return cached;

  const promise = (async (): Promise<ContributionStats | null> => {
    const token = getToken();
    if (!token) {
      console.warn("[github] GH_TOKEN is not set. Skipping contribution stats.");
      return null;
    }

    try {
      const userRes = await fetch(GITHUB_GRAPHQL_API, {
        method: "POST",
        headers: { ...authHeaders(token), "Content-Type": "application/json" },
        body: JSON.stringify({
          query: `query($login: String!) { user(login: $login) { createdAt } }`,
          variables: { login: username }
        })
      });
      const userJson = await userRes.json();
      const createdAt: string | undefined = userJson?.data?.user?.createdAt;
      if (!createdAt) {
        console.warn("[github] Failed to resolve account creation date", JSON.stringify(userJson));
        return null;
      }

      const startYear = new Date(createdAt).getUTCFullYear();
      const currentYear = new Date().getUTCFullYear();

      const yearAliases: string[] = [];
      const yearVariables: Record<string, string> = {};
      for (let year = startYear; year <= currentYear; year++) {
        const alias = `y${year}`;
        yearAliases.push(alias);
        yearVariables[`${alias}From`] = `${year}-01-01T00:00:00Z`;
        yearVariables[`${alias}To`] = `${year}-12-31T23:59:59Z`;
      }

      const query = `
        query($login: String!, ${yearAliases.map((a) => `$${a}From: DateTime!, $${a}To: DateTime!`).join(", ")}) {
          user(login: $login) {
            lastYear: contributionsCollection {
              contributionCalendar { totalContributions }
            }
            ${yearAliases
              .map(
                (a) =>
                  `${a}: contributionsCollection(from: $${a}From, to: $${a}To) { contributionCalendar { totalContributions } }`
              )
              .join("\n")}
          }
        }
      `;

      const res = await fetch(GITHUB_GRAPHQL_API, {
        method: "POST",
        headers: { ...authHeaders(token), "Content-Type": "application/json" },
        body: JSON.stringify({ query, variables: { login: username, ...yearVariables } })
      });
      const json = await res.json();
      const user = json?.data?.user;
      if (!user) {
        console.warn("[github] Failed to fetch contribution stats", JSON.stringify(json));
        return null;
      }

      const totalContributions = yearAliases.reduce(
        (sum, alias) => sum + (user[alias]?.contributionCalendar?.totalContributions ?? 0),
        0
      );
      const lastYearContributions = user.lastYear?.contributionCalendar?.totalContributions ?? 0;

      return { totalContributions, lastYearContributions };
    } catch (error) {
      console.warn("[github] Failed to fetch contribution stats", error);
      return null;
    }
  })();

  contributionStatsCache.set(username, promise);
  return promise;
}

export type LanguageStat = {
  name: string;
  bytes: number;
  percentage: number;
};

export type AccountStats = {
  totalRepos: number;
  followers: number;
  following: number;
  totalStars: number;
  languageStats: LanguageStat[];
};

export const LANGUAGE_COLORS: Record<string, string> = {
  TypeScript: "#3178c6",
  JavaScript: "#f1e05a",
  Rust: "#dea584",
  Python: "#3572A5",
  Go: "#00ADD8",
  HTML: "#e34c26",
  CSS: "#563d7c",
  SCSS: "#c6538c",
  Shell: "#89e051",
  Astro: "#ff5a03",
  Vue: "#41b883",
  Java: "#b07219",
  "C++": "#f34b7d",
  C: "#555555",
  "C#": "#178600",
  PHP: "#4F5D95",
  Ruby: "#701516",
  Kotlin: "#A97BFF",
  Swift: "#F05138",
  Dockerfile: "#384d54",
  MDX: "#fcb32c",
  Vim: "#199f4b",
  Lua: "#000080",
  Other: "#8b8b8b"
};

export function getLanguageColor(name: string): string {
  return LANGUAGE_COLORS[name] ?? "#8b8b8b";
}

const LANGUAGE_TOP_N = 6;
const LANGUAGE_FETCH_CONCURRENCY = 8;

async function mapWithConcurrency<T>(items: T[], limit: number, fn: (item: T) => Promise<void>) {
  let index = 0;
  async function worker() {
    while (index < items.length) {
      const current = items[index++];
      await fn(current);
    }
  }
  await Promise.all(Array.from({ length: Math.min(limit, items.length) }, worker));
}

type RepoSummary = { name: string; fork: boolean; stargazers_count: number };

const accountStatsCache = new Map<string, Promise<AccountStats | null>>();

export function fetchAccountStats(username: string): Promise<AccountStats | null> {
  const cached = accountStatsCache.get(username);
  if (cached) return cached;

  const promise = (async (): Promise<AccountStats | null> => {
    const token = getToken();
    const headers = authHeaders(token);

    try {
      const userRes = await fetch(`${GITHUB_API}/users/${username}`, { headers });
      if (!userRes.ok) {
        console.warn(
          `[github] Failed to fetch user profile for ${username} (status ${userRes.status})`
        );
        return null;
      }
      const userJson = await userRes.json();

      // The authenticated "/user/repos" endpoint also returns private repos owned by the
      // token holder; the public "/users/{username}/repos" endpoint never does.
      const repoListUrl = token
        ? `${GITHUB_API}/user/repos?type=owner&per_page=100`
        : `${GITHUB_API}/users/${username}/repos?type=owner&per_page=100`;

      const repos: RepoSummary[] = [];
      for (let page = 1; ; page++) {
        const res = await fetch(`${repoListUrl}&page=${page}`, { headers });
        if (!res.ok) {
          console.warn(
            `[github] Failed to list repositories for ${username} (status ${res.status})`
          );
          break;
        }
        const batch = (await res.json()) as RepoSummary[];
        repos.push(...batch);
        if (batch.length < 100) break;
      }

      const totalRepos = repos.length;
      const ownRepos = repos.filter((repo) => !repo.fork);
      const totalStars = ownRepos.reduce((sum, repo) => sum + (repo.stargazers_count ?? 0), 0);

      const totals = new Map<string, number>();
      await mapWithConcurrency(ownRepos, LANGUAGE_FETCH_CONCURRENCY, async (repo) => {
        const res = await fetch(`${GITHUB_API}/repos/${username}/${repo.name}/languages`, {
          headers
        });
        if (!res.ok) return;
        const languages = (await res.json()) as Record<string, number>;
        for (const [name, bytes] of Object.entries(languages)) {
          totals.set(name, (totals.get(name) ?? 0) + bytes);
        }
      });

      const totalBytes = [...totals.values()].reduce((sum, bytes) => sum + bytes, 0);
      let languageStats: LanguageStat[] = [];
      if (totalBytes > 0) {
        const sorted = [...totals.entries()]
          .map(([name, bytes]) => ({ name, bytes, percentage: (bytes / totalBytes) * 100 }))
          .sort((a, b) => b.bytes - a.bytes);

        if (sorted.length <= LANGUAGE_TOP_N) {
          languageStats = sorted;
        } else {
          const top = sorted.slice(0, LANGUAGE_TOP_N);
          const otherBytes = sorted
            .slice(LANGUAGE_TOP_N)
            .reduce((sum, lang) => sum + lang.bytes, 0);
          top.push({
            name: "Other",
            bytes: otherBytes,
            percentage: (otherBytes / totalBytes) * 100
          });
          languageStats = top;
        }
      }

      return {
        totalRepos,
        followers: userJson.followers ?? 0,
        following: userJson.following ?? 0,
        totalStars,
        languageStats
      };
    } catch (error) {
      console.warn(`[github] Failed to fetch account stats for ${username}`, error);
      return null;
    }
  })();

  accountStatsCache.set(username, promise);
  return promise;
}

async function fetchCommitCount(
  owner: string,
  repo: string,
  headers: Record<string, string>,
  author?: string
): Promise<number | null> {
  const authorParam = author ? `&author=${encodeURIComponent(author)}` : "";
  const res = await fetch(`${GITHUB_API}/repos/${owner}/${repo}/commits?per_page=1${authorParam}`, {
    headers
  });
  if (!res.ok) {
    console.warn(
      `[github] Failed to fetch commit count for ${owner}/${repo} (status ${res.status})`
    );
    return null;
  }
  const link = res.headers.get("link");
  const lastPageMatch = link?.match(/[?&]page=(\d+)>; rel="last"/);
  if (lastPageMatch) return Number(lastPageMatch[1]);
  const commits = await res.json();
  return Array.isArray(commits) ? commits.length : 0;
}

export type RepoStats = {
  description: string | null;
  language: string | null;
  url: string;
  totalCommitCount: number | null;
  authorCommitCount: number | null;
};

const repoStatsCache = new Map<string, Promise<RepoStats>>();

export function fetchRepoStats(owner: string, repo: string, author: string): Promise<RepoStats> {
  const key = `${owner}/${repo}:${author}`;
  const cached = repoStatsCache.get(key);
  if (cached) return cached;

  const promise = (async (): Promise<RepoStats> => {
    const token = getToken();
    const headers = authHeaders(token);
    const fallback: RepoStats = {
      description: null,
      language: null,
      url: `https://github.com/${owner}/${repo}`,
      totalCommitCount: null,
      authorCommitCount: null
    };

    try {
      const repoRes = await fetch(`${GITHUB_API}/repos/${owner}/${repo}`, { headers });
      const repoJson = repoRes.ok ? await repoRes.json() : null;

      const [totalCommitCount, authorCommitCount] = await Promise.all([
        fetchCommitCount(owner, repo, headers),
        fetchCommitCount(owner, repo, headers, author)
      ]);

      return {
        description: repoJson?.description ?? null,
        language: repoJson?.language ?? null,
        url: repoJson?.html_url ?? fallback.url,
        totalCommitCount,
        authorCommitCount
      };
    } catch (error) {
      console.warn(`[github] Failed to fetch repo stats for ${owner}/${repo}`, error);
      return fallback;
    }
  })();

  repoStatsCache.set(key, promise);
  return promise;
}
