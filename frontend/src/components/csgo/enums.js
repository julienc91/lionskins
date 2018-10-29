const Qualities = Object.freeze({
  factory_new: 'Factory New',
  minimal_wear: 'Minimal Wear',
  field_tested: 'Field-Tested',
  well_worn: 'Well-Worn',
  battle_scarred: 'Battle-Scarred'
})

const Rarities = Object.freeze({
  consumer_grade: 'Consumer Grade',
  industrial_grade: 'Industrial Grade',
  mil_spec: 'Mil-Spec',
  restricted: 'Restricted',
  classified: 'Classified',
  covert: 'Covert',
  contraband: 'Contraband'
})

const Categories = Object.freeze({
  pistols: 'Pistols',
  heavy: 'Heavy',
  smgs: 'SMGs',
  rifles: 'Rifles',
  knives: 'Knives'
})

const Weapons = Object.freeze({
  glock_18: 'Glock-18',
  usp_s: 'USP-S',
  p2000: 'P2000',
  p250: 'P250',
  cz75_auto: 'CZ75-Auto',
  five_seven: 'Five-SeveN',
  tec_9: 'Tec-9',
  dual_berettas: 'Dual Berettas',
  desert_eagle: 'Desert Eagle',
  r8_revolver: 'R8 Revolver',

  sawed_off: 'Sawed-Off',
  mag_7: 'MAG-7',
  nova: 'Nova',
  xm1014: 'XM1014',
  m249: 'M249',
  negev: 'Negev',

  mac_10: 'MAC-10',
  mp9: 'MP9',
  pp_bizon: 'PP-Bizon',
  mp7: 'MP7',
  mp5_sd: 'MP5-SD',
  ump_45: 'UMP-45',
  p90: 'P90',

  galil_ar: 'Galil AR',
  famas: 'FAMAS',
  ak_47: 'AK-47',
  m4a4: 'M4A4',
  m4a1_s: 'M4A1-S',
  sg_553: 'SG 553',
  aug: 'AUG',
  g3sg1: 'G3SG1',
  scar_20: 'SCAR-20',
  ssg_08: 'SSG 08',
  awp: 'AWP',

  bayonet: 'Bayonet',
  bowie_knife: 'Bowie Knife',
  butterfly_knife: 'Butterfly Knife',
  falchion_knife: 'Falchion Knife',
  flip_knife: 'Flip Knife',
  gut_knife: 'Gut Knife',
  huntsman_knife: 'Huntsman Knife',
  karambit: 'Karambit',
  m9_bayonet: 'M9 Bayonet',
  navaja_knife: 'Navaja Knife',
  shadow_daggers: 'Shadow Daggers',
  stiletto_knife: 'Stiletto Knife',
  talon_knife: 'Talon Knife',
  ursus_knife: 'Ursus Knife'
})

const WeaponsByCategories = Object.freeze({
  pistols: [
    'glock_18', 'usp_s', 'p2000', 'p250', 'cz75_auto', 'five_seven',
    'tec_9', 'dual_berettas', 'desert_eagle', 'r8_revolver'
  ],
  heavy: [
    'sawed_off', 'mag_7', 'nova', 'xm1014', 'm249', 'negev'
  ],
  smgs: [
    'mac_10', 'mp9', 'pp_bizon', 'mp7', 'mp5_sd', 'ump_45', 'p90'
  ],
  rifles: [
    'galil_ar', 'famas', 'ak_47', 'm4a4', 'm4a1_s', 'sg_553',
    'aug', 'g3sg1', 'scar_20', 'ssg_08', 'awp'
  ],
  knives: [
    'bayonet', 'bowie_knife', 'butterfly_knife', 'falchion_knife',
    'flip_knife', 'gut_knife', 'huntsman_knife', 'karambit', 'm9_bayonet',
    'navaja_knife', 'shadow_daggers', 'stiletto_knife', 'talon_knife',
    'ursus_knife'
  ]
})

export {
  Qualities,
  Rarities,
  Categories,
  Weapons,
  WeaponsByCategories
}
