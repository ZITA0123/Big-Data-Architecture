from pyspark.sql import SparkSession
from pyspark.sql.functions import col, when
from pyspark.sql.types import StructType, StructField, StringType, IntegerType

# Session Spark
spark = SparkSession.builder.appName("UsersBatchAnalysis").getOrCreate()
spark.sparkContext.setLogLevel("WARN")

# Schéma des fichiers JSON d'utilisateurs
schema = StructType([
    StructField("name", StringType()),
    StructField("age", IntegerType()),
    StructField("city", StringType())
])

# Emplacements génériques (à adapter)
base_in = "hdfs://namenode:9000/your_hdfs_path/your_directory_path"
base_out = "hdfs://namenode:9000/your_hdfs_path/your_directory_path"
# Lecture des users ingérés par le job streaming
df = spark.read.load(f"{base_in}/users_raw", format="json", schema=schema)

print("\n\nSauvegardes des agrégations...")

# 1) Comptage par ville
df.groupBy("city").count() \
  .write.mode("overwrite") \
  .json(f"{base_out}/aggregations/by_city")

# 2) Ajout d'un champ de groupe d'âge (cohérent avec le streaming)
df_age = df.withColumn(
    "age_group",
    when(col("age") < 18, "minor") \
    .when((col("age") >= 18) & (col("age") < 65), "adult") \
    .otherwise("senior")
)

# 3) Comptage par groupe d'âge
df_age.groupBy("age_group").count() \
  .write.mode("overwrite") \
  .json(f"{base_out}/aggregations/by_age_group")

# 4) Créer un dossier par ville avec ses utilisateurs
cities = [r["city"] for r in df.select("city").distinct().collect()]
for c in cities:
    df.filter(col("city") == c) \
      .write.mode("overwrite") \
      .json(f"{base_out}/users_by_city/{c}")

# 5) Top 5 utilisateurs les plus âgés
df.select("name", "age", "city") \
  .orderBy(col("age").desc()) \
  .limit(5) \
  .write.mode("overwrite") \
  .json(f"{base_out}/top5_oldest")

print("Terminé.")
