from flask import Flask, request, jsonify
import requests
from flask_cors import CORS

from pyspark.sql import SparkSession
from pyspark.sql.functions import col, min as spark_min, max as spark_max
from pyspark.sql.types import StructType, StructField, LongType, StringType, DoubleType, IntegerType
from datetime import datetime
from hdfs import InsecureClient
from datetime import datetime, timedelta
import json


app = Flask(__name__)
CORS(app)

# Connexion au HDFS
client = InsecureClient('http://namenode:9870', user='root')


def get_klines(symbol, start_date, end_date):

    # Liste pour stocker les résultats
    result = []

    start_date = datetime.strptime(start_date, "%d-%m-%Y")
    end_date = datetime.strptime(end_date, "%d-%m-%Y")

    # Parcourir chaque jour entre start et end
    current = start_date
    while current <= end_date:
        date_str = current.strftime("%d-%m-%Y")
        hdfs_file_path = f"{symbol}/{date_str}.json"
        
        try:
            with client.read(hdfs_file_path, encoding='utf-8') as reader:
                data = json.load(reader)
                result.append(data)
                print(f"✅ {hdfs_file_path} lu avec succès")
        except Exception as e:
            print(f"⚠️  Fichier non trouvé ou erreur : {hdfs_file_path} - {e}")
        
        current += timedelta(days=1)
    return result


# Initialiser SparkSession (une seule fois au démarrage)
spark = SparkSession.builder \
    .appName("FlaskSparkKlines") \
    .master("local[*]") \
    .getOrCreate()



 



@app.route('/klines', methods=['GET'])
def klines_route():
    symbol = request.args.get('symbol')
    start_date = request.args.get('start', type=str)
    end_date = request.args.get('end', type=str)

    if not symbol:
        return jsonify({"error": "symbol est requis"}), 400

    transformed = get_klines(symbol, start_date, end_date)


    # Si pas de données, renvoyer vide
    if not transformed:
        return jsonify({"data": [], "min_price": None, "max_price": None})

    # Définir un schéma Spark (optionnel, mais aide)
    schema = StructType([
        StructField("open_time", StringType(), True),
        StructField("open_price", DoubleType(), True),
        StructField("high_price", DoubleType(), True),
        StructField("low_price", DoubleType(), True),
        StructField("close_price", DoubleType(), True),
        StructField("volume", DoubleType(), True),
        StructField("close_time", StringType(), True),
        StructField("quote_asset_volume", DoubleType(), True),
        StructField("num_trades", IntegerType(), True),
        StructField("taker_buy_base_volume", DoubleType(), True),
        StructField("taker_buy_quote_volume", DoubleType(), True),
    ])

    # Créer DataFrame Spark
    df = spark.createDataFrame(transformed, schema=schema)

    # Calculer le prix le plus bas et le plus haut — selon ce que tu veux utiliser (low_price, high_price, close_price, etc.)
    agg_res = df.agg(
        spark_min(col("low_price")).alias("min_low_price"),
        spark_max(col("high_price")).alias("max_high_price")
    ).collect()[0]

    min_low = agg_res["min_low_price"]
    max_high = agg_res["max_high_price"]

    # Préparer la réponse JSON
    response = {
        "data": transformed,
        "min_low_price": min_low,
        "max_high_price": max_high
    }

    return jsonify(response)


if __name__ == "__main__":
    app.run(host="0.0.0.0", port=5000)
