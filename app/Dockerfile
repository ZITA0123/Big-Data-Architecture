FROM bde2020/spark-master:3.3.0-hadoop3.3

# Installer Python et pip
RUN apt-get update && \
    apt-get install -y python3 python3-pip && \
    apt-get clean

# Copier les requirements
COPY requirements.txt /app/requirements.txt

# Installer les dépendances
RUN pip3 install -r /app/requirements.txt
