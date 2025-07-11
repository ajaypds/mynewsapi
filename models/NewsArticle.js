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
    },
    category: {
        type: String,
        required: true,
        enum: ['Politics', 'Business', 'Technology', 'Sports', 'Entertainment', 'Health', 'Science', 'Education', 'Crime', 'International', 'Environment', 'Economy', 'Defense', 'General'],
        default: 'General'
    }
}, {
    timestamps: true
});

// Index for efficient querying by fetch date and category
newsArticleSchema.index({ fetchDate: 1 });
newsArticleSchema.index({ category: 1 });
newsArticleSchema.index({ fetchDate: 1, category: 1 });

module.exports = mongoose.model('NewsArticle', newsArticleSchema);
