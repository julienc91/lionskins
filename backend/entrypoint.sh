#!/usr/bin/env sh

/usr/bin/env python manage.py migrate
/usr/bin/env python manage.py collectstatic --noinput
gunicorn --config gunicorn.py lionskins.wsgi
