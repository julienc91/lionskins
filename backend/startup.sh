#!/usr/bin/env bash

flask db upgrade
flask init_csgo
cd ..
gunicorn --config gunicorn.py src.app:app
