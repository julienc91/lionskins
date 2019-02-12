import slugify from 'slugify'

export const getSkinInternalUrl = (skin) => {
  const weaponSlug = slugify(skin.weapon.name.replace('_', '-'), { lower: true })
  return `/counter-strike-global-offensive/${weaponSlug}/${skin.slug}/`
}
