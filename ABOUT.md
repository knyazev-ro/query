```md
# Project Context

## Project Overview

The project is an intelligent image compression platform based on deep learning autoencoders with GAN-assisted training.

The system allows users to:
- upload datasets;
- train image compression models;
- version and continue training existing models;
- compress and restore images;
- manage trained models and compressed files;
- use external API integrations.

The project architecture is based on a distributed microservice approach.

---

# Main Technologies

## Backend
- PHP 8+
- Laravel
- Laravel Queues
- Laravel Events
- Laravel Broadcasting / WebSockets
- Eloquent ORM
- MySQL / PostgreSQL
- Nginx
- PHP-FPM

## Frontend
- React
- Inertia.js
- Axios
- TailwindCSS
- Vite

## Machine Learning Microservice
- Python
- FastAPI
- PyTorch
- torchvision
- Pillow
- NumPy

## Infrastructure
- Docker
- Docker Compose
- Nginx Load Balancer

---

# System Architecture

The system architecture is centralized around Laravel backend.

Communication flow:

Frontend -> Laravel -> Python Microservice

and

Python Microservice -> Laravel -> Frontend

Laravel is the central coordinator and mediator of the whole system.

Frontend NEVER communicates directly with Python services.

Laravel responsibilities:
- authentication;
- business logic;
- database operations;
- queues;
- events;
- websocket broadcasting;
- model versioning;
- dataset management;
- API management;
- interaction with ML microservices.

Python microservices only perform:
- model training;
- inference;
- image compression;
- image decompression;
- latent vector operations.

---

# Deployment Architecture

## Laravel Stack
- Nginx + PHP-FPM
- 8 PHP-FPM workers
- React frontend served through Laravel + Inertia.js

## Python ML Services
- FastAPI services in Docker containers
- Multiple containers can run simultaneously
- Nginx distributes load between Python containers

The architecture supports horizontal scaling of ML services.

---

# Frontend Architecture

Frontend is built with:
- React
- Inertia.js

Important:
- This is NOT a standalone SPA.
- Laravel controls routing.
- Inertia bridges Laravel and React.
- Pages are server-driven through Laravel responses.

Frontend responsibilities:
- dataset uploads;
- model management UI;
- version graph visualization;
- training controls;
- compression UI;
- decompression UI;
- websocket real-time updates.

---

# Core Features

## Dataset Management

Users can:
- upload datasets;
- store datasets;
- reuse datasets for training;
- manage dataset list.

Datasets are image collections used for model training.

---

## Model Training

Users can:
- create new models;
- choose dataset;
- choose image resolution:
  - 64x64
  - 128x128
  - 256x256
  - 512x512
- start training.

Training jobs are sent from Laravel to FastAPI ML service.

Training is asynchronous.

---

# Model Versioning System

Important architecture feature.

Models are versioned as a tree structure.

Example:
- User trains Model V1
- User continues training -> Model V2
- User can also branch from V1 again
- Multiple branches are supported

Each version stores:
- parent model;
- dataset information;
- metadata;
- model name;
- training information.

Frontend displays version graph visualization.

---

# Compression Workflow

## Compression

User uploads image.

Flow:
1. Frontend sends image to Laravel
2. Laravel forwards task to Python service
3. Autoencoder compresses image into latent representation
4. Latent representation is stored as `.npz`

Compressed images are NOT stored as regular image files.

---

## Decompression

Flow:
1. User requests restore/download
2. Laravel requests Python service
3. Python decodes latent representation
4. Restored image returned to frontend

---

# WebSockets & Notifications

The system uses:
- Laravel Events
- Broadcasting
- WebSockets

Purpose:
- real-time training status;
- compression status;
- model-ready notifications;
- live UI updates.

Python service notifies Laravel when task completes.

Laravel broadcasts websocket events to frontend.

---

# Queue System

Long-running tasks use Laravel Queues:
- training;
- image processing;
- compression;
- decompression;
- notifications.

Queue system prevents HTTP blocking.

---

# API

The platform exposes APIs for integrations.

Available API features:
- file CRUD;
- compression endpoints;
- decompression endpoints;
- model management;
- dataset access.

FastAPI handles ML-related endpoints.

Laravel acts as API gateway and authorization layer.

---

# Machine Learning Architecture

## Main Model

Autoencoder-based image compression model.

Architecture:
- Encoder
- Latent bottleneck
- Decoder

GAN discriminator used ONLY during training.

After training:
- only autoencoder used for inference/compression.

---

# ML Training Details

## Loss Function

Combined loss:
- reconstruction loss (MSE)
- adversarial loss (GAN)

Formula conceptually:

autoencoder_loss =
reconstruction_loss + beta * adversarial_loss

Discriminator trained separately.

---

# Data Processing

Dataset preprocessing includes:
- resize;
- center crop;
- normalization;
- augmentation;
- random rotation;
- horizontal flip.

Images converted to tensors and normalized to [-1, 1].

---

# Important Architectural Notes

## Laravel is the center of the system

ALWAYS remember:
- frontend never talks directly to Python;
- Python never talks directly to frontend;
- Laravel orchestrates everything.

---

# Coding Style Preferences

Preferred stack conventions:
- clean architecture;
- service-oriented Laravel structure;
- Eloquent ORM;
- DTO/service patterns when needed;
- React component modularity;
- reusable hooks/components;
- async queue-based processing;
- websocket-driven UI updates.

---

# Main Research Goal

The project goal is:
improving efficiency and quality of intelligent image compression using deep learning autoencoders with GAN-assisted training.

The platform is both:
- research system;
- production-like scalable application.
```
