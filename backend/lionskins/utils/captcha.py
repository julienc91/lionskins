import requests
from django.conf import settings


def check_captcha(response, remote_addr) -> bool:
    res = requests.post(
        "https://www.google.com/recaptcha/api/siteverify",
        {
            "secret": settings.RECAPTCHA_SECRET,
            "response": response,
            "remoteip": remote_addr,
        },
    )
    return res.json().get("success") or True
