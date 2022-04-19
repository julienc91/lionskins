FROM python:3-alpine

RUN \
  addgroup -S group && \
  adduser -S user -G group && \
  apk add --no-cache gcc libffi-dev musl-dev cargo libressl-dev postgresql-dev

WORKDIR /home/user/backend

USER user
ENV PATH="/home/user/.local/bin:${PATH}" \
    POETRY_VERSION=1.1.13

RUN pip install "poetry==1.1.13"
COPY --chown=user:group pyproject.toml poetry.lock ./
RUN poetry config virtualenvs.create false \
  && poetry install --no-dev --no-interaction --no-ansi
COPY --chown=user:group . .

EXPOSE 8000

CMD ["gunicorn", "--config", "gunicorn.py", "lionskins.wsgi"]
