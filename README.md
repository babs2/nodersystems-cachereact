# Debt Self-Service React + InterSystems Cache App

This project is a simple self-service portal for viewing account information and managing debts, with a React frontend and a Node/Express backend designed to connect to an InterSystems IRIS / Caché database.

## Project Structure

```text
react-cache-app/
  frontend/           # React (Vite) single-page app
    src/
      App.jsx
      index.css
      components/
        AccountInfo.jsx
        DebtView.jsx
  backend/            # Express API (mocked now, ready for Cache)
    server.js
    .env.example
```

The layout is a single “workspace” page with expandable cards:
- My information
- Debts
- Dispute
- Proof of debt
- Documents

The top of the page shows:
- **Total owed to Treasury** (sum of all debts)
- **Pay now** button (currently a placeholder)

## 1) Install Node.js and npm

- Download the LTS installer from `https://nodejs.org/en`
- Run the installer, keep default options, and allow it to add Node to PATH.
- After install, open a new PowerShell window and verify:

```powershell
node -v
npm -v
```

## 2) Get the project files

Place the project folder somewhere easy, for example:

```text
C:\Users\non-admin\Desktop\react-cache-app
```

The structure should look like:

```text
backend\
  server.js
  package.json
  .env.example
frontend\
  src\...
  package.json
  vite.config.js
  index.html
```

## 3) Configure the backend (.env)

From PowerShell:

```powershell
cd C:\Users\non-admin\Desktop\react-cache-app\backend
Copy-Item .env.example .env
```

Then edit `backend\.env` and set your InterSystems host, port, namespace, username, and password:

```text
CACHE_HOST=your-cache-host
CACHE_PORT=1972
CACHE_NAMESPACE=USER
CACHE_USERNAME=_SYSTEM
CACHE_PASSWORD=SYS

# Optional REST endpoint if you expose APIs from IRIS/Caché:
# CACHE_REST_ENDPOINT=http://localhost:52773/csp/user

PORT=5001
```

## 4) Install dependencies

### Backend

```powershell
cd C:\Users\non-admin\Desktop\react-cache-app\backend
npm install
```

### Frontend

```powershell
cd C:\Users\non-admin\Desktop\react-cache-app\frontend
npm install
```

## 5) Run the app (two terminals)

### Terminal 1 – Backend (Express API)

```powershell
cd C:\Users\non-admin\Desktop\react-cache-app\backend
$env:PATH = "C:\Program Files\nodejs;" + $env:PATH
npm run dev
```

This starts the backend on `http://localhost:5001`.

### Terminal 2 – Frontend (React / Vite)

```powershell
cd C:\Users\non-admin\Desktop\react-cache-app\frontend
$env:PATH = "C:\Program Files\nodejs;" + $env:PATH
npm run dev
```

By default Vite runs at `http://localhost:3000`.

Open your browser at:

```text
http://localhost:3000
```

## 6) Using the mock data

The backend currently returns mock data so you can see the UI without a live Cache connection.

- Try **Account ID `12345`** to load:
  - Account info (name, status, contact details, current balance).
  - Debts for that account.

### How the data flows

- Frontend calls:
  - `GET /api/account/:accountId` → used by `AccountInfo.jsx` to show account + **currentBalance**.
  - `GET /api/debts/:accountId` → used by `DebtView.jsx` to show debts and **totalDebt** (“Total owed to Treasury”).
- Backend (`backend/server.js`) is responsible for:
  - Connecting to InterSystems IRIS / Caché (REST or ODBC).
  - Mapping Cache/IRIS fields into JSON the React app expects.

## 7) Connecting to InterSystems Cache / IRIS (replace mocks)

In `backend/server.js`:

- Replace the mock objects with real queries.
- There are inline comments showing:
  - Where to call an IRIS / Caché REST endpoint (using `CACHE_REST_ENDPOINT` and basic auth).
  - How to map the Cache response into:
    - `currentBalance` for account info.
    - `debts` and `totalDebt` for the debts API.

Once the backend returns real values for `currentBalance` and `totalDebt`, the React UI will automatically show those numbers.

## 8) Common PowerShell tips

- Use semicolons instead of `&&` to chain commands:

```powershell
cd frontend; npm install
```

- If `npm` is not recognized:
  - Close and reopen PowerShell so PATH refreshes.
- If port 3000 or 5001 is in use:
  - Stop the other app using that port, or change:
    - Frontend dev port in `frontend\vite.config.js`
    - Backend `PORT` in `.env` and `server.js`.

## 9) Updating what you see in the browser (local React dev server)

- Any time you change React files under `frontend\` (like `App.jsx` or components), the dev server on `http://localhost:3000` will live‑reload.
- If it does not reload:
  - Make sure the dev server is still running in the frontend terminal.
  - If the terminal shows errors, fix them and the page will refresh.
  - You can always press `Ctrl+C` in the terminal to stop, then run:

```powershell
cd C:\Users\non-admin\Desktop\react-cache-app\frontend
npm run dev
```

## 10) Standalone HTML snapshot (optional)

Earlier in development a standalone HTML file was used:

```text
C:\Users\non-admin\Desktop\debt-portal.html
```

This runs directly in the browser without a dev server, but for GitHub and ongoing work, the **React/Vite app in `frontend/` is the source of truth**. You generally don’t need to commit the standalone HTML file.

## 11) Production build (frontend)

From the `frontend` folder:

```powershell
npm run build
```

The built assets will be in:

```text
frontend\dist
```

Serve those files with any static file server or reverse proxy if you deploy this app.

