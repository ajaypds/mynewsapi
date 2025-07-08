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
        if (req.url === '/') {
            // Serve a simple HTML page for testing WebSocket connection
            res.writeHead(200, { 'Content-Type': 'text/html' });
            res.end(`
        <!DOCTYPE html>
        <html>
        <head>
            <title>News API WebSocket Client</title>
            <style>
                body { font-family: Arial, sans-serif; margin: 20px; }
                .article { border: 1px solid #ccc; margin: 10px 0; padding: 15px; border-radius: 5px; }
                .article h3 { margin-top: 0; }
                .article img { max-width: 100%; height: auto; margin: 10px 0; }
                .status { padding: 10px; margin: 10px 0; border-radius: 5px; }
                .status.info { background-color: #d4edda; color: #155724; }
                .status.error { background-color: #f8d7da; color: #721c24; }
                .stats { background-color: #f8f9fa; padding: 10px; border-radius: 5px; margin: 10px 0; }
            </style>
        </head>
        <body>
            <h1>News API WebSocket Client</h1>
            <button onclick="connect()">Connect to WebSocket</button>
            <button onclick="disconnect()">Disconnect</button>
            
            <div id="status" class="status info">Ready to connect</div>
            <div id="stats" class="stats">
                <strong>Articles received:</strong> <span id="articleCount">0</span> / <span id="totalCount">0</span>
            </div>
            
            <div id="articles"></div>

            <script>
                let ws;
                let articleCount = 0;
                let totalCount = 0;

                function connect() {
                    ws = new WebSocket('ws://localhost:${this.port}');
                    
                    ws.onopen = function() {
                        document.getElementById('status').innerHTML = 'Connected to WebSocket';
                        document.getElementById('status').className = 'status info';
                    };
                    
                    ws.onmessage = function(event) {
                        const data = JSON.parse(event.data);
                        handleMessage(data);
                    };
                    
                    ws.onclose = function() {
                        document.getElementById('status').innerHTML = 'Disconnected from WebSocket';
                        document.getElementById('status').className = 'status error';
                    };
                    
                    ws.onerror = function(error) {
                        document.getElementById('status').innerHTML = 'WebSocket Error: ' + error;
                        document.getElementById('status').className = 'status error';
                    };
                }

                function disconnect() {
                    if (ws) {
                        ws.close();
                    }
                }

                function handleMessage(data) {
                    const articlesDiv = document.getElementById('articles');
                    
                    switch(data.type) {
                        case 'batch':
                            totalCount = data.total;
                            articleCount += data.articles.length;
                            data.articles.forEach(article => displayArticle(article));
                            updateStats();
                            document.getElementById('status').innerHTML = data.message;
                            break;
                            
                        case 'stream':
                            articleCount++;
                            displayArticle(data.article);
                            updateStats();
                            document.getElementById('status').innerHTML = data.message;
                            break;
                            
                        case 'complete':
                            document.getElementById('status').innerHTML = data.message;
                            document.getElementById('status').className = 'status info';
                            break;
                            
                        case 'error':
                            document.getElementById('status').innerHTML = 'Error: ' + data.message;
                            document.getElementById('status').className = 'status error';
                            break;
                    }
                }

                function displayArticle(article) {
                    const articlesDiv = document.getElementById('articles');
                    const articleDiv = document.createElement('div');
                    articleDiv.className = 'article';
                    
                    articleDiv.innerHTML = \`
                        <h3>\${article.title}</h3>
                        <p><strong>Source:</strong> \${article.source.name}</p>
                        <p><strong>Author:</strong> \${article.author || 'Unknown'}</p>
                        <p><strong>Published:</strong> \${new Date(article.publishedAt).toLocaleString()}</p>
                        \${article.urlToImage ? \`<img src="\${article.urlToImage}" alt="Article image">\` : ''}
                        <p>\${article.description || ''}</p>
                        <p><a href="\${article.url}" target="_blank">Read full article</a></p>
                    \`;
                    
                    articlesDiv.appendChild(articleDiv);
                }

                function updateStats() {
                    document.getElementById('articleCount').textContent = articleCount;
                    document.getElementById('totalCount').textContent = totalCount;
                }
            </script>
        </body>
        </html>
      `);
        } else if (req.url === '/api/health') {
            res.writeHead(200, { 'Content-Type': 'application/json' });
            res.end(JSON.stringify({ status: 'OK', timestamp: new Date().toISOString() }));
        } else {
            res.writeHead(404, { 'Content-Type': 'text/plain' });
            res.end('Not Found');
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
