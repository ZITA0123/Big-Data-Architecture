from pyspark.sql import SparkSession
from pyspark.sql.functions import from_json, col, when
from pyspark.sql.types import StructType, StructField, StringType, IntegerType

# Session Spark
spark = SparkSession.builder.appName("KafkaUsersToHDFS").getOrCreate()
spark.sparkContext.setLogLevel("WARN")

# Paramètres Kafka (containers inchangés)
kafka_topic_name = "space_data"
kafka_bootstrap_servers = "kafka:9092"

# Schéma JSON basique: utilisateur
schema = StructType([
    StructField("name", StringType()),
    StructField("age", IntegerType()),
    StructField("city", StringType())
])

# Lecture stream depuis Kafka
df_kafka = spark.readStream \
    .format("kafka") \
    .option("kafka.bootstrap.servers", kafka_bootstrap_servers) \
    .option("subscribe", kafka_topic_name) \
    .option("startingOffsets", "earliest") \
    .load()

# Parsing JSON
df_users = df_kafka.selectExpr("CAST(value AS STRING) AS json_str") \
    .select(from_json(col("json_str"), schema).alias("data")) \
    .select("data.*")

# Ajout d'un groupe d'âge simple
df_users_grouped = df_users.withColumn(
    "age_group",
    when(col("age") < 18, "minor") \
    .when((col("age") >= 18) & (col("age") < 65), "adult") \
    .otherwise("senior")
)

# Écriture des données brutes partitionnées par groupe d'âge
# Remplace les placeholders selon ton environnement
raw_path = "hdfs://namenode:9000/your_hdfs_path/your_directory_path/users_raw"
checkpoint_raw = "hdfs://namenode:9000/your_hdfs_path/your_checkpoint_dir/users_raw"

users_by_group_path = "hdfs://namenode:9000/your_hdfs_path/your_directory_path/users_by_age_group"
checkpoint_group = "hdfs://namenode:9000/your_hdfs_path/your_checkpoint_dir/users_by_age_group"

# 1) Flux brut (sans partition)
df_users.writeStream \
    .format("json") \
    .outputMode("append") \
    .option("path", raw_path) \
    .option("checkpointLocation", checkpoint_raw) \
    .start()

# 2) Flux partitionné par groupe d'âge (facilite le batch)
df_users_grouped.writeStream \
    .format("json") \
    .outputMode("append") \
    .option("path", users_by_group_path) \
    .option("checkpointLocation", checkpoint_group) \
    .partitionBy("age_group") \
    .start() \
    .awaitTermination()
