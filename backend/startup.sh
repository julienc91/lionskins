#!/usr/bin/env bash

flask db upgrade
flask init-csgo
cd ..
gunicorn --config gunicorn.py src.app:app
