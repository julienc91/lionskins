FROM python:3

ARG UID
ARG GID

RUN \
  groupadd -g ${GID} -o group && \
  useradd -u ${UID} -g ${GID} -o -m -s /bin/bash user

WORKDIR /home/user/backend

USER user
ENV PATH="/home/user/.local/bin:${PATH}" \
    POETRY_VERSION=1.1.13 \
    PYTHONDONTWRITEBYTECODE=1 \
    PYTHONUNBUFFERED=1

COPY --chown=user:group pyproject.toml poetry.lock ./
RUN \
  pip install "poetry==1.1.13" && \
  poetry config virtualenvs.create false && \
  poetry install --no-dev --no-interaction --no-ansi

COPY --chown=user:group . .

EXPOSE 8000

CMD ["./entrypoint.sh"]
