const mongoose = require('mongoose');

const newsArticleSchema = new mongoose.Schema({
    source: {
        id: String,
        name: String
    },
    author: String,
    title: {
        type: String,
        required: true
    },
    description: String,
    url: {
        type: String,
        required: true,
        unique: true
    },
    urlToImage: String,
    publishedAt: {
        type: Date,
        required: true
    },
    content: String,
    fetchDate: {
        type: Date,
        required: true
    }
}, {
    timestamps: true
});

// Index for efficient querying by fetch date
newsArticleSchema.index({ fetchDate: 1 });

module.exports = mongoose.model('NewsArticle', newsArticleSchema);
