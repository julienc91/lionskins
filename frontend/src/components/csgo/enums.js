const Qualities = Object.freeze({
  factory_new: 'csgo.qualities.factory_new',
  minimal_wear: 'csgo.qualities.minimal_wear',
  field_tested: 'csgo.qualities.field_tested',
  well_worn: 'csgo.qualities.well_worn',
  battle_scarred: 'csgo.qualities.battle_scarred'
})

const Rarities = Object.freeze({
  consumer_grade: 'csgo.rarities.consumer_grade',
  industrial_grade: 'csgo.rarities.industrial_grade',
  mil_spec: 'csgo.rarities.mil_spec',
  restricted: 'csgo.rarities.restricted',
  classified: 'csgo.rarities.classified',
  covert: 'csgo.rarities.covert',
  contraband: 'csgo.rarities.contraband'
})

const Categories = Object.freeze({
  pistols: 'csgo.categories.pistols',
  heavy: 'csgo.categories.heavy',
  smgs: 'csgo.categories.smgs',
  rifles: 'csgo.categories.rifles',
  knives: 'csgo.categories.knives',
  gloves: 'csgo.categories.gloves'
})

const Weapons = Object.freeze({
  glock_18: 'csgo.weapons.glock_18',
  usp_s: 'csgo.weapons.usp_s',
  p2000: 'csgo.weapons.p2000',
  p250: 'csgo.weapons.p250',
  cz75_auto: 'csgo.weapons.cz75_auto',
  five_seven: 'csgo.weapons.five_seven',
  tec_9: 'csgo.weapons.tec_9',
  dual_berettas: 'csgo.weapons.dual_berettas',
  desert_eagle: 'csgo.weapons.desert_eagle',
  r8_revolver: 'csgo.weapons.r8_revolver',

  sawed_off: 'csgo.weapons.sawed_off',
  mag_7: 'csgo.weapons.mag_7',
  nova: 'csgo.weapons.nova',
  xm1014: 'csgo.weapons.xm1014',
  m249: 'csgo.weapons.m249',
  negev: 'csgo.weapons.negev',

  mac_10: 'csgo.weapons.mac_10',
  mp9: 'csgo.weapons.mp9',
  pp_bizon: 'csgo.weapons.pp_bizon',
  mp7: 'csgo.weapons.mp7',
  mp5_sd: 'csgo.weapons.mp5_sd',
  ump_45: 'csgo.weapons.ump_45',
  p90: 'csgo.weapons.p90',

  galil_ar: 'csgo.weapons.galil_ar',
  famas: 'csgo.weapons.famas',
  ak_47: 'csgo.weapons.ak_47',
  m4a4: 'csgo.weapons.m4a4',
  m4a1_s: 'csgo.weapons.m4a1_s',
  sg_553: 'csgo.weapons.sg_553',
  aug: 'csgo.weapons.aug',
  g3sg1: 'csgo.weapons.g3sg1',
  scar_20: 'csgo.weapons.scar_20',
  ssg_08: 'csgo.weapons.ssg_08',
  awp: 'csgo.weapons.awp',

  bayonet: 'csgo.weapons.bayonet',
  bowie_knife: 'csgo.weapons.bowie_knife',
  butterfly_knife: 'csgo.weapons.butterfly_knife',
  classic_knife: 'csgo.weapons.classic_knife',
  falchion_knife: 'csgo.weapons.falchion_knife',
  flip_knife: 'csgo.weapons.flip_knife',
  gut_knife: 'csgo.weapons.gut_knife',
  huntsman_knife: 'csgo.weapons.huntsman_knife',
  karambit: 'csgo.weapons.karambit',
  m9_bayonet: 'csgo.weapons.m9_bayonet',
  navaja_knife: 'csgo.weapons.navaja_knife',
  nomad_knife: 'csgo.weapons.nomad_knife',
  paracord_knife: 'csgo.weapons.paracord_knife',
  shadow_daggers: 'csgo.weapons.shadow_daggers',
  skeleton_knife: 'csgo.weapoins.skeleton_knife',
  stiletto_knife: 'csgo.weapons.stiletto_knife',
  survival_knife: 'csgo.weapons.survival_knife',
  talon_knife: 'csgo.weapons.talon_knife',
  ursus_knife: 'csgo.weapons.ursus_knife',

  bloodhound_gloves: 'csgo.weapons.bloodhound_gloves',
  driver_gloves: 'csgo.weapons.driver_gloves',
  hand_wraps: 'csgo.weapons.hand_wraps',
  hydra_gloves: 'csgo.weapons.hydra_gloves',
  moto_gloves: 'csgo.weapons.moto_gloves',
  specialist_gloves: 'csgo.weapons.specialist_gloves',
  sport_gloves: 'csgo.weapons.sport_gloves'
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
    'bayonet', 'bowie_knife', 'butterfly_knife', 'classic_knife', 'falchion_knife',
    'flip_knife', 'gut_knife', 'huntsman_knife', 'karambit', 'm9_bayonet',
    'navaja_knife', 'nomad_knife', 'paracord_knife', 'shadow_daggers', 'skeleton_knife',
    'stiletto_knife', 'survival_knife', 'talon_knife', 'ursus_knife'
  ],
  gloves: [
    'bloodhound_gloves', 'driver_gloves', 'hand_wraps', 'hydra_gloves',
    'moto_gloves', 'specialist_gloves', 'sport_gloves'
  ]
})

export {
  Qualities,
  Rarities,
  Categories,
  Weapons,
  WeaponsByCategories
}
