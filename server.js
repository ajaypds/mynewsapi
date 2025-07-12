require('dotenv').config();
const http = require('http');
const path = require('path');
const Database = require('./config/database');
const WebSocketServer = require('./services/WebSocketServer');

class Server {
    constructor() {
        this.port = process.env.PORT || 3000;
        this.server = http.createServer(this.handleHttpRequest.bind(this));
    }

    handleHttpRequest(req, res) {
        // if (req.url === '/') {
        //     // Serve a simple HTML page for testing WebSocket connection
        //     res.writeHead(200, { 'Content-Type': 'text/html' });
        //     res.end(`
        // <!DOCTYPE html>
        // <html>
        // <head>
        //     <title>News API WebSocket Client</title>
        //     <style>
        //         body { font-family: Arial, sans-serif; margin: 20px; }
        //         .article { border: 1px solid #ccc; margin: 10px 0; padding: 15px; border-radius: 5px; }
        //         .article h3 { margin-top: 0; }
        //         .status { padding: 10px; margin: 10px 0; border-radius: 5px; }
        //         .status.info { background-color: #d4edda; color: #155724; }
        //         .status.error { background-color: #f8d7da; color: #721c24; }
        //         .status.warning { background-color: #fff3cd; color: #856404; }
        //         .stats { background-color: #f8f9fa; padding: 10px; border-radius: 5px; margin: 10px 0; }
        //         .controls { background-color: #e9ecef; padding: 15px; border-radius: 5px; margin: 10px 0; }
        //         .controls input { margin: 5px; padding: 5px; }
        //         .controls button { margin: 5px; padding: 8px 12px; }
        //     </style>
        // </head>
        // <body>
        //     <h1>News API WebSocket Client</h1>
        //     
        //     <div class="controls">
        //         <h3>Connection Controls</h3>
        //         <button onclick="connect()">Connect from Start</button>
        //         <button onclick="disconnect()">Disconnect</button>
        //         <br><br>
        //         <label for="resumeIndex">Resume from index:</label>
        //         <input type="number" id="resumeIndex" min="0" value="0" placeholder="0">
        //         <button onclick="connectWithResume()">Connect & Resume</button>
        //         <br><small>Note: Index is 0-based (0 = first article, 10 = eleventh article, etc.)</small>
        //     </div>

        //     <div id="status" class="status info">Ready to connect</div>
        //     <div id="stats" class="stats">
        //         <strong>Articles received:</strong> <span id="articleCount">0</span> / <span id="totalCount">0</span>
        //         <br><strong>Current range:</strong> <span id="currentRange">Not connected</span>
        //     </div>

        //     <div id="articles"></div>

        //     <script>
        //         let ws;
        //         let articleCount = 0;
        //         let totalCount = 0;
        //         let currentResumeIndex = 0;

        //         function connect() {
        //             connectToWebSocket();
        //         }

        //         function connectWithResume() {
        //             const resumeIndex = parseInt(document.getElementById('resumeIndex').value) || 0;
        //             currentResumeIndex = resumeIndex;
        //             connectToWebSocket(resumeIndex);
        //         }

        //         function connectToWebSocket(resumeFrom = null) {
        //             let wsUrl = 'ws://localhost:${this.port}';
        //             if (resumeFrom !== null && resumeFrom > 0) {
        //                 wsUrl += '?resumeFrom=' + resumeFrom;
        //             }

        //             console.log('Connecting to:', wsUrl);
        //             ws = new WebSocket(wsUrl);

        //             ws.onopen = function() {
        //                 document.getElementById('status').innerHTML = 'Connected to WebSocket' + 
        //                     (resumeFrom ? ' (Resume from index ' + resumeFrom + ')' : '');
        //                 document.getElementById('status').className = 'status info';
        //                 
        //                 // Reset counters
        //                 articleCount = 0;
        //                 totalCount = 0;
        //                 updateStats();
        //             };

        //             ws.onmessage = function(event) {
        //                 const data = JSON.parse(event.data);
        //                 handleMessage(data);
        //             };

        //             ws.onclose = function() {
        //                 document.getElementById('status').innerHTML = 'Disconnected from WebSocket';
        //                 document.getElementById('status').className = 'status error';
        //                 document.getElementById('currentRange').textContent = 'Not connected';
        //             };

        //             ws.onerror = function(error) {
        //                 document.getElementById('status').innerHTML = 'WebSocket Error: ' + error;
        //                 document.getElementById('status').className = 'status error';
        //             };
        //         }

        //         function disconnect() {
        //             if (ws) {
        //                 ws.close();
        //             }
        //         }

        //         function handleMessage(data) {
        //             const articlesDiv = document.getElementById('articles');

        //             switch(data.type) {
        //                 case 'info':
        //                     document.getElementById('status').innerHTML = data.message;
        //                     document.getElementById('status').className = 'status warning';
        //                     totalCount = data.total;
        //                     updateStats();
        //                     break;

        //                 case 'batch':
        //                     totalCount = data.total;
        //                     articleCount += data.articles.length;
        //                     data.articles.forEach(article => displayArticle(article));
        //                     updateStats();
        //                     document.getElementById('status').innerHTML = data.message;
        //                     document.getElementById('currentRange').textContent = 
        //                         \`Articles \${(data.startIndex || 0) + 1}-\${(data.endIndex || data.articles.length - 1) + 1}\`;
        //                     break;

        //                 case 'stream':
        //                     articleCount++;
        //                     displayArticle(data.article);
        //                     updateStats();
        //                     document.getElementById('status').innerHTML = data.message;
        //                     break;

        //                 case 'complete':
        //                     document.getElementById('status').innerHTML = data.message;
        //                     document.getElementById('status').className = 'status info';
        //                     break;

        //                 case 'error':
        //                     document.getElementById('status').innerHTML = 'Error: ' + data.message;
        //                     document.getElementById('status').className = 'status error';
        //                     break;
        //             }
        //         }

        //         function displayArticle(article) {
        //             const articlesDiv = document.getElementById('articles');
        //             const articleDiv = document.createElement('div');
        //             articleDiv.className = 'article';

        //             // Format date and time properly
        //             const publishedDate = new Date(article.publishedAt);
        //             const formattedDateTime = publishedDate.toISOString().replace('T', ' ').substring(0, 19); // YYYY-MM-DD HH:MM:SS format

        //             articleDiv.innerHTML = \`
        //                 <h3>\${article.title}</h3>
        //                 <p><strong>Source:</strong> \${article.source.name}</p>
        //                 <p><strong>Author:</strong> \${article.author || 'Unknown'}</p>
        //                 <p><strong>Published:</strong> \${formattedDateTime}</p>
        //                 <p>\${article.description || ''}</p>
        //                 <p><a href="\${article.url}" target="_blank">Read full article</a></p>
        //             \`;

        //             // Insert at the top (like Android push notifications)
        //             articlesDiv.insertBefore(articleDiv, articlesDiv.firstChild);
        //         }

        //         function updateStats() {
        //             document.getElementById('articleCount').textContent = articleCount;
        //             document.getElementById('totalCount').textContent = totalCount;
        //         }
        //     </script>
        // </body>
        // </html>
        //   `);
        // } else 
        if (req.url === '/api/health') {
            res.writeHead(200, { 'Content-Type': 'application/json' });
            res.end(JSON.stringify({
                status: 'OK',
                message: 'News API Server is running',
                timestamp: new Date().toISOString(),
                endpoints: {
                    websocket: 'ws://localhost:3000 (supports: category, resumeFrom)',
                    http_filter: '/filter?date=YYYY-MM-DD (requires date < yesterday, optional category)',
                    health: '/api/health',
                    categories: '/api/categories',
                    stats: '/api/stats'
                }
            }));
        } else if (req.url === '/api/categories') {
            // Return available categories
            const CategoryService = require('./services/CategoryService');
            const categoryService = new CategoryService();

            res.writeHead(200, { 'Content-Type': 'application/json' });
            res.end(JSON.stringify({
                categories: categoryService.getAvailableCategories(),
                usage: {
                    websocket: {
                        all: 'ws://localhost:3000',
                        category: 'ws://localhost:3000?category=Technology',
                        resume: 'ws://localhost:3000?resumeFrom=10',
                        combined: 'ws://localhost:3000?category=Sports&resumeFrom=5'
                    },
                    http_filter: {
                        date: '/filter?date=2025-07-09 (date must be < yesterday)',
                        combined: '/filter?category=Technology&date=2025-07-09 (date must be < yesterday)'
                    }
                }
            }));
        } else if (req.url === '/api/stats') {
            // Return category statistics
            const NewsService = require('./services/NewsService');
            const newsService = new NewsService();

            newsService.getCategoryStats()
                .then(stats => {
                    res.writeHead(200, { 'Content-Type': 'application/json' });
                    res.end(JSON.stringify({
                        date: newsService.getYesterdayDate(),
                        statistics: stats,
                        total: stats.reduce((sum, stat) => sum + stat.count, 0)
                    }));
                })
                .catch(error => {
                    res.writeHead(500, { 'Content-Type': 'application/json' });
                    res.end(JSON.stringify({
                        error: 'Failed to get category statistics',
                        message: error.message
                    }));
                });
        } else if (req.url.startsWith('/filter')) {
            // HTTP endpoint for filtering articles by category and date (no resumeFrom)
            this.handleFilterRequest(req, res);
        } else {
            res.writeHead(404, { 'Content-Type': 'application/json' });
            res.end(JSON.stringify({
                error: 'Not Found',
                message: 'The requested endpoint does not exist'
            }));
        }
    } async handleFilterRequest(req, res) {
        try {
            const url = require('url');
            const parsedUrl = url.parse(req.url, true);
            const query = parsedUrl.query;

            // Extract filter parameters
            const category = query.category;
            const date = query.date;

            // REQUIREMENT: date parameter is mandatory
            if (!date) {
                res.writeHead(200, { 'Content-Type': 'application/json' });
                res.end(JSON.stringify([]));
                return;
            }

            // REQUIREMENT: Only return data if date is less than yesterday
            const today = new Date();
            const yesterday = new Date(today);
            yesterday.setDate(today.getDate() - 1);
            const yesterdayDateString = yesterday.toISOString().split('T')[0]; // YYYY-MM-DD format

            const requestedDate = new Date(date);
            const requestedDateString = requestedDate.toISOString().split('T')[0];

            // If requested date is not less than yesterday, return empty array
            if (requestedDateString >= yesterdayDateString) {
                res.writeHead(200, { 'Content-Type': 'application/json' });
                res.end(JSON.stringify([]));
                return;
            }

            console.log(`HTTP Filter request - Category: ${category || 'all'}, Date: ${date}`);

            // Initialize NewsService
            const NewsService = require('./services/NewsService');
            const newsService = new NewsService();

            // Get filtered articles
            let articles;
            if (category) {
                articles = await newsService.getNewsByCategory(category, date);
            } else {
                articles = await newsService.getNews(date);
            }

            // Convert articles to plain objects and include category
            const responseArticles = articles.map(article => ({
                ...article.toObject(),
                category: article.category
            }));

            // REQUIREMENT: Return only articles array
            res.writeHead(200, { 'Content-Type': 'application/json' });
            res.end(JSON.stringify(responseArticles));

        } catch (error) {
            // REQUIREMENT: On any error, return empty array
            console.error('Error in HTTP filter endpoint:', error.message);
            res.writeHead(200, { 'Content-Type': 'application/json' });
            res.end(JSON.stringify([]));
        }
    }

    async start() {
        try {
            // Connect to MongoDB
            await Database.connect();

            // Start HTTP server
            this.server.listen(this.port, () => {
                console.log(`Server running on port ${this.port}`);
                console.log(`WebSocket endpoint: ws://localhost:${this.port}`);
                console.log(`Web interface: http://localhost:${this.port}`);
            });

            // Initialize WebSocket server
            new WebSocketServer(this.server);

        } catch (error) {
            console.error('Failed to start server:', error.message);
            process.exit(1);
        }
    }
}

// Start the server
const server = new Server();
server.start();
