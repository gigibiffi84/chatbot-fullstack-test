# chatbot-fullstack-test
A python + react project to test an API that simulates an interaction with a generative AI model

# Run backend
Con IDE PyCharm configurare virtualenv e lanciare il progetto con il file app.py presente nella folder backend

# Run frontend
Installare node 20+ e pnpm
Lanciare pnpm install dalla folder frontend
Lanciare il task pnpm run dev per avviare il frontend

Il frontend è un progetto VITE che usa un proxy di sviluppo per puntare correttamente al backend
In modalità container il FE viene servito direttamente dal backend (vedi Dockerfile)

# Docker build and test container
docker build -t chatbot-fullstack-test .
docker run -p 8000:8000 chatbot-fullstack-test
Successivamente aprire dal browser la URL http://localhost:8000/

# Per provare tutto lo stack
Dalla folder root eseguire:
docker compose up
Successivamente aprire dal browser la URL http://localhost:8888/

### Note del lavoro svolto e punti aperti:

1) Created env webdev_env
2) Activated env con bin/activate
3) pip install Flask
4) Adjusted settings to use custom env name (standard follows env .venv)
5) Created app.py di prova e debug con PyCharm
6) install pnpm
7) brew install pnpm
8) create vite react app
9) http://127.0.0.1:3000/apidocs/#/ added swagger
10) Scaffold backend app with exagonal layers
11) Add specific client_id session bound to http session
12) Add client_id to service for key
13) Add async operation on current user session task to update it
14) Added FE scaffolding
15) Added FE+BE logic integration (send message, poll for response, show response)
16) Added files integration with fileStructures and blobs as base64
17) Added fact check compare with pdf viewer
18) Created Dockerfile multi stage to build backend and frontend
19) TODO: validate create task with attachements to get only pdf files
20) TODO: load all task list in session and enable fact check for just completed tasks
21) split async operations to update task in two states: file ingestion, ai response received
22) reate docker image and docker compose to test it like production
