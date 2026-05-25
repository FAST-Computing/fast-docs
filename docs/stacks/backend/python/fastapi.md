---
outline: deep
---

# <img src="/logos/fastapilogo.svg" style="display: inline-block; vertical-align: middle; height: 48px; margin-right: 8px"> FastAPI

FastAPI is a modern, fast (high-performance), web framework for building APIs with Python based on standard Python type hints.

It provides:
- Speed: It is one of the fastest Python frameworks available.
- Auto-Documentation: It automatically generates interactive API documentation (Swagger UI) at `/docs`. You can test your API directly from the browser without any extra tools.
- Fewer Bugs: It uses Python type hints to catch errors early. If you expect an int and get a string, FastAPI automatically sends back a helpful error message to the client.
- Standards-Based: It is built on open standards like JSON Schema and OAuth2.

## Installation

::: code-group

```sh [pip]
pip install fastapi
```

```sh [uv]
uv add fastapi
```

```sh [micromamba]
micromamba install fastapi
```

:::

## Usage Example

```python
from fastapi import FastAPI

# 1. Create the application instance
app = FastAPI()

# 2. Define a "Path Operation" (Route)
@app.get("/")
async def root():
    return {"message": "Welcome to the API"}

# 3. Path Parameters
@app.get("/users/{user_id}")
async def get_user(user_id: int):
    return {"user_id": user_id, "status": "active"}

# 4. Query Parameters
@app.get("/search")
async def search(query: str, limit: int = 10):
    return {"results": f"Searching for {query}", "limit": limit}
```

Run the server using typing `uvicorn <path_to_fastapi_file>:app --reload` in the terminal, in the project root folder.

::: info
The path may be a simple `main`, or something like `backend.api` (no slashes, subfolder separation is with dots), or whatever you want.
:::


### Pydantic Integration

```python
from pydantic import BaseModel

class Item(BaseModel):
    name: str
    price: float

@app.post("/items/")
async def create_item(item: Item):
    return item
```

### CORS

Critical for any frontend-backend setup (for example, Next.js calling the API). Without it, browsers will block requests:

```python
from fastapi.middleware.cors import CORSMiddleware

app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000"],  # frontend URL
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)
```

### Response Models

Very practical: prevents accidentally exposing sensible or unwanted fields in responses:

```python
class UserOut(BaseModel):
    id: int
    username: str

@app.get("/users/{id}", response_model=UserOut)
async def get_user(id: int): ...
```

### Error Handling

```python
from fastapi import HTTPException

@app.get("/users/{user_id}")
async def get_user(user_id: int):
    if user_id not in db:
        raise HTTPException(status_code=404, detail="User not found")
```


### Dependency Injection

FastAPI's `Depends` system is a standout feature used for auth, DB sessions, etc. Even a one-liner pointing to the concept is useful:

```python
from fastapi import Depends

def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()

@app.get("/items/")
def read_items(db = Depends(get_db)): ...
```

---

See additional examples on the official docs: https://fastapi.tiangolo.com/