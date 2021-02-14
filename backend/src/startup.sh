#!/usr/bin/env bash

gunicorn --config gunicorn.py app:app
