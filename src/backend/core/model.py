# CORE / DOMAIN LAYER
# Definisce la logica di business e i modelli di dati indipendenti
# da qualsiasi dettaglio tecnologico esterno.

class Task:
    def __init__(self, uuid, msg, msgresponse, done=False,  file_structures=None, blobs=None):
        self.uuid = uuid
        self.msg = msg
        self.done = done
        self.msgresponse= msgresponse
        # fields for attachments
        self.file_structures = file_structures or []
        self.blobs = blobs or []

    def to_dict(self):
        return {'uuid': self.uuid,  'msg': self.msg, 'done': self.done, 'msgresponse': self.msgresponse}