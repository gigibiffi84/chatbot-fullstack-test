from src.backend.core.model import Task


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

    def update(self, task):
        raise NotImplementedError

    def delete(self, task_id):
        raise NotImplementedError


# INFRASTRUCTURE / ADAPTERS
# Implementazioni concrete dell'interfaccia del repository.
# Questo è dove i dettagli specifici del database (in questo caso, una lista in memoria)
# sono gestiti.

class InMemoryTaskRepository(TaskRepository):
    def __init__(self):
        # Dati di esempio
        self.tasks = [
            Task(id=1, title='Imparare Flask', done=False),
            Task(id=2, title='Costruire un\'API REST', done=True),
            Task(id=3, title='Integrare il frontend React', done=False)
        ]
        self.current_id = 3

    def get_all(self):
        return [task.to_dict() for task in self.tasks]

    def get_by_id(self, task_id):
        return next((task.to_dict() for task in self.tasks if task.id == task_id), None)

    def create(self, task_data):
        self.current_id += 1
        new_task = Task(id=self.current_id, title=task_data['title'], done=False)
        self.tasks.append(new_task)
        return new_task.to_dict()

    def update(self, task_id, task_data):
        task = next((t for t in self.tasks if t.id == task_id), None)
        if task is None:
            return None

        task.title = task_data.get('title', task.title)
        task.done = task_data.get('done', task.done)
        return task.to_dict()

    def delete(self, task_id):
        initial_len = len(self.tasks)
        self.tasks = [t for t in self.tasks if t.id != task_id]
        return len(self.tasks) < initial_len