# Spotify Clone

A full-stack Spotify clone built with React.js, Node.js, and MongoDB.

## Features
- User Authentication
- Music Playback
- Playlist Management
- Add/Edit/Delete Songs
- Create/Edit/Delete Playlists
- Responsive Design

## Tech Stack
- Frontend: React.js, CSS3
- Backend: Node.js, Express.js
- Database: MongoDB
- Authentication: JWT

## Setup Instructions

1. Clone the repository
2. Install dependencies:
   ```bash
   # Install backend dependencies
   cd backend
   npm install

   # Install frontend dependencies
   cd ../frontend
   npm install
   ```
3. Create a .env file in the backend directory with:
   ```
   MONGODB_URI=your_mongodb_uri
   JWT_SECRET=your_jwt_secret
   PORT=5000
   ```
4. Start the development servers:
   ```bash
   # Start backend server
   cd backend
   npm run dev

   # Start frontend server
   cd frontend
   npm start
   ```

## Project Structure
```
spotify-clone/
├── frontend/          # React frontend
├── backend/           # Node.js backend
└── README.md
``` 