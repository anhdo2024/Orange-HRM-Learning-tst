FROM python:3.12-slim

WORKDIR /app
COPY manager.py /app/manager.py

ENV PYTHONDONTWRITEBYTECODE=1 PYTHONUNBUFFERED=1
EXPOSE 8080
CMD ["python", "/app/manager.py"]

