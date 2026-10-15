# EventSphere — Event Management Web Application

Full-stack event management and participant registration platform built with **React 19 (Frontend)**, **Node.js & Express.js (Backend REST API)**, and **MongoDB (Database)**.

---

## 🚀 How to Run in Visual Studio Code

### Step 1: Open the Project in VS Code
1. Open **Visual Studio Code**.
2. Go to **File** > **Open Folder...** (or `Cmd + O` on macOS / `Ctrl + O` on Windows/Linux).
3. Select this project root directory.

---

### Step 2: Open the Integrated Terminal
In VS Code, press `` Ctrl + ` `` (or select **Terminal** > **New Terminal** from the top menu).

---

### Step 3: Install Dependencies
Run the following command in the VS Code terminal:
```bash
npm install
```

---

### Step 4: Configure Environment (Optional)
Copy `.env.example` to `.env`:
```bash
cp .env.example .env
```

* **Default Mode**: If you leave `MONGODB_URI` empty, the system automatically runs with the built-in, file-persisted **MongoDB Document Engine** (`.data/mongodb_store.json`), meaning **no external database setup is required to run immediately!**
* **MongoDB Atlas / Cloud Cluster (Optional)**: If you want to connect to a real MongoDB Atlas cluster, set your URI in `.env`:
  ```env
  MONGODB_URI="mongodb+srv://<username>:<password>@cluster0.mongodb.net/eventsphere?retryWrites=true&w=majority"
  ```

---

### Step 5: Start the Application

You can start the project using **either** of the following:

#### Method A: Run via Terminal (Recommended)
```bash
npm run dev
```

#### Method B: 1-Click Launch with VS Code Run & Debug
1. Press `F5` on your keyboard (or click the **Run and Debug** icon on the left sidebar).
2. Select **"Run EventSphere (Node.js + Express + Vite)"**.

---

### Step 6: Open in Your Browser
Visit:
```
http://localhost:3000
```

---

## 🔑 Default Demo Accounts

The database comes pre-seeded with verified test accounts:

| Role | Email | Password | Permissions |
| :--- | :--- | :--- | :--- |
| **Administrator** | `admin@eventsphere.io` | `admin123` | Create, edit, delete events, check-in attendees, export CSV |
| **Attendee** | `alex@example.com` | `user123` | Browse events, register passes, view digital ticket codes |

*(You can also use the 1-click **"Admin Profile"** or **"Attendee Profile"** quick login buttons on the Sign In modal).*

---

## 🛠️ Project Structure

```
├── .data/                  # Persistent local MongoDB document storage
├── .vscode/                # VS Code launch & task configurations (F5 debug)
├── src/
│   ├── assets/images/      # Conference, workshop, and festival photography
│   ├── components/         # React UI components (Hero, Cards, Modals, Admin)
│   ├── services/api.ts     # Client HTTP service communicating with Express
│   ├── server/db.ts        # MongoDB document layer & seed generator
│   ├── types/index.ts      # TypeScript interfaces (Event, User, Registration)
│   ├── App.tsx             # Main application router and state
│   ├── main.tsx            # React root mount
│   └── index.css           # Tailwind CSS styles
├── server.ts               # Node.js + Express.js backend server (Port 3000)
├── package.json            # Scripts & project dependencies
├── tsconfig.json           # TypeScript configuration
└── vite.config.ts          # Vite configuration
```

---

## 📦 Production Build

To build the static frontend and run in production mode:
```bash
npm run build
npm start
```
