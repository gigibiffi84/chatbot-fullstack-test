# app.py

import os
from flask import Flask, send_from_directory, jsonify, request, redirect, url_for
from flask_swagger_ui import get_swaggerui_blueprint
from flasgger import Swagger  # Importa la libreria Flasgger

from flask_cors import CORS

from infrastructure.repository import  InMemoryTaskRepository
from service.service import TaskService

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


# MAIN APPLICATION / API ADAPTER
# Il livello più esterno che utilizza il servizio per esporre la funzionalità tramite
# l'interfaccia web (in questo caso, Flask).

app = Flask(__name__)
CORS(app)
swagger = Swagger(app)

# Inizializzazione degli strati dell'architettura
task_repository = InMemoryTaskRepository()
task_service = TaskService(repository=task_repository)


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
    all_tasks = task_service.get_all_tasks()
    return jsonify({'tasks': all_tasks})


# Endpoint API per ottenere una singola attività
@app.route('/api/tasks/<int:task_id>', methods=['GET'])
def get_task(task_id):
    """
    Dettagli di un'attività
    Questo endpoint restituisce i dettagli di una singola attività tramite il suo ID.
    ---
    tags:
      - Attività
    parameters:
      - name: task_id
        in: path
        type: integer
        required: true
        description: ID dell'attività.
    responses:
      200:
        description: Dettagli dell'attività.
      404:
        description: Attività non trovata.
    """
    task = task_service.get_task_by_id(task_id)
    if task is None:
        return jsonify({'error': 'Attività non trovata'}), 404
    return jsonify({'task': task})


# Endpoint API per creare una nuova attività
@app.route('/api/tasks', methods=['POST'])
def create_task():
    """
    Crea una nuova attività
    Questo endpoint aggiunge una nuova attività all'elenco.
    ---
    tags:
      - Attività
    parameters:
      - name: body
        in: body
        required: true
        schema:
          type: object
          properties:
            title:
              type: string
              example: "Nome della nuova attività"
          required:
            - title
    responses:
      201:
        description: Attività creata con successo.
      400:
        description: Dati non validi.
    """
    if not request.json or 'title' not in request.json:
        return jsonify({'error': 'Dati non validi'}), 400

    new_task = task_service.add_task(request.json)
    return jsonify({'task': new_task}), 201


# Endpoint API per aggiornare un'attività esistente
@app.route('/api/tasks/<int:task_id>', methods=['PUT'])
def update_task(task_id):
    """
    Aggiorna un'attività esistente
    Questo endpoint aggiorna un'attività tramite il suo ID.
    ---
    tags:
      - Attività
    parameters:
      - name: task_id
        in: path
        type: integer
        required: true
        description: ID dell'attività da aggiornare.
      - name: body
        in: body
        required: true
        schema:
          type: object
          properties:
            title:
              type: string
            done:
              type: boolean
    responses:
      200:
        description: Attività aggiornata con successo.
      400:
        description: Dati non validi.
      404:
        description: Attività non trovata.
    """
    if not request.json:
        return jsonify({'error': 'Dati non validi'}), 400

    task = task_service.update_task(task_id, request.json)
    if task is None:
        return jsonify({'error': 'Attività non trovata'}), 404

    return jsonify({'task': task})


# Endpoint API per eliminare un'attività
@app.route('/api/tasks/<int:task_id>', methods=['DELETE'])
def delete_task(task_id):
    """
    Elimina un'attività
    Questo endpoint elimina un'attività tramite il suo ID.
    ---
    tags:
      - Attività
    parameters:
      - name: task_id
        in: path
        type: integer
        required: true
        description: ID dell'attività da eliminare.
    responses:
      200:
        description: Attività eliminata con successo.
      404:
        description: Attività non trovata.
    """
    is_deleted = task_service.delete_task(task_id)
    if not is_deleted:
        return jsonify({'error': 'Attività non trovata'}), 404

    return jsonify({'result': True})


if __name__ == '__main__':
    port = int(os.environ.get("PORT", 3000))
    app.run(debug=True, host='0.0.0.0', port=port)
