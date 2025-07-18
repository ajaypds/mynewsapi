const WebSocket = require('ws');
const NewsService = require('./NewsService');
const url = require('url');

class WebSocketServer {
    constructor(server) {
        this.wss = new WebSocket.Server({
            server,
            verifyClient: (info) => {
                // Accept all connections but we'll handle routing in the connection handler
                return true;
            }
        });
        this.newsService = new NewsService();
        this.setupWebSocket();
    }

    setupWebSocket() {
        this.wss.on('connection', (ws, req) => {
            console.log('Client connected');

            // Parse query parameters from URL
            const parsedUrl = url.parse(req.url, true);

            // Only handle default connection (filter is now HTTP-only)
            this.handleDefaultConnection(ws, parsedUrl.query);
        });
    }

    // Default endpoint: / - supports category and resumeFrom (date filtering moved to HTTP)
    handleDefaultConnection(ws, query) {
        const resumeFromIndex = parseInt(query.resumeFrom) || 0;
        const category = query.category;

        console.log(`WebSocket endpoint - Resume from index: ${resumeFromIndex}`);
        if (category) {
            console.log(`Filtering by category: ${category}`);
        }

        // Set up event handlers
        this.setupEventHandlers(ws);

        // Start streaming with category and resume support (no date filtering)
        this.streamNews(ws, resumeFromIndex, category);
    }

    // Common event handlers for both endpoints
    setupEventHandlers(ws) {
        ws.on('message', (message) => {
            console.log('Received message:', message.toString());
        });

        ws.on('close', () => {
            console.log('Client disconnected');
        });

        ws.on('error', (error) => {
            console.error('WebSocket error:', error);
        });
    }

    async streamNews(ws, resumeFromIndex = 0, category = null) {
        try {
            // Get articles - either all or filtered by category (always yesterday's news)
            let articles;
            if (category) {
                articles = await this.newsService.getNewsByCategory(category);
            } else {
                articles = await this.newsService.getNews();
            }

            if (articles.length === 0) {
                const message = category
                    ? `No news articles available for category "${category}"`
                    : `No news articles available for yesterday`;
                ws.send(JSON.stringify({
                    type: 'error',
                    message: message
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

            if (resumeFromIndex > 0) {
                // When resuming, start streaming directly from the resume index
                const articlesToStream = articles.slice(resumeFromIndex);
                let streamIndex = 0;

                // Get stream interval from environment variable (default to 120 seconds = 2 minutes)
                const streamIntervalSeconds = parseInt(process.env.STREAM_INTERVAL_SECONDS) || 120;
                const streamIntervalMs = streamIntervalSeconds * 1000;

                console.log(`Streaming ${articlesToStream.length} articles every ${streamIntervalSeconds} second(s) starting from index ${resumeFromIndex}`);

                const streamInterval = setInterval(() => {
                    if (streamIndex < articlesToStream.length && ws.readyState === WebSocket.OPEN) {
                        const currentArticleIndex = resumeFromIndex + streamIndex;
                        const article = articlesToStream[streamIndex];

                        ws.send(JSON.stringify({
                            type: 'stream',
                            article: {
                                ...article.toObject(),
                                category: article.category // Include category in response
                            },
                            index: currentArticleIndex + 1, // 1-based for display
                            total: articles.length,
                            category: article.category, // Add category at top level for easy access
                            message: `Article ${currentArticleIndex + 1} of ${articles.length} (${article.category})`,
                            endpoint: 'default'
                        }));
                        streamIndex++;
                    } else {
                        clearInterval(streamInterval);

                        if (ws.readyState === WebSocket.OPEN) {
                            ws.close();
                        }
                    }
                }, streamIntervalMs);

                // Clear interval if client disconnects
                ws.on('close', () => {
                    clearInterval(streamInterval);
                });
            } else {
                // Original behavior when starting from beginning (resumeFromIndex = 0)
                // Get articles from the resume point onwards
                const remainingArticles = articles.slice(resumeFromIndex);

                // Determine how many to send in initial batch
                const batchSize = Math.min(10, remainingArticles.length);
                const initialBatch = remainingArticles.slice(0, batchSize);

                // Send initial batch with category information
                if (remainingArticles.length <= 10) {
                    // Send all remaining articles at once
                    ws.send(JSON.stringify({
                        type: 'batch',
                        articles: initialBatch.map(article => ({
                            ...article.toObject(),
                            category: article.category
                        })),
                        total: articles.length,
                        startIndex: resumeFromIndex,
                        endIndex: resumeFromIndex + initialBatch.length - 1,
                        message: 'All articles sent',
                        endpoint: 'default'
                    }));
                } else {
                    // Send first batch immediately
                    ws.send(JSON.stringify({
                        type: 'batch',
                        articles: initialBatch.map(article => ({
                            ...article.toObject(),
                            category: article.category
                        })),
                        total: articles.length,
                        startIndex: resumeFromIndex,
                        endIndex: resumeFromIndex + batchSize - 1,
                        message: `First ${batchSize} articles sent. ${remainingArticles.length - batchSize} more to follow.`,
                        endpoint: 'default'
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
                            const article = articlesToStream[streamIndex];

                            ws.send(JSON.stringify({
                                type: 'stream',
                                article: {
                                    ...article.toObject(),
                                    category: article.category
                                },
                                index: currentArticleIndex + 1, // 1-based for display
                                total: articles.length,
                                category: article.category,
                                message: `Article ${currentArticleIndex + 1} of ${articles.length} (${article.category})`,
                                endpoint: 'default'
                            }));
                            streamIndex++;
                        } else {
                            clearInterval(streamInterval);

                            if (ws.readyState === WebSocket.OPEN) {
                                ws.close();
                            }
                        }
                    }, streamIntervalMs); // Use configurable interval from environment

                    // Clear interval if client disconnects
                    ws.on('close', () => {
                        clearInterval(streamInterval);
                    });
                }
            }
        } catch (error) {
            console.error('Error streaming news:', error.message);
            ws.send(JSON.stringify({
                type: 'error',
                message: 'Error fetching news articles',
                endpoint: 'default'
            }));
        }
    }
}

module.exports = WebSocketServer;
