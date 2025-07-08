const mongoose = require('mongoose');

class Database {
    static async connect() {
        try {
            await mongoose.connect(process.env.MONGODB_URI, {
                useNewUrlParser: true,
                useUnifiedTopology: true,
            });
            console.log('Connected to MongoDB successfully');
        } catch (error) {
            console.error('MongoDB connection error:', error.message);
            process.exit(1);
        }
    }

    static async disconnect() {
        try {
            await mongoose.disconnect();
            console.log('Disconnected from MongoDB');
        } catch (error) {
            console.error('Error disconnecting from MongoDB:', error.message);
        }
    }
}

// Handle graceful shutdown
process.on('SIGINT', async () => {
    await Database.disconnect();
    process.exit(0);
});

module.exports = Database;
