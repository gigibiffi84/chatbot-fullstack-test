# SERVICE LAYER
# Contiene la logica di business.
# Non sa nulla dell'implementazione del database, interagisce solo con l'interfaccia del repository.
import random
import threading
import time
from concurrent.futures import ThreadPoolExecutor


from src.backend.infrastructure.repository import TaskRepository

# Esecutore thread-pool fisso per i job asincroni dell'app

EXECUTOR = ThreadPoolExecutor(max_workers=100)


class TaskServiceSession:
    """
    Servizio con scope di sessione:
    - prende client_id nel costruttore,
    - usa il repository per creare il task,
    - avvia un job asincrono che dopo X secondi imposta done=True.
    """
    def __init__(self, repository: TaskRepository):
        self._repo = repository

    def createTask(self, title: str) -> dict:
        created = self._repo.create({"title": title})
        task_id = created["id"]
        EXECUTOR.submit(self._complete_later, task_id)
        return created

    def _complete_later(self, task_id: int):
        delay = random.uniform(5.0, 10.0)
        time.sleep(delay)
        try:
            self._repo.update(task_id, {"done": True})
        except Exception:
            # Evita crash silenziosi del thread di background
            pass
            # Nuovo: recupero asincrono con ritardo opzionale e callback


    def getTask(self, task_id: int, callback=None, delay_seconds: float | None = None) -> None:
        """
        Avvia un job nel thread pool che, dopo un ritardo opzionale,
        richiama repository.get_by_id(task_id). Se viene fornito un callback,
        lo invoca con il risultato (anche None se non trovato).
        """
        EXECUTOR.submit(self._get_later, task_id, callback, delay_seconds)


    def _get_later(self, task_id: int, callback, delay_seconds: float | None):
        delay = delay_seconds if delay_seconds is not None else random.uniform(1.0, 4.0)
        time.sleep(delay)
        try:
            result = self._repo.get_by_id(task_id)
            if callable(callback):
                try:
                    callback(result)
                except Exception:
                    # Non propagare eccezioni del callback
                    pass
        except Exception:
            # Non propagare eccezioni del fetch asincrono
            pass

class TaskService:
    def __init__(self, repository: TaskRepository):
        self.repository = repository

    def get_all_tasks(self):
        return self.repository.get_all()

    def get_task_by_id(self, task_id):
        return self.repository.get_by_id(task_id)

    def add_task(self, task_data):
        return self.repository.create(task_data)

    def update_task(self, task_id, task_data):
        return self.repository.update(task_id, task_data)

    def delete_task(self, task_id):
        return self.repository.delete(task_id)