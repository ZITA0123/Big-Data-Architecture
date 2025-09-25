import requests
from datetime import datetime
import os
import json
import subprocess
from hdfs import InsecureClient


client = InsecureClient("http://namenode:9870", user="root")

def add_data(symbol, data_list):
    os.makedirs(symbol, exist_ok=True)
    hdfs_dir = f"/data/{symbol}/"

    # Boucle sur chaque jour de données
    for data in data_list:
        date_str = data["open_time"] 
        filename = f"{date_str}.json"
        local_path = os.path.join(symbol, filename)
        hdfs_path = os.path.join(hdfs_dir, filename)


        with client.write(hdfs_path, encoding='utf-8', overwrite=True, blocksize=1024*1024) as writer:
            json.dump(data, writer)
            print(f"✅ {hdfs_path} écrit avec succès")




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
            "open_time": datetime.fromtimestamp(kline[0] / 1000).strftime("%d-%m-%Y"),
            "open_price": float(kline[1]),
            "high_price": float(kline[2]),
            "low_price": float(kline[3]),
            "close_price": float(kline[4]),
            "volume": float(kline[5]),
            "close_time": datetime.fromtimestamp(kline[6] / 1000).strftime("%d-%m-%Y"),
            "quote_asset_volume": float(kline[7]),
            "num_trades": int(kline[8]),
            "taker_buy_base_volume": float(kline[9]),
            "taker_buy_quote_volume": float(kline[10]),
        }
    transformed = [transform_kline(k) for k in data]
    return transformed, None


def data_year(symbol):
    transformed, err = get_transformed_klines(symbol, "1d", 1727189129000, 1758725129000)
    if err:
        print(err)
    else:
        add_data(symbol, transformed)

data_year("BTCUSDT")