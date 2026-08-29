FROM python:3.13-slim

WORKDIR /app

COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

COPY src/ src/
COPY apps/ apps/

ENV PYTHONPATH=/app/src:/app

CMD ["python", "-m", "apps.worker.main"]
