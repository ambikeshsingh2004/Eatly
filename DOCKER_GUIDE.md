# 🐳 Docker Setup (The Easy Way)

So you want to run Eatly without installing a million dependencies? Docker to the rescure.

This setup spins up everything (Frontend + Backend) in isolated containers. Plus, it keeps your API keys safe in a local environment file.

## ⚡ Quick Start

### 1. Prereqs
User needs **Docker Desktop** installed. That's it.

### 2. Config
We don't commit secrets to git (obviously). So you need to create your own local config:

1.  Copy `.env.example` -> `.env`
2.  Fill in your keys (Supabase, Gemini, etc).

```bash
# Example keys
PORT=5000
SUPABASE_URL=...
GEMINI_API_KEY=...
```

### 3. Launch 🚀
Run this in the root folder:

```bash
docker-compose up --build
```

Grab a coffee ☕. First build takes a minute.

### 4. You're Live
- **App**: `http://localhost`
- **Server API**: `http://localhost:5000`

---

## 📦 Sharing is Caring (But be safe)

If you send this code to someone:
1.  **Zip the folder** (exclude `node_modules` to save space).
2.  **DELETE `.env`** before zipping! Never share your real keys.
3.  Tell them to make their own `.env` file.

Happy coding! ✌️
