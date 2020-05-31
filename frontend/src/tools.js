import slugify from 'slugify'

export const getSkinInternalUrl = (skin) => {
  const weaponSlug = slugify(skin.weapon.name.replace('_', '-'), { lower: true })
  return `/counter-strike-global-offensive/${weaponSlug}/${skin.slug}/`
}

export const importAll = r => {
  const images = {}
  r.keys().forEach((item) => { images[item.replace('./', '')] = r(item) })
  return images
}

export class StorageManager {
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

export const startOpenId = () => {
  StorageManager.set('openid.redirect', window.location.pathname, false)
  window.location = `${process.env.REACT_APP_API_DOMAIN}/steam/login`
}
