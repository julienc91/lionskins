FROM python:3-alpine

WORKDIR /opt/services/backend/
COPY requirements.txt /opt/services/backend/
RUN pip install -r requirements.txt
COPY . /opt/services/backend/

EXPOSE 5000
WORKDIR /opt/services/backend/src/

CMD ["../startup.sh"]
