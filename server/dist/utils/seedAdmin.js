"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.seedAdminUser = void 0;
const bcryptjs_1 = __importDefault(require("bcryptjs"));
const User_1 = require("../models/User");
const seedAdminUser = async () => {
    try {
        const adminEmail = (process.env.ADMIN_EMAIL || 'sathwikredd7701@gmail.com').toLowerCase();
        const adminPassword = process.env.ADMIN_PASSWORD || '123456789';
        const existingAdmin = await User_1.User.findOne({ email: adminEmail });
        if (!existingAdmin) {
            const salt = await bcryptjs_1.default.genSalt(10);
            const passwordHash = await bcryptjs_1.default.hash(adminPassword, salt);
            await User_1.User.create({
                name: 'System Admin',
                email: adminEmail,
                passwordHash,
                role: 'admin',
                emailVerified: true,
                isActive: true,
            });
            console.log(`👑 Default Admin user created: ${adminEmail}`);
        }
        else {
            // Ensure admin has role 'admin', emailVerified, and updated password if needed
            let updated = false;
            if (existingAdmin.role !== 'admin') {
                existingAdmin.role = 'admin';
                updated = true;
            }
            if (!existingAdmin.emailVerified) {
                existingAdmin.emailVerified = true;
                updated = true;
            }
            if (!existingAdmin.isActive) {
                existingAdmin.isActive = true;
                updated = true;
            }
            if (updated) {
                await existingAdmin.save();
                console.log(`👑 Admin permissions updated for: ${adminEmail}`);
            }
        }
    }
    catch (error) {
        console.error('⚠️ Error seeding admin user:', error);
    }
};
exports.seedAdminUser = seedAdminUser;
