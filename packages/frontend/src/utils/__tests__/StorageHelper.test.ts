import { KeyEnum, LocalStorageHelper } from '../StorageHelper';

describe('StorageHelper', () => {
  beforeEach(() => {
    new LocalStorageHelper().clear();
  });

  it('Initialize LocalStorageHelper without max length', () => {
    const myStorage = new LocalStorageHelper();
    expect(typeof myStorage.get).toBe('function');
    expect(typeof myStorage.add).toBe('function');
    expect(typeof myStorage.clear).toBe('function');
    expect(typeof myStorage.remove).toBe('function');
    expect(
      myStorage.localStorageSupported === undefined || typeof myStorage.localStorageSupported === 'boolean',
    ).toBeTruthy();
    expect(myStorage.maxLen === undefined || typeof myStorage.maxLen === 'number').toBeTruthy();
  });

  it('Initialize LocalStorageHelper with max length', () => {
    const myStorage = new LocalStorageHelper(2);
    expect(myStorage.maxLen).toBe(2);
  });

  it('should get correct item without max length', () => {
    const myStorage = new LocalStorageHelper();
    myStorage.add(KeyEnum.RECENT_SEARCHES, 'A');
    myStorage.add(KeyEnum.RECENT_SEARCHES, 'B');
    myStorage.add(KeyEnum.RECENT_SEARCHES, 'C');
    expect(myStorage.get(KeyEnum.RECENT_SEARCHES)).toBe('C');
  });

  it('should get correct list of latest items with max length', () => {
    const myStorage = new LocalStorageHelper(2);
    myStorage.add(KeyEnum.RECENT_SEARCHES, 'A');
    myStorage.add(KeyEnum.RECENT_SEARCHES, 'B');
    myStorage.add(KeyEnum.RECENT_SEARCHES, 'C');
    expect(myStorage.get(KeyEnum.RECENT_SEARCHES)).toEqual(['C', 'B']);
  });
});
// Or can set `"isolatedModules": false` in tsconfig.json
export {};
