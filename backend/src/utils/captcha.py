# -*- coding: utf-8 -*-

import os

import requests


def check_captcha(response, remote_addr):
    res = requests.post(
        "https://www.google.com/recaptcha/api/siteverify",
        {"secret": os.environ["RECAPTCHA_SECRET"], "response": response, "remoteip": remote_addr},
    )
    return res.json().get("success")
