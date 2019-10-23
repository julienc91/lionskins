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
