import mongoose from 'mongoose';

const connectDB = async () => {
    try {
        const envUri = process.env.MONGODB_URI || process.env.MONGO_URI;
        const uri = envUri || 'mongodb://127.0.0.1:27017/tmart';
        console.log('Environment MONGODB_URI:', `"${process.env.MONGODB_URI}"`);
        console.log('Environment MONGO_URI:', `"${process.env.MONGO_URI}"`);
        console.log('Using MongoDB URI:', `"${uri}"`);
        const conn = await mongoose.connect(uri);
        console.log(`MongoDB Connected: ${conn.connection.host}`);
    } catch (error: any) {
        console.error(`Error: ${error.message}`);
        process.exit(1);
    }
};

export default connectDB;
