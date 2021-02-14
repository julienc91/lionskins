FROM python:3

WORKDIR /opt/services/backend/
COPY requirements.txt /opt/services/backend/
RUN pip install -r requirements.txt
COPY . /opt/services/backend/

EXPOSE 5000

CMD ["./startup.sh"]
