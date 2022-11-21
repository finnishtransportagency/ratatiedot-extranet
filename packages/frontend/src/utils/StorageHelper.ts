export enum KeyEnum {
  RECENT_SEARCHES = 'recent_searches',
}

export class LocalStorageHelper {
  localStorageSupported: boolean;
  maxLen?: number;

  constructor(maxLen?: number) {
    this.localStorageSupported =
      typeof window !== 'undefined' && typeof window.localStorage !== 'undefined' && window.localStorage !== null;
    this.maxLen = maxLen;
  }

  add(key: KeyEnum, value: string) {
    if (this.localStorageSupported && value) {
      const item = this.get(key);
      const parsedItem = item ? JSON.parse(item) : value;
      if (this.maxLen) {
        const arr = Array.isArray(parsedItem) ? [value, ...parsedItem] : [parsedItem];
        if (this.maxLen < arr.length) {
          arr.pop();
        }
        localStorage.setItem(key, JSON.stringify(arr));
      } else {
        localStorage.setItem(key, value);
      }
    }
  }

  get(key: string) {
    if (this.localStorageSupported) {
      return localStorage.getItem(key);
    } else {
      return null;
    }
  }

  remove(key: string) {
    if (this.localStorageSupported) {
      localStorage.removeItem(key);
    }
  }

  clear() {
    if (this.localStorageSupported) {
      localStorage.clear();
    }
  }
}
