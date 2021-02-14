# -*- coding: utf-8 -*-

from flask_jwt_extended import get_jwt_identity
from src.models import User


def get_current_user():
    user = None
    user_identity = get_jwt_identity()
    if user_identity:
        try:
            user = User.get(id=user_identity)
        except User.DoesNotExist:
            pass
    return user
