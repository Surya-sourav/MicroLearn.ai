# backend/Dockerfile

FROM python:3.11-slim

# 1) Set working directory
WORKDIR /app

# 2) Copy only requirements and install dependencies
COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

# 3) Expose FastAPI port
EXPOSE 8000

# 4) Default to a noop; Compose supplies the actual commands
CMD ["bash"]
