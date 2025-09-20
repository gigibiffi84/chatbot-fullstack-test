# CORE / DOMAIN LAYER
# Definisce la logica di business e i modelli di dati indipendenti
# da qualsiasi dettaglio tecnologico esterno.

class Task:
    def __init__(self, id, title, done=False):
        self.id = id
        self.title = title
        self.done = done

    def to_dict(self):
        return {'id': self.id, 'title': self.title, 'done': self.done}