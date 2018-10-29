FROM python:3

RUN mkdir -p /opt/services/backend/
COPY requirements.txt /opt/services/backend/
WORKDIR /opt/services/backend/
RUN pip install -r requirements.txt
COPY . /opt/services/backend/
EXPOSE 5000
WORKDIR /opt/services/backend/src/
CMD ["../startup.sh"]
