# 🚀 How to Deploy Eatly Online (For Free)

Want to show Eatly to the world? Here is the easiest way to get it online using free services.

## Part 1: Backend (Render.com)
The backend needs a server to run Node.js.

1.  Push this project to **GitHub**.
2.  Go to **[Render.com](https://render.com)** and create a new **Web Service**.
3.  Connect your GitHub repo.
4.  **Settings**:
    *   **Root Directory**: `server` (Important!)
    *   **Build Command**: `npm install`
    *   **Start Command**: `npm start`
5.  **Environment Variables** (Add these in the dashboard):
    *   `SUPABASE_URL`: (Your Supabase URL)
    *   `SUPABASE_KEY`: (Your Supabase Key)
    *   `GEMINI_API_KEY`: (Your Gemini Key)
    *   `PORT`: `10000` (Render default is usually 10000 or defined by them, but setting it helps)
6.  Click **Deploy**.
7.  **Copy the URL** it gives you (e.g., `https://eatly-api.onrender.com`). You need this for Part 2.

## Part 2: Frontend (Vercel)
The frontend is just static files (React), so Vercel is perfect.

1.  Go to **[Vercel.com](https://vercel.com)** and Add New Project.
2.  Import the same GitHub repo.
3.  **Settings**:
    *   **Root Directory**: `client` (Important!)
    *   **Framework**: It should auto-detect "Vite".
    *   **Build Command**: `npm run build`
    *   **Output Directory**: `dist`
4.  **Environment Variables**:
    *   `VITE_API_URL`: Paste your Render URL from Part 1 + `/api` (e.g., `https://eatly-api.onrender.com/api`).
5.  Click **Deploy**.

## 🎉 You're Live!
Visit your Vercel URL. Your app is now online and connected to your database and AI.
