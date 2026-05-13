---
outline: deep
---

# <img src="/logos/dockerlogo.png" style="display: inline-block; vertical-align: middle; height: 48px; margin-right: 8px;"> Docker

Think of Docker as the standardized shipping container of the software world. Before Docker, moving code from your laptop to a server was like trying to ship a pile of loose items; something always got lost or broken. Docker packs everything (code, libraries, settings) into one box that runs exactly the same everywhere.

A Docker **Image** is a read-only file that contains the source code, libraries, dependencies, and tools needed to run an application. 
A **Container** is a running instance of an image. If the image is the recipe, the container is the cake you just baked.

## Installation

::: code-group

```sh [Arch Linux]
yay docker-desktop
```

:::

## Essential Commands

Managing Images:
- `docker pull <image>`: Download an image from Docker Hub (e.g., docker pull nginx).
- `docker images`: List all images stored on your machine.
- `docker rmi <image_id>`: Delete an image.
- `docker build -t <name> .`: Build an image from a Dockerfile in the current directory.

Managing Containers (running apps):
- `docker run <image>`: Create and start a container.
    - `-d`: Run in background (detached).
    - `-p 80:8080`: Map host port 80 to container port 8080.
    - `--name <name>`: Give your container a custom name.
- `docker ps`: List all running containers.
    - `-a`: List all containers (including stopped ones).
- `docker stop <id/name>`: Gracefully stop a container.
- `docker rm <id/name>`: Delete a container (must be stopped first).

Inside the Container:
- `docker logs <id/name>`: See the output/errors of a container.
- `docker exec -it <id/name> sh`: Open a terminal inside a running container.


## Docker Compose

Your app may need a database or many other services. Instead of running two separate `docker run` commands and manually linking them, you use a `docker-compose.yaml` file.

First, you need to pack your application into a `Dockerfile`.

```Dockerfile
# Use a Python base image
FROM python:3.11-slim

# Create a place for our code
WORKDIR /app

# Install dependencies
COPY requirements.txt .
RUN pip install -r requirements.txt

# Copy our actual code
COPY . .

# Run the app
CMD ["python", "app.py"]
```

Then, instead of running a long command to start the app and another to start a database, we define them here. This file links them together and will be used to run the whole app.

```yaml
services:
  # Our Python Web App
  web:
    build: .             # Build the Dockerfile in the current folder
    ports:
      - "8000:5000"      # Access on localhost:8000
    volumes:
      - .:/app           # "Live Sync" code changes from host to container
    environment:
      - DB_HOST=db       # Tell the app where the DB is
    depends_on:
      - db               # Don't start 'web' until 'db' is ready

  # A Postgres Database
  db:
    image: postgres:15
    environment:
      POSTGRES_USER: user
      POSTGRES_PASSWORD: password
      POSTGRES_DB: my_database
    volumes:
      - postgres_data:/var/lib/postgresql/data

volumes:
  postgres_data:         # Keeps your data safe even if containers are deleted
```

### Workflow

When starting a new project, your workflow usually looks like this:
1. Write your code (e.g., a Python or Node app).
2. Create a `Dockerfile` to package that code.
3. Create a `docker-compose.yaml` to define your app and its database.
4. Run `docker compose up -d` to see it all come to life.
5. Run `docker compose down` when you’re done for the day.

---

### Commands

Here's a brief list of all the useful commands regarding `docker compose`

- `docker compose up`: Builds, creates, and starts all services in the file.
    - `-d`: Starts everything in the background (hidden).
- `docker compose down`: Stops and removes containers, networks, and images defined in the file.
- `docker compose ps`: Shows the status of all services in the stack.
- `docker compose logs -f`: Follow the live logs of all services at once.
- `docker compose restart`: Restarts all services.
- `docker compose build`: Rebuilds the images (useful if you changed your code).