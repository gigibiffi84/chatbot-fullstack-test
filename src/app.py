# app.py

import os
from flask import Flask, send_from_directory, jsonify, request, redirect, url_for
from flask_swagger_ui import get_swaggerui_blueprint
from flasgger import Swagger  # Importa la libreria Flasgger

from flask_cors import CORS

#app = Flask(__name__)
app = Flask(__name__, static_folder='frontend/chatbot-ai-fe/dist', static_url_path='/static')
swagger = Swagger(app)


# Route per reindirizzare automaticamente
@app.route('/docs')
def docs():
    return redirect(url_for('swagger_ui.show_swagger_ui'))

@app.route("/")
def serve_react_app():
    return send_from_directory(app.static_folder, 'index.html')

@app.route("/<path:path>")
def serve_static_assets(path):
    if path != "" and os.path.exists(os.path.join(app.static_folder, path)):
        return send_from_directory(app.static_folder, path)
    else:
        return send_from_directory(app.static_folder, 'index.html')
CORS(app)

# Dati di esempio per l'API
tasks = [
    {'id': 1, 'title': 'Imparare Flask', 'done': False},
    {'id': 2, 'title': 'Costruire un\'API REST', 'done': True},
    {'id': 3, 'title': 'Integrare il frontend React', 'done': False}
]


# Endpoint API per ottenere tutte le attività
@app.route('/api/tasks', methods=['GET'])
def get_tasks():
    """
    Lista delle attività
    Questo endpoint restituisce un elenco di tutte le attività.
    ---
    tags:
      - Attività
    responses:
      200:
        description: Un elenco di attività.
        schema:
          type: object
          properties:
            tasks:
              type: array
              items:
                type: object
                properties:
                  id:
                    type: integer
                  title:
                    type: string
                  done:
                    type: boolean
    """
    return jsonify({'tasks': tasks})


# Endpoint API per ottenere una singola attività
@app.route('/api/tasks/<int:task_id>', methods=['GET'])
def get_task(task_id):
    task = next((t for t in tasks if t['id'] == task_id), None)
    if task is None:
        return jsonify({'error': 'Attività non trovata'}), 404
    return jsonify({'task': task})


# Endpoint API per creare una nuova attività
@app.route('/api/tasks', methods=['POST'])
def create_task():
    if not request.json or 'title' not in request.json:
        return jsonify({'error': 'Dati non validi'}), 400

    new_task = {
        'id': tasks[-1]['id'] + 1 if tasks else 1,
        'title': request.json['title'],
        'done': False
    }
    tasks.append(new_task)
    return jsonify({'task': new_task}), 201


# Endpoint API per aggiornare un'attività esistente
@app.route('/api/tasks/<int:task_id>', methods=['PUT'])
def update_task(task_id):
    task = next((t for t in tasks if t['id'] == task_id), None)
    if task is None:
        return jsonify({'error': 'Attività non trovata'}), 404

    if not request.json:
        return jsonify({'error': 'Dati non validi'}), 400

    task['title'] = request.json.get('title', task['title'])
    task['done'] = request.json.get('done', task['done'])
    return jsonify({'task': task})


# Endpoint API per eliminare un'attività
@app.route('/api/tasks/<int:task_id>', methods=['DELETE'])
def delete_task(task_id):
    global tasks
    tasks = [t for t in tasks if t['id'] != task_id]
    return jsonify({'result': True})


if __name__ == '__main__':
    port = int(os.environ.get("PORT", 3000))
    app.run(debug=True, host='0.0.0.0', port=port)
