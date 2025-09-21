from src.backend.core.model import Task
import threading

# INFRASTRUCTURE / REPOSITORY LAYER
# Definisce l'interfaccia (l'Adattatore) per l'accesso ai dati.
# La logica di servizio lavorerà solo con questa interfaccia.

class TaskRepository:
    def get_all(self):
        raise NotImplementedError

    def get_by_id(self, task_id):
        raise NotImplementedError

    def create(self, task):
        raise NotImplementedError

    def update(self, task_id, task_data):
        raise NotImplementedError

    def delete(self, task_id):
        raise NotImplementedError



class InMemoryTaskStore:
    """
    Store condiviso thread-safe per i Task.
    - Mantiene i dati e il lock.
    - È pensato come singleton del processo.
    """
    def __init__(self):
        self._lock = threading.RLock()
        # Dati separati per client_id
        self._tasks_by_client: dict[str, list[Task]] = {}
        self._current_id_by_client: dict[str, int] = {}

    # Metodi di utilità protetti dal lock per operazioni atomiche
    def _ensure_client(self, client_id: str):
        if client_id not in self._tasks_by_client:
            self._tasks_by_client[client_id] = []
            self._current_id_by_client[client_id] = 0

    # def next_id(self, client_id: str) -> int:
    #     with self._lock:
    #         self._ensure_client(client_id)
    #         self._current_id_by_client[client_id] += 1
    #         return self._current_id_by_client[client_id]

    def get_tasks(self, client_id: str) -> list:
        with self._lock:
            self._ensure_client(client_id)
            return self._tasks_by_client[client_id]

    def set_tasks(self, client_id: str, tasks: list):
        with self._lock:
            self._ensure_client(client_id)
            self._tasks_by_client[client_id] = tasks

    def with_lock(self):
        """
        Context manager per operazioni consistenti multi-passaggio.
        Esempio:
            with store.with_lock():
                # leggi/modifica tasks in modo atomico
        """
        return self._lock



# Istanza singleton di store condiviso nel processo
TASK_STORE = InMemoryTaskStore()


# INFRASTRUCTURE / ADAPTER
# Repository senza stato proprio (stateless) che usa lo store condiviso.
class InMemoryTaskRepository(TaskRepository):
    def __init__(self, client_id: str, store: InMemoryTaskStore = TASK_STORE):
        self._store = store
        self._client_id = client_id

    def get_all(self):
        with self._store.with_lock():
            tasks = self._store.get_tasks(self._client_id)
            return [task.to_dict() for task in tasks]

    def get_by_id(self, task_id):
        with self._store.with_lock():
            tasks = self._store.get_tasks(self._client_id)
            found = next((task for task in tasks if task.uuid == task_id), None)
            return found.to_dict() if found else None

    def create(self, task_data):
        # next_id() è già thread-safe e namespaced per client
        # new_id = self._store.next_id(self._client_id)
        new_task = Task(
            uuid=task_data["uuid"],
            msg=task_data['msg'],
            done=False,
            msgresponse='',
            file_structures=task_data.get('fileStructures') or [],
            blobs=task_data.get('blobs') or []
        )
        with self._store.with_lock():
            tasks = self._store.get_tasks(self._client_id)
            tasks.append(new_task)
            self._store.set_tasks(self._client_id, tasks)
            return new_task.to_dict()

    def update(self, task_id, task_data):
        with self._store.with_lock():
            mocked_msg = "This is a mocked response from the chatbot. The task has been processed successfully and here's the simulated AI response to your question."
            tasks = self._store.get_tasks(self._client_id)
            task = next((t for t in tasks if t.uuid == task_id), None)
            if task is None:
                return None
            task.msg = task_data.get('msg', task.msg)
            task.msgresponse = mocked_msg + ' for question '+task.msg
            task.done = task_data.get('done', task.done)
            # opzionale: permetti aggiornamento degli allegati se forniti
            if 'fileStructures' in task_data:
                task.file_structures = task_data.get('fileStructures') or []
            if 'blobs' in task_data:
                task.blobs = task_data.get('blobs') or []
            return task.to_dict()

    def delete(self, task_id):
        with self._store.with_lock():
            tasks = self._store.get_tasks(self._client_id)
            initial_len = len(tasks)
            tasks = [t for t in tasks if t.uuid != task_id]
            self._store.set_tasks(self._client_id, tasks)
            return len(tasks) < initial_len

