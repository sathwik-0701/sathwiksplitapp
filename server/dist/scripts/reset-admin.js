"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const dotenv_1 = __importDefault(require("dotenv"));
const path_1 = __importDefault(require("path"));
const mongoose_1 = __importDefault(require("mongoose"));
const bcryptjs_1 = __importDefault(require("bcryptjs"));
const User_1 = require("../models/User");
dotenv_1.default.config({ path: path_1.default.resolve(__dirname, '../../../.env') });
dotenv_1.default.config({ path: path_1.default.resolve(process.cwd(), '../.env') });
dotenv_1.default.config({ path: path_1.default.resolve(process.cwd(), '.env') });
const run = async () => {
    const uri = process.env.MONGODB_URI;
    const adminEmail = (process.env.ADMIN_EMAIL || '').toLowerCase().trim();
    const adminPassword = process.env.ADMIN_PASSWORD || '';
    if (!uri) {
        console.error('❌ MONGODB_URI is missing in .env file!');
        process.exit(1);
    }
    if (!adminEmail || !adminPassword) {
        console.error('❌ ADMIN_EMAIL or ADMIN_PASSWORD is missing in .env file!');
        process.exit(1);
    }
    try {
        await mongoose_1.default.connect(uri, { serverSelectionTimeoutMS: 8000 });
        console.log('✅ Connected to MongoDB');
        const salt = await bcryptjs_1.default.genSalt(10);
        const passwordHash = await bcryptjs_1.default.hash(adminPassword, salt);
        const existing = await User_1.User.findOne({ email: adminEmail });
        if (existing) {
            existing.passwordHash = passwordHash;
            existing.role = 'admin';
            existing.emailVerified = true;
            existing.isActive = true;
            await existing.save();
            console.log(`👑 Existing admin updated: ${adminEmail}`);
            console.log('   Password has been reset to the value currently in ADMIN_PASSWORD.');
        }
        else {
            await User_1.User.create({
                name: 'System Admin',
                email: adminEmail,
                passwordHash,
                role: 'admin',
                emailVerified: true,
                isActive: true,
            });
            console.log(`👑 New admin created: ${adminEmail}`);
        }
        await mongoose_1.default.disconnect();
        console.log('🔒 Done. You can now log in with ADMIN_EMAIL / ADMIN_PASSWORD from your .env.');
        process.exit(0);
    }
    catch (err) {
        console.error('❌ Failed:', err.message);
        process.exit(1);
    }
};
run();
