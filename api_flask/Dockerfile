FROM python:3.10-slim

# Empêcher les interactions pendant l'installation
ENV DEBIAN_FRONTEND=noninteractive

WORKDIR /app

# Installer Java + nettoyer les caches apt pour réduire la taille
RUN apt-get update && \
    apt-get install -y default-jdk && \
    apt-get clean && \
    rm -rf /var/lib/apt/lists/*

# Copier les fichiers de l’API
COPY requirements.txt .
COPY app.py .

# Installer les dépendances Python
RUN pip install --no-cache-dir -r requirements.txt

EXPOSE 5000

CMD ["python", "app.py"]
