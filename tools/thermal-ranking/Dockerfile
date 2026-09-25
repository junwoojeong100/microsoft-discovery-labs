FROM python:3.13-slim
WORKDIR /app
COPY scripts/score_materials.py /app/score_materials.py
COPY data/materials.csv /app/materials.csv
CMD ["python", "/app/score_materials.py", "--input", "/app/materials.csv"]
