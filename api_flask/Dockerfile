FROM python:3.10-slim

# Créer le dossier de travail
WORKDIR /app

# Copier les fichiers de l’API
COPY requirements.txt .
COPY app.py .


# Installer les dépendances
RUN pip install --no-cache-dir -r requirements.txt

# Lancer l’API
EXPOSE 5000
CMD ["python", "app.py"]


