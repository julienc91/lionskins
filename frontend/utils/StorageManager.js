export default class StorageManager {
  // a wrapper around localStorage and sessionStorage to handle exceptions and
  // work in best-effort
  static _getStorage (persistent) {
    try {
      return persistent ? localStorage : sessionStorage
    } catch {
      // ignore
    }
  }

  static get (key, persistent = true) {
    const storage = StorageManager._getStorage(persistent)
    try {
      return storage.getItem(key)
    } catch {
      return undefined
    }
  }

  static set (key, value, persistent = true) {
    const storage = StorageManager._getStorage(persistent)
    value = value || ''
    try {
      storage.setItem(key, value)
    } catch {
      // ignore
    }
  }

  static remove (key, persistent = true) {
    const storage = StorageManager._getStorage(persistent)
    try {
      storage.removeItem(key)
    } catch {
      // ignore
    }
  }
}
