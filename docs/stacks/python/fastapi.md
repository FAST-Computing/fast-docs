---
outline: deep
---

# <img src="/logos/fastapilogo.svg" style="display: inline-block; vertical-align: middle; height: 48px; margin-right: 8px"> FastAPI

FastAPI is a modern, fast (high-performance), web framework for building APIs with Python based on standard Python type hints.

It provides:
- Speed: It is one of the fastest Python frameworks available.
. Auto-Documentation: It automatically generates interactive API documentation (Swagger UI) at /docs. You can test your API directly from the browser without any extra tools.
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

