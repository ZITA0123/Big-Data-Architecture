# Projet Big Data – Analyse de Cryptomonnaies (Bitcoin & multi-cryptos)

## Objectif
Mettre en place un pipeline Big Data basé sur une **architecture Lambda** pour l’ingestion, le traitement temps réel et batch de données de cryptomonnaies (principalement le **Bitcoin**), avec une restitution via une API et un frontend web.

Le projet combine :
- **Ingestion temps réel** : Kafka + simulateur Python  
- **Traitement streaming et batch** : Apache Spark  
- **Stockage distribué** : HDFS  
- **Orchestration** : Apache Airflow  
- **Exposition des données** : API Flask  
- **Visualisation** : Frontend React  

---

## Structure du Projet
```bash
├── airflow/             → DAGs Airflow & script init
│   └── dags/            → DAG pour le job Spark automatisé
├── app/                 → Scripts Spark (streaming, batch)
├── api_flask/           → API Flask REST
├── python_producer/     → Générateur de données vers Kafka (simulateur)
├── python_consumer/     → Consumer Kafka manuel (debug)
├── react_front/         → Interface web React
├── conf/                → Configs Spark/Hadoop
├── docker-compose.yml   → Orchestration de tous les services
├── hadoop.env           → Variables d’environnement Hadoop

---

## Structure du Projet
