# app.py

import os
import uuid
from flask import Flask, send_from_directory, jsonify, request, redirect, url_for, session
from flask_swagger_ui import get_swaggerui_blueprint
from flasgger import Swagger  # Importa la libreria Flasgger
import threading
import time
import random


from flask_cors import CORS

from infrastructure.repository import InMemoryTaskRepository, InMemoryTaskStore
from src.backend.service.service import TaskServiceSession

TASK_STORE = InMemoryTaskStore()
try:
    from flask import g
except Exception:
    g = None  # opzionale, permette di importare questo modulo anche senza Flask

def get_task_repository(client_id: str) -> InMemoryTaskRepository:
    """
    Ritorna un repository per-request (se in contesto Flask),
    altrimenti una nuova istanza stateless che usa lo store condiviso.
    """
    if g is not None:
        attr_name = f"_task_repo_{client_id}"
        repo = getattr(g, attr_name, None)
        if repo is None:
            repo = InMemoryTaskRepository(store=TASK_STORE, client_id=client_id)
            g._task_repo = repo
        return repo
    # Fallback: istanza nuova stateless (stesso store condiviso)
    return InMemoryTaskRepository(store=TASK_STORE, client_id=client_id)


#app = Flask(__name__)
app = Flask(__name__, static_folder='frontend/chatbot-ai-fe/dist', static_url_path='/static')
app.secret_key = 'tropp-secret' # Change this to a long, random string!
swagger = Swagger(app)



# Route per reindirizzare automaticamente
@app.route('/docs')
def docs():
    return redirect(url_for('swagger_ui.show_swagger_ui'))


@app.route('/api/newchat', methods=['POST'])
def new_chat():
    """
    Create a new chat session
    This endpoint creates a new chat session with a unique client ID.
    ---
    tags:
      - Chat
    responses:
      200:
        description: New chat session created successfully.
        schema:
          type: object
          properties:
            client_id:
              type: string
              format: uuid
    """
    session['client_id'] = str(uuid.uuid4())
    return jsonify({"client_id": session['client_id']})


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

#app = Flask(__name__)
#CORS(app)
#swagger = Swagger(app)

# Inizializzazione degli strati dell'architettura
#task_repository = InMemoryTaskRepository()
#ßtask_service = TaskService(repository=task_repository)


@app.route('/api/me')
def home():
    client_id = get_or_create_client_id()
    return f"Your client ID is: {client_id}"

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
                  uuid:
                    type: string
                    format: uuid
                  msg:
                    type: string
                  done:
                    type: boolean
    """
    client_id = get_or_create_client_id()
    repo = get_task_repository(client_id)

    return jsonify(repo.get_all())


# Endpoint API per ottenere una singola attività
@app.route('/api/tasks/<string:task_id>', methods=['GET'])
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
        type: string
        format: uuid
        required: true
        description: UUID dell'attività.
    responses:
      200:
        description: Dettagli dell'attività.
        schema:
          type: object
          properties:
            task:
              type: object
              properties:
                uuid:
                  type: string
                  format: uuid
                msg:
                  type: string
                done:
                  type: boolean
      404:
        description: Attività non trovata.
    """
    client_id = get_or_create_client_id()

    repo = get_task_repository(client_id)
    task = repo.get_by_id(task_id)
    if task is None:
        return jsonify({"error": "Task non trovata"}), 404
    return jsonify(task)


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
            uuid:
              type: string
              format: uuid
            msg:
              type: string
              example: "Testo della nuova attività"
            fileStructures:
              type: array
              items:
                type: object
                properties:
                  filename:
                    type: string
                  contentType:
                    type: string
              example:
                - filename: "Luigi_Bifulco_-_Cover_Letter.pdf"
                  contentType: "application/pdf"
            blobs:
              type: array
              items:
                type: string
              description: "Contenuti file in Base64. Deve avere la stessa lunghezza di fileStructures."
          required:
            - uuid
            - msg
    responses:
      201:
        description: Attività creata con successo.
        schema:
          type: object
          properties:
            task:
              type: object
              properties:
                uuid:
                  type: string
                  format: uuid
                msg:
                  type: string
                done:
                  type: boolean
      400:
        description: Dati non validi.
    """
    data = request.get_json(silent=True) or {}
    title = data.get("msg")
    uuid = data.get("uuid")
    file_structures = data.get("fileStructures") or []
    blobs = data.get("blobs") or []

    if not uuid:
        return jsonify({"error": "Campo 'uuid' obbligatorio"}), 400
    if not title:
        return jsonify({"error": "Campo 'msg' obbligatorio"}), 400
    # Validazione correlazione fileStructures/blobs
    if file_structures and not isinstance(file_structures, list):
        return jsonify({"error": "Campo 'fileStructures' deve essere un array"}), 400
    if blobs and not isinstance(blobs, list):
        return jsonify({"error": "Campo 'blobs' deve essere un array"}), 400
    if file_structures and len(file_structures) != len(blobs):
        return jsonify({"error": "La lunghezza di 'fileStructures' e 'blobs' deve coincidere"}), 400

    client_id = get_or_create_client_id()
    repo = get_task_repository(client_id)
    service = TaskServiceSession(repo)
    task = service.createTask(uuid, title, file_structures=file_structures, blobs=blobs)

    return jsonify({"task": task}), 201


# Endpoint API per aggiornare un'attività esistente
@app.route('/api/tasks/<string:task_id>', methods=['PUT'])
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
        type: string
        format: uuid
        required: true
        description: UUID dell'attività da aggiornare.
      - name: body
        in: body
        required: true
        schema:
          type: object
          properties:
            msg:
              type: string
            done:
              type: boolean
    responses:
      200:
        description: Attività aggiornata con successo.
        schema:
          type: object
          properties:
            task:
              type: object
              properties:
                uuid:
                  type: string
                  format: uuid
                msg:
                  type: string
                done:
                  type: boolean
      400:
        description: Dati non validi.
      404:
        description: Attività non trovata.
    """
    data = request.get_json(silent=True) or {}
    client_id = get_or_create_client_id()

    repo = get_task_repository(client_id)
    updated = repo.update(task_id, data)
    if updated is None:
        return jsonify({"error": "Task non trovata"}), 404
    return jsonify({"task": updated})


# Endpoint API per eliminare un'attività
@app.route('/api/tasks/<string:task_id>', methods=['DELETE'])
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
        type: string
        format: uuid
        required: true
        description: UUID dell'attività da eliminare.
    responses:
      200:
        description: Attività eliminata con successo.
      404:
        description: Attività non trovata.
    """

    client_id = get_or_create_client_id()
    repo = get_task_repository(client_id)
    ok = repo.delete(task_id)
    if not ok:
        return jsonify({"error": "Task non trovata"}), 404
    return jsonify({"result": True})


@app.route('/api/tasks/<string:task_id>/files/<int:file_idx>', methods=['GET'])
def get_task_files(task_id: str, file_idx: int = 0):
    """
    File allegati dell'attività
    Questo endpoint restituisce esclusivamente fileStructures e blobs per la task indicata.
    ---
    tags:
      - Attività
    parameters:
      - name: task_id
        in: path
        type: string
        required: true
        description: ID della task.
      - name: file_idx
        in: path
        type: integer
        required: true
        description: Indice del file da prelevare
    responses:
      200:
        description: File della task.
        schema:
          type: object
          properties:
            taskId:
              type: string
            fileStructures:
              type: array
              items:
                type: object
            blobs:
              type: array
              items:
                type: string
      404:
        description: Attività non trovata.
    """
    client_id = get_or_create_client_id()
    repo = get_task_repository(client_id)
    files = repo.get_by_id_with_attachments(task_id)

    if files is None:
        return jsonify({"error": "Task non trovata"}), 404
    return jsonify({
        "taskId": task_id,
        "fileStructures": [files.get("fileStructures", [])[file_idx]], #files.get("fileStructures", []),
        "blobs": [files.get("blobs", [])[file_idx]]
    })
# ..




def get_or_create_client_id():
    # Check if 'client_id' exists in the session.
    # The session object is a dictionary-like container.
    if 'client_id' not in session:
        # If not, generate a new UUID and store it in the session.
        session['client_id'] = str(uuid.uuid4())
    # Return the client ID.
    return session['client_id']

# def get_or_create_client_id():
#     client_id = request.cookies.get('client_id')
#     response = make_response()
#     if not client_id:
#         user_id = str(uuid.uuid4())
#         response.set_cookie('client_id', user_id, httponly=True, samesite='Lax')
#     return client_id, response

if __name__ == '__main__':
    port = int(os.environ.get("PORT", 3000))
    app.run(debug=True, host='0.0.0.0', port=port)