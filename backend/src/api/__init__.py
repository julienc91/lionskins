# -*- coding: utf-8 -*-

from flask_graphql import GraphQLView

from .schema import schema
from .exceptions import ApiError


class ApiGraphQLView(GraphQLView):

    @classmethod
    def format_error(cls, error):
        try:
            original_error = error.original_error
        except AttributeError:
            pass
        else:
            if isinstance(original_error, ApiError):
                res = {
                    'message': original_error.message,
                    'code': original_error.code,
                }
                for k, v in original_error.kwargs.items():
                    res[k] = v
                return res
        return super().format_error(error)


__all__ = ['schema', 'ApiGraphQLView']
