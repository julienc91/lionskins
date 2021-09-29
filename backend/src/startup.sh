#!/usr/bin/env sh

gunicorn --config gunicorn.py app:app
