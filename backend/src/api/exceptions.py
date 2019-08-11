# -*- coding: utf-8 -*-


class ApiError(Exception):
    def __init__(self, message, code, **kwargs):
        self.message = message
        self.code = code
        self.kwargs = kwargs
