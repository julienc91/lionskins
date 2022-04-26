from users.models import User


def get_username(strategy, details, user=None, *args, **kwargs):
    return {"username": details["username"]}


def associate_by_steam_id(strategy, uid, user=None, *args, **kwargs):
    if user:
        return None

    try:
        user = User.objects.get(steam_id=uid)
    except User.DoesNotExist:
        return None
    if not user.is_active:
        user.is_active = True
        user.save(update_fields=["is_active"])

    return {"is_new": False, "user": user}


def create_user(strategy, uid, username, user=None, *args, **kwargs):
    if user:
        return {"is_new": False}
    return {
        "is_new": True,
        "user": strategy.create_user(username=username, steam_id=uid),
    }


def user_details(strategy, username, user, *args, **kwargs):
    if user.username != username:
        user.username = username
        user.save(update_fields=["username"])
    return None
