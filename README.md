# News API WebSocket Server

A Node.js application that fetches daily news from NewsAPI.org and streams them to clients via WebSocket.

## Features

- Fetches daily news from NewsAPI.org for India-related topics
- Stores articles in MongoDB using Mongoose
- Streams news articles via WebSocket with resume functionality
- Batches first 10 articles, then streams remaining articles at configurable intervals
- Resume streaming from any article index using query parameters
- Android-style notification display (newest articles at top)
- Includes a web interface for testing WebSocket connections (commented out in production)

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

1. **Basic Connection**: Connect to `ws://localhost:3000`
2. **Resume Connection**: Connect to `ws://localhost:3000?resumeFrom=10` to start from article index 10
3. The app will automatically fetch news from one day before the current date
4. If there are more than 10 articles, you'll receive the first 10 immediately, then the rest will stream at configurable intervals

### API Endpoints

- `GET /api/health` - Health check endpoint
- `ws://localhost:3000` - WebSocket endpoint for news streaming (starts from beginning)
- `ws://localhost:3000?resumeFrom=N` - WebSocket endpoint to resume from article index N (0-based)

### WebSocket Resume Feature

The WebSocket endpoint supports resuming from any article index using query parameters:

```javascript
// Connect from the beginning
const ws = new WebSocket("ws://localhost:3000");

// Resume from article index 10 (0-based, so this is the 11th article)
const ws = new WebSocket("ws://localhost:3000?resumeFrom=10");

// Resume from article index 25
const ws = new WebSocket("ws://localhost:3000?resumeFrom=25");
```

**Message Types:**

- `info` - Information about resume operation
- `batch` - Initial batch of articles (up to 10)
- `stream` - Individual articles streamed at intervals
- `complete` - All articles have been sent
- `error` - Error occurred

### Environment Variables

- `NEWS_API_KEY` - Your NewsAPI.org API key
- `MONGODB_URI` - MongoDB connection string
- `PORT` - Server port (default: 3000)
- `STREAM_INTERVAL_SECONDS` - Interval between streamed articles (default: 120 seconds)

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
   - **Resume Support**: Connect with `?resumeFrom=N` to start from article index N
   - **Batching**: Send up to 10 articles immediately from the resume point
   - **Streaming**: Stream remaining articles at configurable intervals (default: 120 seconds)
   - **Android-style Display**: Newest articles appear at the top
4. **Caching**: If articles exist in the database for the target date, they're served directly without API calls

### Resume Examples

```bash
# Start from beginning (default)
ws://localhost:3000

# Resume from 11th article (index 10)
ws://localhost:3000?resumeFrom=10

# Resume from 26th article (index 25)
ws://localhost:3000?resumeFrom=25
```

**Index Notes:**

- Indexes are 0-based (0 = first article, 10 = eleventh article)
- If resumeFrom exceeds available articles, an error is returned
- Articles are ordered by publication date (oldest first)

### Error Handling

- Handles API rate limits and errors gracefully
- Duplicate article prevention via unique URL constraint
- WebSocket connection error handling
- MongoDB connection error handling
