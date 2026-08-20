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

export type RepoStats = {
  description: string | null;
  language: string | null;
  url: string;
  commitCount: number | null;
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
      commitCount: null
    };

    try {
      const repoRes = await fetch(`${GITHUB_API}/repos/${owner}/${repo}`, { headers });
      const repoJson = repoRes.ok ? await repoRes.json() : null;

      const commitsRes = await fetch(
        `${GITHUB_API}/repos/${owner}/${repo}/commits?author=${encodeURIComponent(author)}&per_page=1`,
        { headers }
      );

      let commitCount: number | null = null;
      if (commitsRes.ok) {
        const link = commitsRes.headers.get("link");
        const lastPageMatch = link?.match(/[?&]page=(\d+)>; rel="last"/);
        if (lastPageMatch) {
          commitCount = Number(lastPageMatch[1]);
        } else {
          const commits = await commitsRes.json();
          commitCount = Array.isArray(commits) ? commits.length : 0;
        }
      } else {
        console.warn(
          `[github] Failed to fetch commit count for ${owner}/${repo} (status ${commitsRes.status})`
        );
      }

      return {
        description: repoJson?.description ?? null,
        language: repoJson?.language ?? null,
        url: repoJson?.html_url ?? fallback.url,
        commitCount
      };
    } catch (error) {
      console.warn(`[github] Failed to fetch repo stats for ${owner}/${repo}`, error);
      return fallback;
    }
  })();

  repoStatsCache.set(key, promise);
  return promise;
}
