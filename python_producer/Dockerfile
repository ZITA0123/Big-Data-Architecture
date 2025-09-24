FROM python:3.10-slim

WORKDIR /app

COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

# CMD ["sleep", "infinity"]
CMD ["tail", "-f", "/dev/null"]

# COPY producer.py .

# CMD ["python3", "producer.py"]
