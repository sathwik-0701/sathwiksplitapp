"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const dotenv_1 = __importDefault(require("dotenv"));
const path_1 = __importDefault(require("path"));
const mongoose_1 = __importDefault(require("mongoose"));
dotenv_1.default.config({ path: path_1.default.resolve(__dirname, '../../../.env') });
dotenv_1.default.config({ path: path_1.default.resolve(process.cwd(), '../.env') });
const testConnection = async () => {
    const uri = process.env.MONGODB_URI;
    console.log('🔍 Testing MongoDB connection with URI:', uri);
    if (!uri) {
        console.error('❌ MONGODB_URI is missing in .env file!');
        process.exit(1);
    }
    try {
        const conn = await mongoose_1.default.connect(uri, { serverSelectionTimeoutMS: 5000 });
        console.log('✅ Success! Connected to MongoDB Host:', conn.connection.host);
        console.log('📊 Database Name:', conn.connection.name);
        await mongoose_1.default.disconnect();
        console.log('🔒 Disconnected cleanly.');
        process.exit(0);
    }
    catch (err) {
        console.error('❌ Connection Failed:', err.message);
        console.log('\n💡 Note: Make sure MongoDB service is running locally or supply a valid MongoDB Atlas connection string in server/.env');
        process.exit(1);
    }
};
testConnection();
