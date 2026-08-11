declare module "@pagefind/default-ui" {
  declare class PagefindUI<T = unknown> {
    constructor(opts: {
      element?: string | HTMLElement;
      bundlePath?: string;
      pageSize?: number;
      resetStyles?: boolean;
      showImages?: boolean;
      showSubResults?: boolean;
      excerptLength?: number;
      processResult?: T;
      processTerm?: T;
      showEmptyFilters?: boolean;
      debounceTimeoutMs?: number;
      mergeIndex?: T;
      translations?: T;
      autofocus?: boolean;
      sort?: T;
    });
  }
}
