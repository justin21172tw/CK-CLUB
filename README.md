# CK-CLUB - 建中社團管理平台

A comprehensive club management system built with Quasar Framework and Firebase.

## Project Structure

```
CK-CLUB/
├── frontend/          # Quasar frontend application (Vue 3 + Quasar)
│   ├── src/
│   │   ├── boot/      # Boot files (Firebase, etc.)
│   │   ├── components/ # Reusable Vue components
│   │   ├── composables/ # Vue composables (useAuth, useDashboard)
│   │   ├── config/    # Configuration files (env, constants)
│   │   ├── layouts/   # Layout components
│   │   ├── pages/     # Page components (admin/, student/, dev/)
│   │   ├── router/    # Vue Router configuration
│   │   ├── services/  # API service layer
│   │   └── utils/     # Utility functions
│   └── public/        # Static assets
├── functions/         # Firebase Cloud Functions (Backend API)
│   ├── config/        # Drive configuration
│   ├── routes/        # API routes (auth, submissions, templates)
│   └── index.js       # Cloud Functions exports
├── docs/              # Public documentation
└── docs-internal/     # Internal development docs
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
VITE_API_BASE=http://localhost:5001/ck-cl-24edb/us-central1
VITE_USE_CLOUD_FUNCTIONS=true
VITE_DEV_MODE=true
VITE_DEV_BYPASS_TOKEN=dev-admin-token-12345

# Firebase Configuration
VITE_FIREBASE_API_KEY=your-api-key
VITE_FIREBASE_AUTH_DOMAIN=your-project.firebaseapp.com
VITE_FIREBASE_PROJECT_ID=your-project-id
VITE_FIREBASE_STORAGE_BUCKET=your-project.appspot.com
VITE_FIREBASE_MESSAGING_SENDER_ID=your-sender-id
VITE_FIREBASE_APP_ID=your-app-id
```

**Cloud Functions** (`functions/.env`):

```env
GOOGLE_DRIVE_FOLDER_TEMPLATES=your-templates-folder-id
GOOGLE_DRIVE_FOLDER_SUBMISSIONS=your-submissions-folder-id
```

### Development

```bash
# Start Firebase emulators (backend + hosting)
firebase emulators:start

# In another terminal, start frontend dev server
cd frontend
npm run dev

# Or use the monorepo script (if configured)
npm run dev
```

The application will be available at:

- Frontend: `http://localhost:9000` (Quasar dev server)
- Cloud Functions: `http://localhost:5001`
- Firebase UI: `http://localhost:4000`

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

### Backend (Cloud Functions)

- **Runtime**: Node.js 20
- **Platform**: Firebase Cloud Functions v2
- **Database**: Firebase Firestore
- **Storage**: Google Drive API + Firebase Storage
- **Authentication**: Firebase Admin SDK
- **File Processing**: Busboy, Archiver

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
