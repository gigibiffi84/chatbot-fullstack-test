# SERVICE LAYER
# Contiene la logica di business.
# Non sa nulla dell'implementazione del database, interagisce solo con l'interfaccia del repository.
from src.backend.infrastructure.repository import TaskRepository


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