FROM python:3-alpine

RUN \
  addgroup -S group && \
  adduser -S user -G group

WORKDIR /home/user/backend

USER user
ENV PATH="/home/user/.local/bin:${PATH}"

COPY --chown=user:group requirements.txt .
RUN pip install -r requirements.txt
COPY --chown=user:group . .

EXPOSE 5000

WORKDIR /home/user/backend/src

CMD ["./startup.sh"]
