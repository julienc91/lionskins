# -*- coding: utf-8 -*-

from init import db


class ModelMixin:
    @classmethod
    def get(cls, **kwargs):
        if issubclass(cls, db.EmbeddedDocument):
            raise NotImplementedError
        else:
            return cls.objects.get(**kwargs)

    @classmethod
    def filter(cls, **kwargs):
        if issubclass(cls, db.EmbeddedDocument):
            raise NotImplementedError
        else:
            return cls.objects(**kwargs)

    @classmethod
    def count(cls, **kwargs):
        return cls.objects(**kwargs).count()

    @classmethod
    def exists(cls, **kwargs):
        return bool(cls.filter(**kwargs))

    @classmethod
    def create(cls, **kwargs):
        if issubclass(cls, db.EmbeddedDocument):
            return cls(**kwargs)
        else:
            return cls.objects.create(**kwargs)

    @classmethod
    def get_or_create(cls, defaults=None, **kwargs):
        res = cls.filter(**kwargs)
        assert res.count() <= 1
        res = res.first()
        if res:
            return res
        return cls.create(**kwargs, **(defaults or {}))

    @classmethod
    def create_or_update(cls, data=None, **kwargs):
        res = cls.filter(**kwargs)
        assert res.count() <= 1
        res = res.first()
        if res:
            if data:
                for k, v in data.items():
                    setattr(res, k, v)
            return res
        return cls.create(**kwargs, **(data or {}))
