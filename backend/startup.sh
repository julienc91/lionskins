#!/usr/bin/env bash

flask db upgrade
cd ..
gunicorn --config gunicorn.py src.app:app
