# -*- coding: utf-8 -*-

from enum import Enum

from ..init import db


string_field_init = db.StringField.__init__


def patched_init(*args, **kwargs):
    if 'choices' in kwargs:
        try:
            if issubclass(kwargs['choices'], Enum):
                kwargs['choices'] = [(e.name, e.value) for e in kwargs['choices']]
        except TypeError:
            pass
    string_field_init(*args, **kwargs)


db.StringField.__init__ = patched_init


class ModelMixin:

    def __init__(self, **kwargs):
        super().__init__(**self._parse_kwargs(kwargs))

    @classmethod
    def _parse_kwargs(cls, kwargs):
        new_kwargs = {}
        for k, v in kwargs.items():
            if isinstance(v, Enum):
                if ("_" + k) in cls._fields:
                    k = "_" + k
                v = v.name
            new_kwargs[k] = v
        return new_kwargs

    @classmethod
    def get(cls, **kwargs):
        if issubclass(cls, db.EmbeddedDocument):
            raise NotImplementedError
        else:
            return cls.objects.get(**cls._parse_kwargs(kwargs))

    @classmethod
    def filter(cls, **kwargs):
        if issubclass(cls, db.EmbeddedDocument):
            raise NotImplementedError
        else:
            return cls.objects(**cls._parse_kwargs(kwargs))

    @classmethod
    def count(cls, **kwargs):
        return cls.objects(**cls._parse_kwargs(kwargs)).count()

    @classmethod
    def exists(cls, **kwargs):
        return bool(cls.filter(**kwargs))

    @classmethod
    def create(cls, **kwargs):
        if issubclass(cls, db.EmbeddedDocument):
            return cls(**kwargs)
        else:
            return cls.objects.create(**cls._parse_kwargs(kwargs))

    @classmethod
    def get_or_create(cls, defaults=None, **kwargs):
        kwargs = cls._parse_kwargs(kwargs)
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
