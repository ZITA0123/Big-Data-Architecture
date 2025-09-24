from kafka import KafkaProducer
import json
import time
import os

BOOTSTRAP_SERVERS = "kafka:9092"
TOPIC = "cryptocurrency"

# Création du producer
kafka_server = os.getenv('KAFKA_BOOTSTRAP_SERVERS', 'kafka:9092')
 
producer = KafkaProducer(
    bootstrap_servers=kafka_server,
    value_serializer=lambda v: json.dumps(v).encode('utf-8')  # JSON -> bytes
)

message = {"msg": "Hello Kafka, we are sending cryptocurrency data from Python!"}

producer.send(TOPIC, message)
producer.flush()
print(f"Message envoyé sur '{TOPIC}': {message}")

time.sleep(1)
producer.close()
