# 🎅 Secret Santa App

A full-stack Secret Santa web application built with React + Vite (frontend) and Node.js + Express (backend), using Firebase Firestore for storage and Brevo for email delivery.

---

## ✨ Features

- Create multiple Secret Santa groups
- 4–30 participants per group
- Fair shuffle algorithm (no self-assignment, no mutual pairs)
- Private email delivery via Brevo
- Participant status tracking (sent / failed / pending)
- Reshuffle before sending
- Edit/delete groups before emails are sent
- Copy share link
- Wishlist support per participant
- Budget limit setting
- Custom organizer message
- Exchange date display
- Mobile-responsive dark UI
- Rate limiting and input sanitization

---

## 🏗️ Tech Stack

| Layer | Technology |
|-------|-----------|
| Frontend | React + Vite |
| Backend | Node.js + Express |
| Database | Firebase Firestore |
| Email | Brevo (Sendinblue) API |
| Frontend Hosting | Netlify |
| Backend Hosting | Render / Railway / Fly.io |

---

## 🚀 Getting Started

### Prerequisites

- Node.js 18+
- Firebase project (Firestore enabled)
- Brevo account + API key

---

### 1. Firebase Setup

1. Go to [Firebase Console](https://console.firebase.google.com/)
2. Create a new project
3. Enable **Firestore Database** (start in production mode)
4. Go to Project Settings → Service Accounts → Generate new private key
5. Download the JSON file

**Firestore Security Rules** (set in Firebase Console):
```
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    match /groups/{groupId} {
      allow read, write: if true; // Secure with auth in production
    }
  }
}
```

---

### 2. Brevo Setup

1. Sign up at [brevo.com](https://www.brevo.com)
2. Go to **SMTP & API** → API Keys → Create a new API key
3. Go to **Senders & IP** → Add and verify your sender email

---

### 3. Backend Setup

```bash
cd backend
cp .env.example .env
```

Edit `.env`:
```
BREVO_API_KEY=your_brevo_api_key
BREVO_SENDER_EMAIL=noreply@yourdomain.com

# Option A: Full JSON (recommended)
FIREBASE_SERVICE_ACCOUNT_JSON={"type":"service_account","project_id":"..."}

# Option B: Individual fields
FIREBASE_PROJECT_ID=your-project-id
FIREBASE_CLIENT_EMAIL=firebase-adminsdk@your-project.iam.gserviceaccount.com
FIREBASE_PRIVATE_KEY="-----BEGIN RSA PRIVATE KEY-----\n..."

PORT=3001
FRONTEND_URL=https://your-netlify-app.netlify.app
```

```bash
npm install
npm start
```

---

### 4. Frontend Setup

```bash
cd frontend
cp .env.example .env
```

Edit `.env`:
```
VITE_API_URL=http://localhost:3001/api
```

```bash
npm install
npm run dev
```

---

## 🌐 Deployment

### Frontend → Netlify

1. Push `frontend/` to a GitHub repo
2. Connect to Netlify
3. Build command: `npm run build`
4. Publish dir: `dist`
5. Add env var: `VITE_API_URL=https://your-backend-url.com/api`

The `netlify.toml` handles SPA routing automatically.

### Backend → Render (recommended free tier)

1. Push `backend/` to a GitHub repo
2. Create a new **Web Service** on [render.com](https://render.com)
3. Build command: `npm install`
4. Start command: `node server.js`
5. Add all environment variables from `.env.example`

---

## 🎲 Shuffle Algorithm

The algorithm generates valid Secret Santa assignments using these rules:

1. **No self-assignment** — You can't be your own Santa
2. **No mutual pairs** — If A → B, then B ↛ A
3. **Complete cycle** — Everyone gives and receives exactly once

It uses a Fisher-Yates shuffle with rejection sampling, retrying up to 1000 times to find a valid derangement that satisfies all constraints.

---

## 📧 Email Flow

Each participant receives a private email with:
- Their name as the greeting
- The name of who they're gifting (highlighted)
- The recipient's wishlist (if provided)
- Exchange date (if set)
- Custom message from organizer (if set)

No participant can see anyone else's assignment.

---

## 🔒 Security

- All inputs sanitized and length-limited
- Duplicate emails prevented per group
- Assignments generated server-side only
- API keys stored in environment variables only
- Rate limiting: 100 req/15min general, 10 req/hour for email sending
- Helmet.js for HTTP security headers
- CORS restricted to your frontend URL

---

## 📁 Project Structure

```
secret-santa/
├── frontend/
│   ├── src/
│   │   ├── components/     # Reusable UI components
│   │   ├── context/        # React context (global state)
│   │   ├── pages/          # Route-level page components
│   │   └── utils/          # API client, helpers, validation
│   ├── netlify.toml
│   └── .env.example
├── backend/
│   ├── routes/             # Express route handlers
│   ├── services/           # Firebase + Brevo services
│   ├── utils/              # Shuffle algorithm + validation
│   ├── server.js           # Express app entry point
│   └── .env.example
└── README.md
```
