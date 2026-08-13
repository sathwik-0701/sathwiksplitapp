"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const dotenv_1 = __importDefault(require("dotenv"));
const path_1 = __importDefault(require("path"));
const mongoose_1 = __importDefault(require("mongoose"));
const bcryptjs_1 = __importDefault(require("bcryptjs"));
dotenv_1.default.config({ path: path_1.default.resolve(__dirname, '../../../.env') });
dotenv_1.default.config({ path: path_1.default.resolve(process.cwd(), '../.env') });
const db_1 = require("../config/db");
const seedAdmin_1 = require("../utils/seedAdmin");
const User_1 = require("../models/User");
const testAdminLogin = async () => {
    try {
        await (0, db_1.connectDB)();
        await (0, seedAdmin_1.seedAdminUser)();
        const adminEmail = (process.env.ADMIN_EMAIL || 'sathwikredd7701@gmail.com').toLowerCase();
        const adminPassword = process.env.ADMIN_PASSWORD || '123456789';
        const admin = await User_1.User.findOne({ email: adminEmail });
        if (!admin) {
            console.error('❌ Admin user not found!');
            process.exit(1);
        }
        const isMatch = await bcryptjs_1.default.compare(adminPassword, admin.passwordHash);
        console.log('\n==================================================');
        console.log('👑 ADMIN ACCOUNT VERIFICATION');
        console.log('==================================================');
        console.log('Email:', admin.email);
        console.log('Role:', admin.role);
        console.log('Email Verified:', admin.emailVerified);
        console.log('Is Active:', admin.isActive);
        console.log('Password Match:', isMatch ? '✅ SUCCESS' : '❌ FAILED');
        console.log('==================================================\n');
        await mongoose_1.default.disconnect();
        process.exit(0);
    }
    catch (err) {
        console.error('❌ Error during admin verification:', err.message);
        process.exit(1);
    }
};
testAdminLogin();
