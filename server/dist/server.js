"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const dotenv_1 = __importDefault(require("dotenv"));
const path_1 = __importDefault(require("path"));
// Load environment variables from single root .env file
dotenv_1.default.config({ path: path_1.default.resolve(__dirname, '../../../.env') });
dotenv_1.default.config({ path: path_1.default.resolve(__dirname, '../../.env') });
dotenv_1.default.config({ path: path_1.default.resolve(process.cwd(), '../.env') });
dotenv_1.default.config({ path: path_1.default.resolve(process.cwd(), '.env') });
const app_1 = __importDefault(require("./app"));
const db_1 = require("./config/db");
const seedAdmin_1 = require("./utils/seedAdmin");
const PORT = process.env.PORT || 5000;
const startServer = async () => {
    // Connect to MongoDB & Seed default admin user
    try {
        await (0, db_1.connectDB)();
        await (0, seedAdmin_1.seedAdminUser)();
    }
    catch (error) {
        console.warn('⚠️ MongoDB initialization error:', error);
    }
    app_1.default.listen(PORT, () => {
        console.log(`🚀 Server running on port ${PORT} [${process.env.NODE_ENV || 'development'}]`);
        console.log(`📡 Health Check URL: http://localhost:${PORT}/api/health`);
    });
};
startServer();
