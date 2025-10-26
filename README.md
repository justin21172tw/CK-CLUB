# CK-CLUB - 建中社團管理平台

A comprehensive club management system built with Quasar Framework and Firebase.

## Project Structure

```
CK-CLUB/
├── frontend/          # Quasar frontend application
│   ├── src/
│   │   ├── boot/      # Boot files (Firebase, etc.)
│   │   ├── components/ # Reusable Vue components
│   │   ├── composables/ # Vue composables (useAuth, etc.)
│   │   ├── config/    # Configuration files (env, constants)
│   │   ├── layouts/   # Layout components
│   │   ├── pages/     # Page components
│   │   ├── router/    # Vue Router configuration
│   │   ├── services/  # API service layer
│   │   └── utils/     # Utility functions
│   └── public/        # Static assets
├── backend/           # Backend API server
├── functions/         # Firebase Cloud Functions
└── docs/             # Public documentation
```

## Features

- 🔐 Firebase Authentication (Google Sign-in)
- 📝 Activity application management
- 📢 Announcement system
- 📤 Teacher data upload
- 👨‍💼 Admin dashboard
- 🌓 Dark mode support
- 📱 Responsive design

## Quick Start

### Prerequisites

- Node.js (v18 or higher)
- npm or yarn

### Installation

```bash
# Install dependencies
npm install

# Navigate to frontend
cd frontend
npm install
```

### Environment Variables

Create `.env` files in the appropriate directories:

**Frontend** (`frontend/.env`):
```env
VITE_API_BASE=http://localhost:3000/api
VITE_USE_CLOUD_FUNCTIONS=false
VITE_DEV_MODE=true
VITE_DEV_BYPASS_TOKEN=dev-admin-token-12345
```

**Backend** (`backend/.env`):
```env
PORT=3000
NODE_ENV=development
```

### Development

```bash
# Start frontend dev server
cd frontend
npm run dev

# Start backend server (in another terminal)
cd backend
npm start
```

### Build for Production

```bash
cd frontend
npm run build
```

## Available Scripts

### Frontend

- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm run lint` - Run ESLint
- `npm run format` - Format code with Prettier

### Backend

- `npm start` - Start backend server
- `npm run dev` - Start with nodemon (auto-reload)

## Tech Stack

### Frontend
- **Framework**: Quasar Framework v2 (Vue 3)
- **State Management**: Vue Composition API
- **Authentication**: Firebase Auth
- **HTTP Client**: Axios
- **Styling**: SCSS + Quasar Components

### Backend
- **Runtime**: Node.js
- **Framework**: Fastify (or Express)
- **Database**: Firebase Firestore
- **Storage**: Firebase Storage
- **Authentication**: Firebase Admin SDK

## Documentation

- [Quick Start Guide](./docs/QUICKSTART.md)
- [Authentication System](./docs/AUTHENTICATION_SYSTEM.md)
- [Project Structure](./docs/PROJECT_STRUCTURE.md)
- [Firebase Migration Guide](./docs/FIREBASE_MIGRATION_GUIDE.md)

## Development Mode

The application includes a development mode for local testing without Firebase authentication:

1. Set `VITE_DEV_MODE=true` in frontend `.env`
2. Click "開發模式登入" button on login dialog
3. You'll be signed in as a local admin

## Contributing

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

## License

This project is proprietary and confidential.

## Contact

- **Author**: ChrisSun0731
- **Email**: chris20090731@gmail.com
- **Repository**: https://github.com/ChrisSun0731/CK-CLUB

