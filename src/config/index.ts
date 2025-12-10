// src/config/index.ts

import * as dotenv from 'dotenv';

// Load environment variables from .env file
dotenv.config();

/**
 * Configuration Object
 * Central place to access all environment variables.
 */
interface Config {
    PORT: number;
    MONGO_URI: string;
    // Add other environment variables here as the project grows 
    // e.g., AUTH_SECRET, CACHE_HOST, etc.
}

const config: Config = {
    // Port to run the Express server on
    PORT: parseInt(process.env.PORT || '3000', 10),

    // MongoDB Connection String
    // CRITICAL: Ensure this is correctly set in your .env file
    MONGO_URI: process.env.MONGO_URI || 'mongodb://localhost:27017/mylistdb',
};

// Simple validation to ensure critical variables are set
if (!config.MONGO_URI) {
    console.error('FATAL ERROR: MONGO_URI is not defined in the environment variables.');
    // Exit the process if the database connection string is missing
    process.exit(1); 
}

export default config;