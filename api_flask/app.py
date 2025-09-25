from flask import Flask, request, jsonify
import requests
from flask_cors import CORS

from pyspark.sql import SparkSession
from pyspark.sql.functions import col, min as spark_min, max as spark_max
from pyspark.sql.types import StructType, StructField, LongType, StringType, DoubleType, IntegerType

app = Flask(__name__)
CORS(app)

# Initialiser SparkSession (une seule fois au démarrage)
spark = SparkSession.builder \
    .appName("FlaskSparkKlines") \
    .master("local[*]") \
    .getOrCreate()

BINANCE_KLINES_URL = "https://api.binance.com/api/v3/klines"

def get_transformed_klines(symbol, interval, start_time=None, end_time=None):
    params = {
        "symbol": symbol,
        "interval": interval
    }
    if start_time is not None:
        params["startTime"] = start_time
    if end_time is not None:
        params["endTime"] = end_time

    resp = requests.get(BINANCE_KLINES_URL, params=params)
    if resp.status_code != 200:
        return None, {"error": "Erreur API Binance", "status_code": resp.status_code, "text": resp.text}

    data = resp.json()
    # Transformer chaque kline en dict
    def transform_kline(kline):
        return {
            "open_time": kline[0],
            "open_price": float(kline[1]),
            "high_price": float(kline[2]),
            "low_price": float(kline[3]),
            "close_price": float(kline[4]),
            "volume": float(kline[5]),
            "close_time": kline[6],
            "quote_asset_volume": float(kline[7]),
            "num_trades": int(kline[8]),
            "taker_buy_base_volume": float(kline[9]),
            "taker_buy_quote_volume": float(kline[10]),
            # on ignore kline[11]
        }
    transformed = [transform_kline(k) for k in data]
    return transformed, None

@app.route('/klines', methods=['GET'])
def klines_route():
    symbol = request.args.get('symbol')
    interval = request.args.get('interval')
    start_time = request.args.get('startTime', type=int)
    end_time = request.args.get('endTime', type=int)

    if not symbol or not interval:
        return jsonify({"error": "symbol et interval sont requis"}), 400

    transformed, err = get_transformed_klines(symbol, interval, start_time, end_time)
    if err:
        return jsonify(err), err.get("status_code", 500)

    # Si pas de données, renvoyer vide
    if not transformed:
        return jsonify({"data": [], "min_price": None, "max_price": None})

    # Définir un schéma Spark (optionnel, mais aide)
    schema = StructType([
        StructField("open_time", LongType(), True),
        StructField("open_price", DoubleType(), True),
        StructField("high_price", DoubleType(), True),
        StructField("low_price", DoubleType(), True),
        StructField("close_price", DoubleType(), True),
        StructField("volume", DoubleType(), True),
        StructField("close_time", LongType(), True),
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
