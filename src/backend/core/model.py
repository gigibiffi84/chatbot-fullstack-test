# CORE / DOMAIN LAYER
# Definisce la logica di business e i modelli di dati indipendenti
# da qualsiasi dettaglio tecnologico esterno.

class Task:
    def __init__(self, uuid, msg, msgresponse, done=False):
        self.uuid = uuid
        self.msg = msg
        self.done = done
        self.msgresponse= msgresponse

    def to_dict(self):
        return {'uuid': self.uuid,  'msg': self.msg, 'done': self.done, 'msgresponse': self.msgresponse}