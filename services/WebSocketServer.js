const WebSocket = require('ws');
const NewsService = require('./NewsService');

class WebSocketServer {
    constructor(server) {
        this.wss = new WebSocket.Server({ server });
        this.newsService = new NewsService();
        this.setupWebSocket();
    }

    setupWebSocket() {
        this.wss.on('connection', (ws) => {
            console.log('Client connected');

            ws.on('message', (message) => {
                console.log('Received message:', message.toString());
            });

            ws.on('close', () => {
                console.log('Client disconnected');
            });

            ws.on('error', (error) => {
                console.error('WebSocket error:', error);
            });

            // Start streaming news to the connected client
            this.streamNews(ws);
        });
    }

    async streamNews(ws) {
        try {
            const articles = await this.newsService.getNews();

            if (articles.length === 0) {
                ws.send(JSON.stringify({
                    type: 'error',
                    message: 'No news articles available for yesterday'
                }));
                return;
            }

            // Send initial batch
            if (articles.length <= 10) {
                // Send all articles at once
                ws.send(JSON.stringify({
                    type: 'batch',
                    articles: articles,
                    total: articles.length,
                    message: 'All articles sent'
                }));
            } else {
                // Send first 10 articles immediately
                const firstBatch = articles.slice(0, 10);
                ws.send(JSON.stringify({
                    type: 'batch',
                    articles: firstBatch,
                    total: articles.length,
                    message: `First 10 articles sent. ${articles.length - 10} more to follow.`
                }));

                // Stream remaining articles one by one every 2 minutes
                const remainingArticles = articles.slice(10);
                let index = 0;

                const streamInterval = setInterval(() => {
                    if (index < remainingArticles.length && ws.readyState === WebSocket.OPEN) {
                        ws.send(JSON.stringify({
                            type: 'stream',
                            article: remainingArticles[index],
                            index: index + 11, // +11 because we already sent 10
                            total: articles.length,
                            message: `Article ${index + 11} of ${articles.length}`
                        }));
                        index++;
                    } else {
                        clearInterval(streamInterval);

                        if (ws.readyState === WebSocket.OPEN) {
                            ws.send(JSON.stringify({
                                type: 'complete',
                                message: 'All articles have been streamed'
                            }));
                        }
                    }
                }, 2 * 60 * 1000); // 2 minutes in milliseconds

                // Clear interval if client disconnects
                ws.on('close', () => {
                    clearInterval(streamInterval);
                });
            }
        } catch (error) {
            console.error('Error streaming news:', error.message);
            ws.send(JSON.stringify({
                type: 'error',
                message: 'Error fetching news articles'
            }));
        }
    }
}

module.exports = WebSocketServer;
