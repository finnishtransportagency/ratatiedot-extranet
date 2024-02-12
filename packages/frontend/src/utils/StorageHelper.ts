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
      if (this.maxLen) {
        const arr = Array.isArray(item)
          ? [value, ...item.filter((val: string) => val.toLowerCase() !== value.toLowerCase())]
          : [value];
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
      const item = localStorage.getItem(key);

      if (typeof item !== 'string') return item;

      if (item === 'undefined') return undefined;

      if (item === 'null') return null;
      // Check for numbers and floats
      if (/^'-?\d{1,}?\.?\d{1,}'$/.test(item)) return Number(item);

      // Check for numbers in scientific notation
      if (/^'-?\d{1}\.\d+e\+\d{2}'$/.test(item)) return Number(item);

      // Check for serialized objects and arrays
      if (item[0] === '{' || item[0] === '[') return JSON.parse(item);

      return item;
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
