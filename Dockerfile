# 1) Frontend builder
FROM node:20-alpine AS frontend-builder
WORKDIR /app/src/frontend/chatbot-ai-fe
# Copy only package manager files first for better caching
COPY src/frontend/chatbot-ai-fe/package.json src/frontend/chatbot-ai-fe/pnpm-lock.yaml ./
RUN corepack enable && corepack prepare pnpm@latest --activate
RUN pnpm install --frozen-lockfile
# Copy the rest and build
COPY src/frontend/chatbot-ai-fe ./
RUN pnpm build

# ---
# 2) Backend builder (no BuildKit)
# ---
FROM python:3.12-slim AS backend-builder
ENV PYTHONDONTWRITEBYTECODE=1 \
    PYTHONUNBUFFERED=1
WORKDIR /app/src/backend
# Se usi requirements.txt
COPY src/backend/requirements.txt ./requirements.txt
# Sostituito l'uso di --mount con un approccio standard per la cache di pip
RUN pip wheel --wheel-dir /wheels -r requirements.txt
# In alternativa con pyproject.toml:
# COPY src/backend/pyproject.toml src/backend/poetry.lock* ./
# RUN pip install --no-cache-dir poetry && poetry build -f wheel && mkdir -p /wheels && cp dist/*.whl /wheels/

# ---
# 3) Final runtime image
# ---
FROM python:3.12-slim AS runtime
ENV PYTHONDONTWRITEBYTECODE=1 \
    PYTHONUNBUFFERED=1 \
    GUNICORN_CMD_ARGS="--bind 0.0.0.0:8000 --workers 1 --threads 4 --worker-class gthread --timeout 90 --access-logfile - --error-logfile -"
WORKDIR /app

# Create a non-root user
RUN addgroup --system app && adduser --system --ingroup app app

# Install runtime deps only (no dev/build chain), using prebuilt wheels
COPY --from=backend-builder /wheels /wheels
RUN pip install --no-cache-dir --no-warn-script-location /wheels/* && rm -rf /wheels

# Copy ONLY the Python backend source
COPY src/backend /app/src/backend

# Copy frontend build output to the exact path Flask expects (../frontend/chatbot-ai-fe/dist)
COPY --from=frontend-builder /app/src/frontend/chatbot-ai-fe/dist /app/src/frontend/chatbot-ai-fe/dist


# Optionally, set Flask-related envs (adjust module as needed)
ENV FLASK_ENV=production \
    PYTHONPATH=/app

# Drop privileges
USER app

# Expose the gunicorn port (Nginx will connect to this)
EXPOSE 8000

# Run the Flask app via gunicorn
# CMD ["sh", "-c", "gunicorn backend.app:app"]
CMD ["sh", "-c", "gunicorn --workers 1 --threads 4 --worker-class gthread src.backend.app:app"]
