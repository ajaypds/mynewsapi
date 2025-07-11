# News API - Advanced WebSocket News Streaming Application

A comprehensive Node.js application that fetches daily news from NewsAPI.org, automatically categorizes articles using intelligent keyword matching, stores them in MongoDB, and streams them via WebSocket with advanced filtering, resume functionality, and date support.

## 🎯 Features

### Core Functionality
- **Smart News Fetching**: Automatically fetches news for any specified date with intelligent date validation
- **Automatic Categorization**: AI-powered categorization based on article titles using advanced keyword matching
- **MongoDB Storage**: Efficient storage with duplicate prevention, category indexing, and optimized queries
- **WebSocket Streaming**: Real-time streaming with configurable intervals and connection management
- **Resume Capability**: Continue streaming from any article index with complete state preservation
- **Category Filtering**: Stream articles from specific categories with smart filtering
- **Date Support**: Fetch and stream articles from any past date with comprehensive validation

### Supported Categories (13 Total)
- **Politics** - Government, elections, political parties, democracy, ministers, parliament
- **Business** - Economy, markets, corporate news, trading, stocks, IPOs, mergers
- **Technology** - Tech innovations, AI, software, startups, programming, digital transformation
- **Sports** - Cricket, football, Olympics, tournaments, championships, player news
- **Entertainment** - Bollywood, movies, music, celebrities, OTT platforms, awards
- **Health** - Medical news, vaccines, wellness, mental health, healthcare policies
- **Science** - Research, space exploration, discoveries, climate science, ISRO/NASA
- **Education** - Schools, exams, academic news, education policies, skill development
- **Crime** - Criminal activities, police investigations, court cases, cybercrime
- **International** - Global affairs, diplomatic relations, foreign policy, trade agreements
- **Environment** - Climate change, pollution, conservation, sustainability, natural disasters
- **Economy** - Economic policies, inflation, GDP, employment, fiscal measures
- **Defense** - Military operations, security, defense technology, national security
- **General** - Miscellaneous news that doesn't fit other categories

### Advanced Streaming Features
- **Smart Batching**: ≤10 articles sent at once, >10 articles use batch + streaming
- **Resume Intelligence**: Skip processed articles and continue from any index
- **Category Intelligence**: Automatic keyword-based categorization with scoring
- **Date Intelligence**: Smart date validation and fallback mechanisms
- **Connection Management**: Auto-close on completion, proper cleanup
- **Android-style UI**: Newest articles at top, chronological streaming

## 🚀 Installation & Setup

### Prerequisites
- Node.js 18+ (recommended via NVM)
- MongoDB (local installation or MongoDB Atlas)
- NewsAPI.org API key (free tier available)

### Environment Variables
Create a `.env` file in the project root:
```env
NEWS_API_KEY=your_newsapi_key_here
MONGODB_URI=mongodb://localhost:27017/news-api
PORT=3000
STREAM_INTERVAL_SECONDS=120
```

### Quick Start
```bash
# Clone and navigate
git clone <your-repo-url>
cd news-api

# Install dependencies
npm install

# Start development server
npm run dev

# Or start production server
npm start
```

## 🌐 WebSocket API Reference

### Basic Connection
```javascript
// Stream all articles from yesterday (default behavior)
const ws = new WebSocket('ws://localhost:3000');
```

### Resume from Specific Index
```javascript
// Resume from 11th article (0-based index 10)
const ws = new WebSocket('ws://localhost:3000?resumeFrom=10');

// Resume from 26th article (0-based index 25)
const ws = new WebSocket('ws://localhost:3000?resumeFrom=25');
```

### Category Filtering
```javascript
// Stream only Technology articles
const ws = new WebSocket('ws://localhost:3000?category=Technology');

// Stream only Sports articles
const ws = new WebSocket('ws://localhost:3000?category=Sports');

// Stream only Politics articles
const ws = new WebSocket('ws://localhost:3000?category=Politics');
```

### Date-based Queries
```javascript
// Get articles from July 9, 2025
const ws = new WebSocket('ws://localhost:3000?date=2025-07-09');

// Get Technology articles from a specific date
const ws = new WebSocket('ws://localhost:3000?category=Technology&date=2025-07-08');
```

### Advanced Combined Queries
```javascript
// Resume from 6th Sports article on July 9th
const ws = new WebSocket('ws://localhost:3000?category=Sports&resumeFrom=5&date=2025-07-09');

// Resume from 15th article of any category on a specific date
const ws = new WebSocket('ws://localhost:3000?resumeFrom=14&date=2025-07-07');

// Get Business articles from July 8th, starting from 3rd article
const ws = new WebSocket('ws://localhost:3000?category=Business&date=2025-07-08&resumeFrom=2');
```

### Date Validation Logic
- **No date provided**: Uses yesterday's date automatically
- **Date is today or future**: Falls back to yesterday's date with warning
- **Date is in the past**: Uses the provided date
- **Invalid date format**: Falls back to yesterday's date with error logging
- **Supported format**: YYYY-MM-DD (ISO date format)

## 📱 WebSocket Message Protocols

### Batch Message (Initial 10 articles)
```json
{
  "type": "batch",
  "articles": [
    {
      "_id": "60f7b3b3b3b3b3b3b3b3b3b3",
      "title": "AI Revolution in Healthcare Diagnostics",
      "description": "New machine learning algorithms are transforming medical diagnosis...",
      "category": "Technology",
      "publishedAt": "2025-07-09T04:20:10.000Z",
      "source": {
        "id": "techcrunch",
        "name": "TechCrunch"
      },
      "author": "Jane Smith",
      "url": "https://techcrunch.com/ai-healthcare",
      "urlToImage": "https://images.unsplash.com/photo-ai-healthcare.jpg",
      "content": "Full article content..."
    }
    // ... 9 more articles
  ],
  "total": 95,
  "startIndex": 0,
  "endIndex": 9,
  "message": "First 10 articles sent. 85 more to follow."
}
```

### Stream Message (Individual articles)
```json
{
  "type": "stream",
  "article": {
    "_id": "60f7b3b3b3b3b3b3b3b3b3b4",
    "title": "Cricket World Cup Final: India vs Australia",
    "description": "Epic finale between two cricket powerhouses...",
    "category": "Sports",
    "publishedAt": "2025-07-09T10:30:00.000Z",
    "source": {
      "id": "espn-cricket",
      "name": "ESPN Cricinfo"
    },
    "author": "Sports Desk",
    "url": "https://espncricinfo.com/world-cup-final",
    "urlToImage": "https://images.unsplash.com/cricket-stadium.jpg",
    "content": "Match details and analysis..."
  },
  "index": 11,
  "total": 95,
  "category": "Sports",
  "message": "Article 11 of 95 (Sports)"
}
```

### Error Messages
```json
{
  "type": "error",
  "message": "No news articles available for category \"Technology\" on 2025-07-09"
}

{
  "type": "error", 
  "message": "Resume index 100 is beyond available articles (95)"
}

{
  "type": "error",
  "message": "Invalid date format provided: 2025-13-45, using yesterday's date"
}
```

## 🔧 HTTP REST API

### Health Check & Server Info
```bash
GET /api/health

Response:
{
  "status": "OK",
  "message": "News API Server is running",
  "timestamp": "2025-07-10T12:00:00.000Z",
  "endpoints": {
    "websocket": "ws://localhost:3000",
    "health": "/api/health",
    "categories": "/api/categories", 
    "stats": "/api/stats"
  }
}
```

### Available Categories & Usage Examples
```bash
GET /api/categories

Response:
{
  "categories": [
    "Politics", "Business", "Technology", "Sports", 
    "Entertainment", "Health", "Science", "Education",
    "Crime", "International", "Environment", "Economy", "Defense"
  ],
  "usage": {
    "all": "ws://localhost:3000",
    "category": "ws://localhost:3000?category=Technology",
    "resume": "ws://localhost:3000?resumeFrom=10",
    "date": "ws://localhost:3000?date=2025-07-09",
    "combined": "ws://localhost:3000?category=Sports&resumeFrom=5&date=2025-07-09"
  }
}
```

### Category Statistics & Analytics
```bash
GET /api/stats

Response:
{
  "date": "2025-07-09",
  "statistics": [
    { "_id": "Politics", "count": 25 },
    { "_id": "Technology", "count": 18 },
    { "_id": "Sports", "count": 15 },
    { "_id": "Business", "count": 12 },
    { "_id": "Entertainment", "count": 8 },
    { "_id": "Health", "count": 7 },
    { "_id": "General", "count": 10 }
  ],
  "total": 95
}
```

## 💻 Client Implementation Examples

### JavaScript WebSocket Client
```javascript
class NewsClient {
    constructor() {
        this.articleCount = 0;
        this.totalCount = 0;
    }

    connect(options = {}) {
        const { category, resumeFrom, date } = options;
        let url = 'ws://localhost:3000';
        
        const params = new URLSearchParams();
        if (category) params.append('category', category);
        if (resumeFrom) params.append('resumeFrom', resumeFrom);
        if (date) params.append('date', date);
        
        if (params.toString()) {
            url += '?' + params.toString();
        }

        console.log('Connecting to:', url);
        this.ws = new WebSocket(url);
        this.setupEventHandlers();
    }

    setupEventHandlers() {
        this.ws.onopen = () => {
            console.log('Connected to News API');
        };

        this.ws.onmessage = (event) => {
            const data = JSON.parse(event.data);
            this.handleMessage(data);
        };

        this.ws.onclose = () => {
            console.log('Connection closed - all articles received');
        };

        this.ws.onerror = (error) => {
            console.error('WebSocket error:', error);
        };
    }

    handleMessage(data) {
        switch(data.type) {
            case 'batch':
                console.log(`Received batch: ${data.articles.length} articles`);
                this.totalCount = data.total;
                this.articleCount += data.articles.length;
                data.articles.forEach(article => this.displayArticle(article));
                break;

            case 'stream':
                console.log(`Received article ${data.index}/${data.total}: ${data.article.title}`);
                this.articleCount++;
                this.displayArticle(data.article);
                break;

            case 'error':
                console.error('Server error:', data.message);
                break;
        }
    }

    displayArticle(article) {
        console.log(`[${article.category}] ${article.title}`);
        console.log(`Source: ${article.source.name} | ${new Date(article.publishedAt).toLocaleString()}`);
        console.log(`URL: ${article.url}\n`);
    }
}

// Usage Examples
const client = new NewsClient();

// Get all articles from yesterday
client.connect();

// Get Technology articles from a specific date
client.connect({
    category: 'Technology',
    date: '2025-07-09'
});

// Resume Sports articles from index 10
client.connect({
    category: 'Sports',
    resumeFrom: 10
});
```

### Python WebSocket Client
```python
import asyncio
import websockets
import json
from urllib.parse import urlencode

class NewsClient:
    def __init__(self):
        self.article_count = 0
        self.total_count = 0

    async def connect(self, category=None, resume_from=None, date=None):
        url = "ws://localhost:3000"
        
        params = {}
        if category:
            params['category'] = category
        if resume_from is not None:
            params['resumeFrom'] = resume_from
        if date:
            params['date'] = date
            
        if params:
            url += '?' + urlencode(params)
            
        print(f"Connecting to: {url}")
        
        async with websockets.connect(url) as websocket:
            async for message in websocket:
                data = json.loads(message)
                await self.handle_message(data)

    async def handle_message(self, data):
        if data['type'] == 'batch':
            print(f"Received batch: {len(data['articles'])} articles")
            self.total_count = data['total']
            self.article_count += len(data['articles'])
            
            for article in data['articles']:
                self.display_article(article)
                
        elif data['type'] == 'stream':
            print(f"Received article {data['index']}/{data['total']}: {data['article']['title']}")
            self.article_count += 1
            self.display_article(data['article'])
            
        elif data['type'] == 'error':
            print(f"Server error: {data['message']}")

    def display_article(self, article):
        print(f"[{article['category']}] {article['title']}")
        print(f"Source: {article['source']['name']}")
        print(f"URL: {article['url']}\n")

# Usage
async def main():
    client = NewsClient()
    
    # Get Technology articles from July 9th
    await client.connect(category='Technology', date='2025-07-09')

if __name__ == "__main__":
    asyncio.run(main())
```

## 🏗️ Architecture & Technical Details

### Project Structure
```
news-api/
├── config/
│   └── database.js              # MongoDB connection & configuration
├── models/
│   └── NewsArticle.js           # Mongoose schema with category support
├── services/
│   ├── CategoryService.js       # Intelligent categorization engine
│   ├── NewsService.js           # News fetching, storage & retrieval
│   └── WebSocketServer.js       # WebSocket server & streaming logic
├── server.js                    # Main application server
├── package.json                 # Dependencies & scripts
├── .env                         # Environment configuration
├── .env.example                 # Environment template
├── .gitignore                   # Git ignore rules
└── README.md                    # Documentation
```

### Database Schema & Indexing
```javascript
// NewsArticle Schema
{
  source: { id: String, name: String },
  author: String,
  title: String (required),
  description: String,
  url: String (required, unique),
  urlToImage: String,
  publishedAt: Date (required),
  content: String,
  fetchDate: Date (required),
  category: String (required, enum: [...categories])
}

// Optimized Indexes
- { fetchDate: 1 }                    // Date-based queries
- { category: 1 }                     // Category filtering
- { fetchDate: 1, category: 1 }       // Combined queries
- { url: 1 } (unique)                 // Duplicate prevention
```

### Categorization Algorithm
1. **Keyword Extraction**: Extract keywords from article titles
2. **Category Scoring**: Score each category based on keyword matches
3. **Weight Assignment**: Exact word matches get higher scores than partial matches
4. **Best Match Selection**: Category with highest score wins
5. **Fallback Handling**: Default to "General" if no matches found

### Smart Date Processing
1. **Input Validation**: Check date format and validity
2. **Temporal Logic**: Reject future dates, accept past dates
3. **Automatic Fallback**: Use yesterday's date for invalid inputs
4. **Database Optimization**: Query by date ranges for efficiency

## 🔧 Configuration & Environment

### Environment Variables
```env
# Required
NEWS_API_KEY=your_newsapi_org_key

# Database
MONGODB_URI=mongodb://localhost:27017/news-api

# Server Configuration  
PORT=3000
STREAM_INTERVAL_SECONDS=120

# Optional: Logging
LOG_LEVEL=info
NODE_ENV=production
```

### NPM Scripts
```json
{
  "start": "node server.js",           // Production server
  "dev": "nodemon server.js",          // Development with auto-reload
  "build": "echo 'No build required'", // Placeholder
  "test": "echo 'Tests not configured'", // Placeholder
  "lint": "echo 'Linting not configured'", // Placeholder
  "clean": "rm -rf node_modules/.cache" // Clean cache
}
```

## 🚀 Production Deployment

### AWS EC2 Deployment Guide
1. **Launch EC2 Instance** (Ubuntu 20.04+)
2. **Install Node.js via NVM**
3. **Setup MongoDB** (local or Atlas)
4. **Configure Environment Variables**
5. **Use PM2 for Process Management**
6. **Setup Nginx as Reverse Proxy**
7. **Configure Security Groups**

### Process Management with PM2
```bash
# Install PM2 globally
npm install -g pm2

# Start application
pm2 start server.js --name "news-api"

# Monitor application
pm2 monit

# View logs
pm2 logs news-api

# Restart application
pm2 restart news-api

# Save PM2 configuration
pm2 save
pm2 startup
```

### Nginx Configuration
```nginx
server {
    listen 80;
    server_name your-domain.com;

    location / {
        proxy_pass http://localhost:3000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        proxy_cache_bypass $http_upgrade;
    }
}
```

## 📊 Performance & Monitoring

### Performance Features
- **Efficient MongoDB Queries**: Optimized indexes for fast retrieval
- **Connection Pooling**: Mongoose connection pooling
- **Memory Management**: Stream processing without loading all articles
- **Rate Limiting**: Respects NewsAPI rate limits
- **Caching Strategy**: Database caching reduces API calls
- **Background Processing**: Non-blocking article processing

### Monitoring & Logging
- **Connection Logging**: Track WebSocket connections/disconnections
- **Error Handling**: Comprehensive error logging and recovery
- **Performance Metrics**: Article processing times and counts
- **Category Analytics**: Real-time category distribution stats

## 🔒 Security & Best Practices

### Security Measures
- **Environment Variables**: Secure credential management
- **Input Validation**: Query parameter validation and sanitization
- **MongoDB Injection Prevention**: Mongoose schema validation
- **Error Handling**: Graceful error handling without data exposure
- **Connection Limits**: WebSocket connection management

### Best Practices Implemented
- **RESTful API Design**: Clean and intuitive endpoint structure
- **Error Messages**: User-friendly error messages
- **Documentation**: Comprehensive API documentation
- **Code Organization**: Modular, maintainable code structure
- **Database Optimization**: Proper indexing and query optimization

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## 📄 License

This project is licensed under the MIT License - see the LICENSE file for details.

## 🙏 Acknowledgments

- NewsAPI.org for providing comprehensive news data
- MongoDB for robust document storage
- Node.js and WebSocket communities for excellent libraries
- Contributors and users for feedback and suggestions

---

**Built with ❤️ for real-time news streaming and intelligent content categorization.**
