const mongoose = require('mongoose');
require('dotenv').config();

const URI = process.env.URI;

async function connectToDatabase() {
    try {
        await mongoose.connect(URI, {
            dbName: 'pet_adoption'
        });

        console.log('Connected to MongoDB');
    } catch (error) {
        console.error('Error connecting to MongoDB:', error);
    }
}

module.exports = connectToDatabase;