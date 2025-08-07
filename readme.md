# 📱 Ummah Connect – Full Stack Social Media Application

![Home Feed Preview](https://i.ibb.co/SwShtBTW/home-feed.png)
![Discover People Preview](https://i.ibb.co/BHV5Kh8k/discover-feed.png)
![Live Start Preview](https://i.ibb.co/cKZdmHYr/stream-start.png)
![Live Start Preview](https://i.ibb.co/vCLhK77D/live-start.png)
![Bookmark](https://i.ibb.co/bgRtb4BK/bookmark-post.png)
![Message Preview](https://i.ibb.co/jkWDVMRH/message-2.png)
![Message Preview](https://i.ibb.co/5XNwRqNN/message.png)
![Notification Preview](https://i.ibb.co/TD5VHYVX/notification.png)
![Prayer Time](https://i.ibb.co/G4xv8J2D/prayer-time.png)
![Profile View](https://i.ibb.co/XZZX5S2f/profile-view.png)
![Settings Profile View](https://i.ibb.co/pv65QmzC/settings-page.png)
![Shared Post View](https://i.ibb.co/RT6bq8XD/share-post.png)
![Shorts View](https://i.ibb.co/9kyfmVFK/shorts.png)
![Story View](https://i.ibb.co/d0KWbJTN/story-view.png)
![Create Story View](https://i.ibb.co/Rkf1mCYm/story.png)

Ummah Connect is a modern, scalable, and secure full-stack social media platform built with a monorepo architecture using **Next.js (Frontend)** and **Express.js (Backend)**. It integrates powerful features such as **adaptive HLS video streaming**, **real-time messaging**, **live streams**, **2FA**, and **prayer-time reminders** for a truly global and inclusive user experience.

---

## 🗂️ Project Structure
```bash
ummah-connect/
│
├── .github/
│ └── workflows/
│ └── lint.yml # GitHub Actions for lint checking
├── .husky/ # Git hooks for pre-commit linting and formatting
├── .vscode/ # Recommended workspace settings
│
├── client/ # Next.js frontend application
├── backend/ # Express.js API server
│
└── README.md # This file
```


## 🚀 Tech Stack

| Layer          | Technology                           |
|----------------|---------------------------------------|
| Frontend       | Next.js, Tailwind CSS, React Query, Axios    |
| Backend        | Express.js, TypeScript, REST API, Sequelize ORM      |
| Realtime       | Socket.IO                             |
| Auth           | JWT, 2FA, OAuth                       |
| DB             | PostgreSQL                  |
| Storage        | Cloudinary (Video/Image CDN)          |
| Video Stream   | HLS (Adaptive Bitrate)                |
| DevOps         | GitHub Actions, Husky, Linting        |

---

## ✨ Feature Highlights

### ✅ **Authentication & Security**
- User Registration / Login / Logout
- JWT-based Auth with Refresh Tokens
- **2FA (Two-Factor Authentication)**
- Social login (Google, GitHub – optional)
- Role-based access control (RBAC)

### 📸 **Media & Video Streaming**
- Secure video uploads via **Cloudinary**
- Adaptive **HLS streaming** with bitrate switching
- **Shorts**: Scrollable short-form videos
- **Live Streaming** with real-time comments
- Media privacy control: Public / Friends / Private

### 💬 **Real-Time Communication**
- Real-time **notifications** (likes, comments, shares)
- **1:1 messaging** and **group messages**
- Typing indicators, message status (seen/delivered)
- **Live stream comments** and interaction

### 🔔 **Social Media Essentials**
- Posts (text/image/video)
- Likes, Comments, Shares
- Bookmarks & Saved Posts
- Tagging and mentions
- Profile customization and following system

### 🌍 **Utility Features**
- **Prayer Times** based on geolocation & timezone
- Global dark/light mode
- Multi-language support (i18n-ready)

---

## 🔐 Authentication Flow

1. **Register/Login** via API → receive `accessToken` and `refreshToken`
2. Secure routes are protected via **JWT Middleware**
3. 2FA code is sent via email/SMS (if enabled)
4. Access token is refreshed via `/auth/refresh-token` route

---

## 🧠 Real-Time Architecture

- Socket.IO used in both client & server for:
  - Notifications (post, comment, live updates)
  - Live messages / chat
  - Live stream interactions
- Redis (optional) used for scalable pub/sub messaging

---

## 📦 API Modules (Backend)
```bash
/auth → Login, register, 2FA, refresh
/users → Profile info, update, follow
/posts → Create/read/update/delete posts
/comments → Nested commenting
/messages → 1:1 and group messaging
/notifications → Real-time + historical
/stream → HLS stream and live handling
/prayer-times → Based on coordinates
/admin → Moderation tools
```

---

# 🧪 Development Setup

## Setup Environment Variables
#### Create .env files inside client/ and backend/. Sample:
```bash
Backend Env

DB_NAME=postgres
DB_USER=test
DB_PASS=test
DB_HOST=localhost
PORT=8000
ACCESS_TOKEN_SECRET=ACCESS_TOKEN_SECRET
ACCESS_TOKEN_EXPIRY=1
REFRESH_TOKEN_SECRET=REFRESH_TOKEN_SECRET
REFRESH_TOKEN_EXPIRY=7
SMTP_TOKEN=brevo_api_key
SERVER_URL=http://localhost:8000
CLIENT_URL=http://localhost:3000
CLOUDINARY_CLOUD_NAME=cloud_name
CLOUDINARY_API_KEY=apu_key
CLOUDINARY_API_SECRET=secret_key
REDIS_URL=cloud_redis
LIVEKIT_URL=livekit_url
LIVEKIT_API_KEY=livekit_api
LIVEKIT_API_SECRET=livekit_secret

Client Env

NEXT_PUBLIC_API_BASE_URL=http://localhost:8000
ACCESS_TOKEN_SECRET=ACCESS_TOKEN_SECRET
NEXT_PUBLIC_ENCRYPTION_SECRET=NEXT_PUBLIC_ENCRYPTION_SECRET
NEXT_PUBLIC_CLOUD_NAME=cloud_name
```

### 1. Clone the repository
```bash
git clone https://github.com/jsdevrazuislam/Ummah-Connect
cd Ummah-Connect
```
### 2. Install dependencies (monorepo powered by pnpm)

```bash
pnpm install
```
### 3. Run Development Servers
```bash
pnpm start
```

