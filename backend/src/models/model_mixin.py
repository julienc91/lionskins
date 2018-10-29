# -*- coding: utf-8 -*-

from ..init.application import sqlalchemy as db


class ModelMixin:

    def __init__(self, **kwargs):
        for name, value in kwargs.items():
            setattr(self, name, value)
        db.session.add(self)

    @classmethod
    def get_or_create(cls, defaults=None, **kwargs):

        res = cls.query.filter_by(**kwargs)
        assert res.count() <= 1
        res = res.first()
        if res:
            return res
        return cls(**kwargs, **(defaults or {}))

    @classmethod
    def create_or_update(cls, data=None, **kwargs):
        res = cls.query.filter_by(**kwargs)
        assert res.count() <= 1
        res = res.first()
        if res:
            if data:
                for k, v in data.items():
                    setattr(res, k, v)
            return res
        return cls(**kwargs, **(data or {}))
