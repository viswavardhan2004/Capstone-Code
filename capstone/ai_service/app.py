import os
from flask import Flask, request, jsonify

app = Flask(__name__)

# --- START OF USER ADDED LINES ---
from sentence_transformers import SentenceTransformer
from pymongo import MongoClient

embedding_model = SentenceTransformer('all-MiniLM-L6-v2')
# This downloads once on first run (~80MB), then loads from cache

@app.route('/rag/similar', methods=['POST'])
def rag_similar():
    data = request.get_json()
    description = data.get('description', '')
    query_vector = embedding_model.encode(description).tolist()
    client = MongoClient(os.environ.get('MONGODB_URI', 'mongodb://localhost:27017/'))
    db = client['microjob']
    results = list(db.fraudalerts.aggregate([{
        '$vectorSearch': {
            'index': 'fraud_vector_index',
            'path': 'embedding',
            'queryVector': query_vector,
            'numCandidates': 50,
            'limit': 3
        }},
        { '$project': {
            'triggeredRules': 1, 'verdict': 1,
            'reviewStatus': 1, 'createdAt': 1,
            'score': { '$meta': 'vectorSearchScore' }
        }}
    ]))
    return jsonify({ 'similar_cases': results })
# --- END OF USER ADDED LINES ---

if __name__ == '__main__':
    app.run(port=5001, debug=True)
