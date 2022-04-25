from device_detector import DeviceDetector
from django.core.exceptions import ValidationError
from django.http.response import HttpResponseRedirect
from graphql_relay import from_global_id
from rest_framework import status
from rest_framework.decorators import api_view
from rest_framework.response import Response

from csgo.models.skin import Skin
from lionskins.models.enums import Providers
from users.models.redirect import Redirect


@api_view(["GET"])
def redirect_view(request, provider, skin_id):
    try:
        _, skin_id = from_global_id(skin_id)
        provider = Providers[provider]
    except (ValueError, KeyError):
        return Response(None, status=status.HTTP_404_NOT_FOUND)

    try:
        skin = Skin.objects.get(id=skin_id)
    except (Skin.DoesNotExist, ValidationError):
        try:
            skin = Skin.objects.get(object_id=skin_id)
        except Skin.DoesNotExist:
            return Response(None, status=status.HTTP_404_NOT_FOUND)

    if should_create_redirect_object(request):
        if not request.session.session_key:
            request.session.save()
        Redirect.objects.create(
            skin=skin, provider=provider, tracker=request.session.session_key
        )

    url = skin.get_skin_url(provider)
    return HttpResponseRedirect(url, status=status.HTTP_302_FOUND)


def should_create_redirect_object(request) -> bool:
    user_agent = request.headers.get("User-Agent")
    return (
        user_agent
        and not DeviceDetector(user_agent).parse().is_bot()
        and not request.user.is_staff
    )
