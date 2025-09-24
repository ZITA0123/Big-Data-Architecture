from kafka import KafkaConsumer
import json
import os
import sys

KAFKA_SERVER = os.getenv('KAFKA_BOOTSTRAP_SERVERS', 'kafka:9092')

# Topic en argument ou par défaut 'cryptocurrency'
TOPIC = sys.argv[1] if len(sys.argv) > 1 else os.getenv('TOPIC', 'cryptocurrency')

consumer = KafkaConsumer(
    TOPIC,
    bootstrap_servers=[KAFKA_SERVER],
    auto_offset_reset='earliest',
    enable_auto_commit=True,
    value_deserializer=lambda m: m.decode('utf-8')
)

print(f"Lecture en cours sur le topic '{TOPIC}'...")
for msg in consumer:
    try:
        data = json.loads(msg.value)
    except json.JSONDecodeError:
        data = msg.value
    print(f"[partition={msg.partition} offset={msg.offset}] {data}")
