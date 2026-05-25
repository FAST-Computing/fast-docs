---
outline: deep
---

# <img src="/logos/pydantic.ico" style="display: inline-block; vertical-align: middle; height: 48px; margin-right: 8px"> Pydantic

Pydantic is the most widely used data validation library for Python.

In standard Python, you can be pretty loose with data types. Pydantic changes that by using Python type hints to perform data validation and settings management. If the data doesn't match your schema, Pydantic raises an error; if it does match, it converts it into the correct type.

Everything in Pydantic starts with a class that inherits from **BaseModel**. This defines the "shape" of your data. Pydantic doesn't just check types; it fixes them when it can. If you define a field as an int but pass the string "42", Pydantic will automatically convert it to the integer 42.

It provides:
- Data Integrity: You can be 100% sure the data inside your functions is valid.
- Editor Support: Since it uses type hints, VSCode can provide excellent autocompletion and error highlighting.
- JSON Integration: It has built-in methods to parse JSON strings and export models back to JSON.
- Performance: The core of Pydantic is written in Rust, making it incredibly fast.

## Installation

::: code-group

```sh [pip]
pip install pydantic
```

```sh [uv]
uv add pydantic
```

```sh [micromamba]
micromamba install pydantic
```

:::

## Usage Example

```python
from pydantic import BaseModel, EmailStr, Field
from typing import List, Optional

class User(BaseModel):
    id: int
    username: str
    email: EmailStr  # Validates email format automatically
    is_active: bool = True  # Default value
    tags: List[str] = []    # List of strings
    age: Optional[int] = Field(None, ge=0, le=120) # Age must be between 0 and 120

# 1. Successful validation (with type coercion)
external_data = {
    "id": "123",  # Note: this is a string, but will become an int
    "username": "coder_zero",
    "email": "hello@example.com",
    "age": 25
}

user = User(**external_data)

print(user.id)        # Output: 123 (as an integer)
print(user.model_dump()) # Converts the model back to a dictionary
```

If you pass invalid data (e.g., a bad email or a negative age), Pydantic provides a clear, structured error message:

```python
from pydantic import ValidationError

try:
    User(id=1, username="ace", email="not-an-email")
except ValidationError as e:
    print(e.json()) # Returns a detailed explanation of why it failed
```

The current example is 'flat'. In practice, models nest inside each other (for example, a Project has a list of Users). This is the most direct bridge to how you'd use Pydantic with FastAPI request/response bodies:

```python
class Address(BaseModel):
    city: str
    country: str

class Employee(BaseModel):
    name: str
    address: Address  # nested model
```


### Model Validator

 A very common real-world need is validating relationships between fields (for example, `end_date` must be after `start_date`). This is one of the most asked-about Pydantic features:

```python
from pydantic import BaseModel, model_validator

class DateRange(BaseModel):
    start: int
    end: int

    @model_validator(mode="after")
    def check_range(self) -> "DateRange":
        if self.end <= self.start:
            raise ValueError("end must be greater than start")
        return self
```


### Pydantic Settings

This is a separate but closely related package that can become really handy. It reads `.env` files and environment variables into a validated Pydantic model, central to any FastAPI project:

```python
from pydantic_settings import BaseSettings

class Settings(BaseSettings):
    database_url: str
    api_key: str
    debug: bool = False

    class Config:
        env_file = ".env"

settings = Settings()
```

---

See more suitable examples on the official docs: https://pydantic.dev/docs/validation/latest/examples/files/