from flask import Flask, jsonify, request
from hdfs import InsecureClient
from flask_cors import CORS
import json

app = Flask(__name__)
CORS(app)

# Connexion au HDFS Web UI exposé par le NameNode
hdfs_client = InsecureClient("http://namenode:9870", user="hdfs")

def read_json_folder(folder_path):
    try:
        files = hdfs_client.list(folder_path)
        all_data = []
        for f in files:
            if f.endswith(".json") or f.startswith("part-"):
                with hdfs_client.read(f"{folder_path}/{f}") as reader:
                    for line in reader:
                        if line.strip():
                            all_data.append(json.loads(line))
        return all_data
    except Exception as e:
        return {"error": str(e)}


# Objets détectés (bruts) avec pagination
@app.route("/objects", methods=["GET"])
def get_paginated_objects():
    page = int(request.args.get("page", 1))
    limit = int(request.args.get("limit", 100))

    all_data = read_json_folder("/objects")
    total = len(all_data)

    start = (page - 1) * limit
    end = start + limit
    paginated = all_data[start:end]

    return jsonify({
        "page": page,
        "limit": limit,
        "total": total,
        "pages": (total + limit - 1) // limit,  # nombre total de pages
        "data": paginated
    })

#objets par type
@app.route("/objects/type", methods=["GET"])
def get_all_types_grouped():
    try:
        type_folders = hdfs_client.list("/objectsType")
        grouped_data = {}
        for type_name in type_folders:
            type_data = read_json_folder(f"/objectsType/{type_name}")
            grouped_data[type_name] = type_data
        return jsonify(grouped_data)
    except Exception as e:
        return jsonify({"error": str(e)})
    
# Statistiques par type d’objet céleste
@app.route("/objects/count", methods=["GET"])
def get_type_stats():
    return jsonify(read_json_folder("/objects/type"))

#Top 5 des objets les plus rapides
@app.route("/objects/top5", methods=["GET"])
def get_top5_objects():
    return jsonify(read_json_folder("/objects/top5"))

#Objets dangereux (alertes)
@app.route("/alerts", methods=["GET"])
def get_alerts():
    return jsonify(read_json_folder("/alerts"))

if __name__ == "__main__":
    app.run(host="0.0.0.0", port=5000)
