# Budget App (React + Vite)

PostGRES server in the backend, make sure postgres is installed and a database with the name as set in server/config.py.

Initialize database with

```bash
python server/migrate.py init
```

start backend server with

```bash
python server/app.py
```

ensure you have an OpenAI API Key environment variable or the AI Assistant will not work (OPENAI_API_KEY)

Quick start:

```bash
npm install
npm run dev
```

Build:

```bash
npm run build
npm run preview
```
