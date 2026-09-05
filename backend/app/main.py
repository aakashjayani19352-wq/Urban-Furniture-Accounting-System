from fastapi import FastAPI

app = FastAPI(title="Urban Furniture Accounting System API")

@app.get("/")
def read_root():
    return {"message": "Welcome to Urban Furniture Accounting System API"}
