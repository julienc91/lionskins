# -*- coding: utf-8 -*-

from http import HTTPStatus

import graphene


class Error(graphene.ObjectType):
    status = graphene.Field(graphene.Int, default_value=HTTPStatus.OK)
    message = graphene.String()
    field = graphene.String()
    error = graphene.String()


class AbstractMutation(graphene.Mutation):
    error = graphene.Field(Error, required=True)

    def __init__(self, *args, **kwargs):
        super().__init__(*args, **kwargs)
        self.error = self.error or Error()

    @classmethod
    def handle_error(cls, status, message=None, field=None, error=None):
        error = Error(status=status, message=message, field=field, error=error)
        return cls(error=error)

    @classmethod
    def mutate(cls, *args, **kwargs):
        raise NotImplementedError
