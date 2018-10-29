# -*- coding: utf-8 -*-

from ..enums import Apps
from ..skins import Skin as BaseSkin
from ...init import sqlalchemy as db
from .enums import Rarities, Qualities, Categories


class Skin(BaseSkin):

    __tablename__ = 'csgo_skins'

    id = db.Column(db.String(36), db.ForeignKey('skins.id'), primary_key=True)
    weapon_id = db.Column(db.ForeignKey('csgo_weapons.id'))

    stat_trak = db.Column(db.Boolean(), index=True)
    souvenir = db.Column(db.Boolean(), index=True)
    quality = db.Column(db.Enum(Qualities, name="type_csgo_qualities"), index=True)
    rarity = db.Column(db.Enum(Rarities, name="type_csgo_rarities"), index=True)

    weapon = db.relationship('models.csgo.weapons.Weapon')

    __mapper_args__ = {'polymorphic_identity': Apps.csgo}

    @property
    def fullname(self):
        res = ""
        if self.stat_trak:
            res += "StatTrak "
        res += self.weapon.id.value
        if self.souvenir:
            res += " (Souvenir)"
        res += " | " + self.name + " "
        res += "(" + self.quality.value + ")"
        return res


    @property
    def market_hash_name(self):
        res = ''
        if self.weapon.category == Categories.knives:
            res += '★ '
        if self.souvenir:
            res += 'Souvenir '
        elif self.stat_trak:
            res += 'StatTrak™ '
        res += self.weapon.name + " | " + self.name
        return res
