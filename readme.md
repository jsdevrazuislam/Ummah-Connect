# 🕌 Muslim Social Media Backend

A scalable, secure, and extensible social media backend built with **TypeScript**, **Express**, **Sequelize ORM**, and **PostgreSQL**. Includes full support for authentication, following system, and modular API routing. Fully containerized with Docker.

---

## 📦 Tech Stack

- **Node.js** + **Express** (API server)
- **TypeScript** (typed backend)
- **Sequelize ORM** (PostgreSQL integration)
- **PostgreSQL** (relational DB)
- **Swagger** (API documentation)
- **Docker + Docker Compose** (containerization)
- **JWT** (authentication)
- **Bcrypt** (password hashing)

---

## 🛠 Features

- 🔐 **Authentication** (Login/Register with email or username)
- 👤 **User Profiles**
- 🔁 **Follow System** (Users can follow/unfollow others)
- 📃 **Swagger Docs** (`/api-docs`)
- 🌐 **Internationalization Ready**
- 🚀 **Production-ready Docker setup**
- 💥 **Custom error handling with ApiError class**

---

## 🚀 Getting Started

### 1. Clone the repo

```bash
git clone https://github.com/jsdevrazuislam/Ummah-Connect
cd muslim-social-backend 
```

## 2. Add your .env
```bash
see example.env
```

### 🐳 Run with Docker
```bash
docker-compose up --build
Backend will be running at:
➡️ http://localhost:3000
Swagger docs at:
➡️ http://localhost:3000/api-docs
```

### 🧪 Local Development (without Docker)
```bash
pnpm i
pnpm run dev
```

### 📂 Project Structure
```bash

src/
├── configs/           # Sequelize, Swagger configs
├── controllers/       # Route handlers
├── middlewares/       # Auth, error handling
├── models/            # Sequelize models
├── routes/            # Express routers
├── types/             # TypeScript interfaces/types
├── utils/             # Reusable helpers
├── app.ts             # application
├── server.ts           # Main server entry

```

