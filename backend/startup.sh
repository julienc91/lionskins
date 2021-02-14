#!/usr/bin/env bash

flask db upgrade
gunicorn --config gunicorn.py src.app:app
