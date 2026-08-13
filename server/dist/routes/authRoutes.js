"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const express_rate_limit_1 = __importDefault(require("express-rate-limit"));
const authController_1 = require("../controllers/authController");
const router = (0, express_1.Router)();
// Rate limiter for auth routes to prevent brute force
const authLimiter = (0, express_rate_limit_1.default)({
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: 30, // Limit each IP to 30 requests per windowMs
    message: {
        success: false,
        message: 'Too many authentication attempts. Please try again after 15 minutes.',
    },
});
router.post('/register', authLimiter, authController_1.register);
router.post('/verify-email', authLimiter, authController_1.verifyEmail);
router.post('/resend-otp', authLimiter, authController_1.resendOTP);
router.post('/login', authLimiter, authController_1.login);
router.post('/logout', authController_1.logout);
router.post('/forgot-password', authLimiter, authController_1.forgotPassword);
router.post('/reset-password', authLimiter, authController_1.resetPassword);
exports.default = router;
