const WebSocket = require('ws');
const NewsService = require('./NewsService');
const url = require('url');

class WebSocketServer {
    constructor(server) {
        this.wss = new WebSocket.Server({ server });
        this.newsService = new NewsService();
        this.setupWebSocket();
    }

    setupWebSocket() {
        this.wss.on('connection', (ws, req) => {
            console.log('Client connected');

            // Parse query parameters from URL
            const parsedUrl = url.parse(req.url, true);
            const resumeFromIndex = parseInt(parsedUrl.query.resumeFrom) || 0;

            console.log(`Resume from index: ${resumeFromIndex}`);

            ws.on('message', (message) => {
                console.log('Received message:', message.toString());
            });

            ws.on('close', () => {
                console.log('Client disconnected');
            });

            ws.on('error', (error) => {
                console.error('WebSocket error:', error);
            });

            // Start streaming news to the connected client with resume index
            this.streamNews(ws, resumeFromIndex);
        });
    }

    async streamNews(ws, resumeFromIndex = 0) {
        try {
            const articles = await this.newsService.getNews();

            if (articles.length === 0) {
                ws.send(JSON.stringify({
                    type: 'error',
                    message: 'No news articles available for yesterday'
                }));
                return;
            }

            // Validate resume index
            if (resumeFromIndex >= articles.length) {
                ws.send(JSON.stringify({
                    type: 'error',
                    message: `Resume index ${resumeFromIndex} is beyond available articles (${articles.length})`
                }));
                return;
            }

            // If resuming, send info about what we're resuming from
            if (resumeFromIndex > 0) {
                ws.send(JSON.stringify({
                    type: 'info',
                    message: `Resuming from article ${resumeFromIndex + 1} of ${articles.length}`,
                    resumeIndex: resumeFromIndex,
                    total: articles.length
                }));
            }

            // Get articles from the resume point onwards
            const remainingArticles = articles.slice(resumeFromIndex);

            // Determine how many to send in initial batch
            const batchSize = Math.min(10, remainingArticles.length);
            const initialBatch = remainingArticles.slice(0, batchSize);

            // Send initial batch
            if (remainingArticles.length <= 10) {
                // Send all remaining articles at once
                ws.send(JSON.stringify({
                    type: 'batch',
                    articles: initialBatch,
                    total: articles.length,
                    startIndex: resumeFromIndex,
                    endIndex: resumeFromIndex + initialBatch.length - 1,
                    message: resumeFromIndex > 0
                        ? `Resumed: ${initialBatch.length} articles sent (${resumeFromIndex + 1}-${resumeFromIndex + initialBatch.length})`
                        : 'All articles sent'
                }));
            } else {
                // Send first batch immediately
                ws.send(JSON.stringify({
                    type: 'batch',
                    articles: initialBatch,
                    total: articles.length,
                    startIndex: resumeFromIndex,
                    endIndex: resumeFromIndex + batchSize - 1,
                    message: resumeFromIndex > 0
                        ? `Resumed: First ${batchSize} articles sent (${resumeFromIndex + 1}-${resumeFromIndex + batchSize}). ${remainingArticles.length - batchSize} more to follow.`
                        : `First ${batchSize} articles sent. ${remainingArticles.length - batchSize} more to follow.`
                }));

                // Stream remaining articles one by one at configurable interval
                const articlesToStream = remainingArticles.slice(batchSize);
                let streamIndex = 0;

                // Get stream interval from environment variable (default to 120 seconds = 2 minutes)
                const streamIntervalSeconds = parseInt(process.env.STREAM_INTERVAL_SECONDS) || 120;
                const streamIntervalMs = streamIntervalSeconds * 1000;

                console.log(`Streaming remaining ${articlesToStream.length} articles every ${streamIntervalSeconds} second(s) starting from index ${resumeFromIndex + batchSize}`);

                const streamInterval = setInterval(() => {
                    if (streamIndex < articlesToStream.length && ws.readyState === WebSocket.OPEN) {
                        const currentArticleIndex = resumeFromIndex + batchSize + streamIndex;
                        ws.send(JSON.stringify({
                            type: 'stream',
                            article: articlesToStream[streamIndex],
                            index: currentArticleIndex + 1, // 1-based for display
                            total: articles.length,
                            message: `Article ${currentArticleIndex + 1} of ${articles.length}`
                        }));
                        streamIndex++;
                    } else {
                        clearInterval(streamInterval);

                        if (ws.readyState === WebSocket.OPEN) {
                            ws.send(JSON.stringify({
                                type: 'complete',
                                message: 'All articles have been streamed',
                                finalIndex: articles.length
                            }));
                        }
                    }
                }, streamIntervalMs); // Use configurable interval from environment

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
