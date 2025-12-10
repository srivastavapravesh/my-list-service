import express, { Application } from 'express';
import mongoose from 'mongoose';
import * as dotenv from 'dotenv';
import listRoutes from './routes/list.routes';
import config from './config';

dotenv.config();

const app: Application = express();
const PORT = config.PORT;
const MONGO_URI = config.MONGO_URI;

// Middleware
app.use(express.json());

// Routes
app.use('/api/v1/list', listRoutes);

// Database Connection
const connectDB = async () => {
    try {
        await mongoose.connect(MONGO_URI);
        console.log('MongoDB connected successfully.');
    } catch (error) {
        console.error('MongoDB connection failed:', error);
        process.exit(1);
    }
};

if (process.env.NODE_ENV !== 'test') {
    connectDB().then(() => {
        app.listen(PORT, () => {
            console.log(`Server is running on port ${PORT}`);
        });
    });
}

export default app; // Export for testing