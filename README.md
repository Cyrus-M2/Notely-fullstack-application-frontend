# Notely - Full-Stack Note Taking Application

A modern, full-featured note-taking application built with React, Node.js, Express, Prisma, and PostgreSQL.

## Features

### User Authentication
- **Sign Up**: Users can register with first name, last name, username, email, and password, captcha
- **Login**: Authentication using email or username with password
- **JWT Authentication**: Secure token-based authentication
- **Protected Routes**: Certain pages accessible only to authenticated users

### Notes Management
- **Create Notes**: Rich note creation with title, synopsis, and markdown content
- **View Notes**: Clean, card-based layout for browsing notes
- **Edit Notes**: Update existing notes with pre-populated forms
- **Soft Delete**: Notes moved to trash instead of permanent deletion
- **Restore Notes**: Recover deleted notes from trash
- **Markdown Support**: Full markdown rendering for note content

### User Profile
- **Profile Management**: Update personal information (name, username, email)
- **Avatar Upload**: Profile picture upload via Cloudinary integration
- **Password Change**: Secure password update with current password verification
- **Initials Fallback**: Display user initials when no avatar is uploaded

### Additional Features
- **Responsive Design**: Optimized for desktop, tablet, and mobile devices
- **Clean UI**: Modern interface with smooth animations and transitions
- **Dashboard**: Central hub showing all user notes
- **Trash Management**: Dedicated page for deleted notes
- **Landing Page**: Introduction page for new users

## Tech Stack

### Backend
- **Node.js**: Runtime environment
- **Express.js**: Web framework
- **Prisma**: Database ORM
- **PostgreSQL**: Database
- **JWT**: Authentication tokens
- **Cloudinary**: Image upload and storage
- **bcryptjs**: Password hashing
- **Helmet**: Security middleware
- **CORS**: Cross-origin resource sharing

### Frontend
- **React 18**: UI library with hooks
- **TypeScript**: Type safety
- **React Router**: Client-side routing
- **Tailwind CSS**: Utility-first styling
- **Axios**: HTTP client
- **React Hook Form**: Form management
- **React Hot Toast**: Notifications
- **React Markdown**: Markdown rendering
- **Lucide React**: Icon library

## Getting Started

### Prerequisites
- Node.js (v16 or higher)
- PostgreSQL database
- Cloudinary account (for image uploads)

### Environment Setup

1. **Backend Environment** (create `backend/.env`):
```env
DATABASE_URL="postgresql://username:password@localhost:5432/notely"
JWT_SECRET="your-super-secret-jwt-key-here"
JWT_EXPIRES_IN="7d"
CLOUDINARY_CLOUD_NAME="your-cloudinary-cloud-name"
CLOUDINARY_API_KEY="your-cloudinary-api-key"
CLOUDINARY_API_SECRET="your-cloudinary-api-secret"
PORT=5000
NODE_ENV="development"
FRONTEND_URL="http://localhost:5173"
```

### Installation

1. **Install all dependencies**:
```bash
npm run setup
```

2. **Set up the database**:
```bash
cd backend
npx prisma migrate --name "name"
```

3. **Start the development servers**:
```bash
npm run dev
```

This will start both the backend server (port 5000) and frontend development server (port 5173).

## API Endpoints

### Authentication
- `POST /api/auth/register` - Register a new user
- `POST /api/auth/login` - Login user
- `POST /api/auth/logout` - Logout user
- `POST /api/auth/password` - Update user password

### User Management
- `GET /api/user/profile` - Get user profile
- `PATCH /api/user/` - Update user information
- `PATCH /api/user/avatar` - Upload profile picture

### Notes/Entries
- `POST /api/entries` - Create new entry
- `GET /api/entries` - Get all user entries
- `GET /api/entries/trash` - Get deleted entries
- `GET /api/entry/:id` - Get specific entry
- `PATCH /api/entry/:id` - Update entry
- `PATCH /api/entry/restore/:id` - Restore deleted entry
- `DELETE /api/entry/:id` - Soft delete entry

## Database Schema

### Users Table
- `id` (UUID, Primary Key)
- `firstName` (String, Required)
- `lastName` (String, Required)
- `email` (String, Unique, Required)
- `username` (String, Unique, Required)
- `password` (String, Required, Hashed)
- `avatar` (String)
- `dateJoined` (DateTime)
- `lastProfileUpdate` (DateTime)
- `isDeleted` (Boolean, Default: false)

### Entries Table
- `id` (UUID, Primary Key)
- `title` (String, Required)
- `synopsis` (String, Required)
- `content` (String, Required)
- `isDeleted` (Boolean, Default: false)
- `dateCreated` (DateTime)
- `lastUpdated` (DateTime)
- `userId` (Foreign Key to Users)

## Security Features

- **Password Hashing**: bcryptjs with salt rounds
- **JWT Authentication**: Secure token-based auth
- **Input Validation**: Server-side validation using express-validator
- **CORS Protection**: Configured for specific origins
- **Rate Limiting**: Prevents abuse, bruteforce and DoS attacks
- **Helmet**: Security headers
- **Environment Variables**: Sensitive data protection

## Development Scripts

### Root Level
- `npm run dev` - Start both frontend and backend
- `npm run setup` - Install all dependencies

### Backend
- `npm run dev` - Start development server
- `npx prisma migrate --name "name"` - Run database migrations
- `npx prisma studio` - Open Prisma Studio

### Frontend
- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm run lint` - Run ESLint

## Contributing

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add some amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## License

This project is licensed under the MIT License.