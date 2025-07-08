# News API WebSocket Server

A Node.js application that fetches daily news from NewsAPI.org and streams them to clients via WebSocket.

## Features

- Fetches daily news from NewsAPI.org for India-related topics
- Stores articles in MongoDB using Mongoose
- Streams news articles via WebSocket
- Batches first 10 articles, then streams remaining articles every 2 minutes
- Includes a web interface for testing WebSocket connections

## Setup Instructions

### Prerequisites

- Node.js (v14 or higher)
- MongoDB (running on localhost:27017)
- Git

### Installation

1. Navigate to the project directory:

   ```bash
   cd news-api
   ```

2. Install dependencies:

   ```bash
   npm install
   ```

3. Make sure MongoDB is running on your system

4. Start the application:

   ```bash
   npm start
   ```

   For development with auto-reload:

   ```bash
   npm run dev
   ```

### Usage

1. Open your browser and go to `http://localhost:3000`
2. Click "Connect to WebSocket" to start receiving news articles
3. The app will automatically fetch news from one day before the current date
4. If there are more than 10 articles, you'll receive the first 10 immediately, then the rest will stream every 2 minutes

### API Endpoints

- `GET /` - Web interface for testing WebSocket connections
- `GET /api/health` - Health check endpoint
- `ws://localhost:3000` - WebSocket endpoint for news streaming

### Environment Variables

- `NEWS_API_KEY` - Your NewsAPI.org API key
- `MONGODB_URI` - MongoDB connection string
- `PORT` - Server port (default: 3000)

### Project Structure

```
news-api/
├── config/
│   └── database.js          # MongoDB connection
├── models/
│   └── NewsArticle.js       # Mongoose schema
├── services/
│   ├── NewsService.js       # News fetching and storage logic
│   └── WebSocketServer.js   # WebSocket server implementation
├── server.js                # Main server file
├── package.json
├── .env                     # Environment variables
├── .gitignore
└── README.md
```

### How It Works

1. **News Fetching**: The app fetches news from NewsAPI.org for the previous day with query parameter `q=India`
2. **Database Storage**: Articles are stored in MongoDB with duplicate URL prevention
3. **WebSocket Streaming**:
   - If ≤10 articles: Send all at once
   - If >10 articles: Send first 10 immediately, then stream remaining articles every 2 minutes
4. **Caching**: If articles exist in the database for the target date, they're served directly without API calls

### Error Handling

- Handles API rate limits and errors gracefully
- Duplicate article prevention via unique URL constraint
- WebSocket connection error handling
- MongoDB connection error handling
