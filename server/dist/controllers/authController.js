"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.getCurrentUser = exports.resetPassword = exports.forgotPassword = exports.logout = exports.login = exports.resendOTP = exports.verifyEmail = exports.register = void 0;
const bcryptjs_1 = __importDefault(require("bcryptjs"));
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const zod_1 = require("zod");
const User_1 = require("../models/User");
const emailService_1 = require("../services/emailService");
// Helper to generate 6-digit OTP
const generateOTP = () => {
    return Math.floor(100000 + Math.random() * 900000).toString();
};
// Helper to create & attach JWT Cookie
const sendTokenResponse = (user, statusCode, res, message) => {
    const secret = process.env.JWT_SECRET || 'fallback_secret';
    const token = jsonwebtoken_1.default.sign({ userId: user._id, role: user.role }, secret, { expiresIn: '7d' });
    const isProduction = process.env.NODE_ENV === 'production';
    res.cookie('token', token, {
        httpOnly: true,
        secure: isProduction,
        sameSite: isProduction ? 'none' : 'lax',
        maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
    });
    res.status(statusCode).json({
        success: true,
        message,
        token, // Also return token in JSON for client flex
        user: {
            _id: user._id,
            name: user.name,
            email: user.email,
            role: user.role,
            emailVerified: user.emailVerified,
            isActive: user.isActive,
        },
    });
};
// Validation Schemas using Zod
const registerSchema = zod_1.z.object({
    name: zod_1.z.string().min(2, 'Name must be at least 2 characters'),
    email: zod_1.z.string().email('Invalid email address'),
    password: zod_1.z.string().min(6, 'Password must be at least 6 characters'),
});
const loginSchema = zod_1.z.object({
    email: zod_1.z.string().min(1, 'Email or username is required'),
    password: zod_1.z.string().min(1, 'Password is required'),
});
const verifyOtpSchema = zod_1.z.object({
    email: zod_1.z.string().email('Invalid email address'),
    otp: zod_1.z.string().length(6, 'OTP must be 6 digits'),
});
const forgotPasswordSchema = zod_1.z.object({
    email: zod_1.z.string().email('Invalid email address'),
});
const resetPasswordSchema = zod_1.z.object({
    email: zod_1.z.string().email('Invalid email address'),
    otp: zod_1.z.string().length(6, 'OTP must be 6 digits'),
    newPassword: zod_1.z.string().min(6, 'New password must be at least 6 characters'),
});
// @route   POST /api/auth/register
const register = async (req, res) => {
    try {
        const parseResult = registerSchema.safeParse(req.body);
        if (!parseResult.success) {
            res.status(400).json({
                success: false,
                message: parseResult.error.errors[0].message,
            });
            return;
        }
        const { name, email, password } = parseResult.data;
        const normalizedEmail = email.toLowerCase().trim();
        const existingUser = await User_1.User.findOne({ email: normalizedEmail });
        if (existingUser) {
            res.status(400).json({
                success: false,
                message: 'An account with this email already exists.',
            });
            return;
        }
        const salt = await bcryptjs_1.default.genSalt(10);
        const passwordHash = await bcryptjs_1.default.hash(password, salt);
        const otp = generateOTP();
        const otpExpires = new Date(Date.now() + 10 * 60 * 1000); // 10 minutes
        const user = await User_1.User.create({
            name,
            email: normalizedEmail,
            passwordHash,
            role: 'user',
            emailVerified: false,
            otp,
            otpExpires,
            isActive: true,
        });
        // Send OTP via Brevo
        await (0, emailService_1.sendOTPEmail)(normalizedEmail, otp, name);
        res.status(201).json({
            success: true,
            message: 'Registration successful! Verification code sent to your email.',
            email: normalizedEmail,
        });
    }
    catch (error) {
        console.error('Register error:', error);
        res.status(500).json({
            success: false,
            message: 'Server error during registration',
        });
    }
};
exports.register = register;
// @route   POST /api/auth/verify-email
const verifyEmail = async (req, res) => {
    try {
        const parseResult = verifyOtpSchema.safeParse(req.body);
        if (!parseResult.success) {
            res.status(400).json({
                success: false,
                message: parseResult.error.errors[0].message,
            });
            return;
        }
        const { email, otp } = parseResult.data;
        const normalizedEmail = email.toLowerCase().trim();
        const user = await User_1.User.findOne({ email: normalizedEmail });
        if (!user) {
            res.status(404).json({
                success: false,
                message: 'User account not found.',
            });
            return;
        }
        if (user.emailVerified) {
            sendTokenResponse(user, 200, res, 'Email is already verified.');
            return;
        }
        if (!user.otp || user.otp !== otp) {
            res.status(400).json({
                success: false,
                message: 'Invalid OTP code. Please check and try again.',
            });
            return;
        }
        if (user.otpExpires && user.otpExpires < new Date()) {
            res.status(400).json({
                success: false,
                message: 'OTP has expired. Please request a new code.',
            });
            return;
        }
        user.emailVerified = true;
        user.otp = undefined;
        user.otpExpires = undefined;
        await user.save();
        sendTokenResponse(user, 200, res, 'Email verified successfully! Welcome to Split Expense.');
    }
    catch (error) {
        console.error('Verify email error:', error);
        res.status(500).json({
            success: false,
            message: 'Server error during email verification',
        });
    }
};
exports.verifyEmail = verifyEmail;
// @route   POST /api/auth/resend-otp
const resendOTP = async (req, res) => {
    try {
        const { email } = req.body;
        if (!email) {
            res.status(400).json({ success: false, message: 'Email is required' });
            return;
        }
        const normalizedEmail = email.toLowerCase().trim();
        const user = await User_1.User.findOne({ email: normalizedEmail });
        if (!user) {
            res.status(404).json({ success: false, message: 'User not found' });
            return;
        }
        const otp = generateOTP();
        user.otp = otp;
        user.otpExpires = new Date(Date.now() + 10 * 60 * 1000);
        await user.save();
        await (0, emailService_1.sendOTPEmail)(normalizedEmail, otp, user.name);
        res.status(200).json({
            success: true,
            message: 'A new verification code has been sent to your email.',
        });
    }
    catch (error) {
        res.status(500).json({ success: false, message: 'Failed to resend OTP' });
    }
};
exports.resendOTP = resendOTP;
// @route   POST /api/auth/login
const login = async (req, res) => {
    try {
        const parseResult = loginSchema.safeParse(req.body);
        if (!parseResult.success) {
            res.status(400).json({
                success: false,
                message: parseResult.error.errors[0].message,
            });
            return;
        }
        let { email, password } = parseResult.data;
        let normalizedEmail = email.toLowerCase().trim();
        // Handle user shorthand like "sathwikredd7701" -> "sathwikredd7701@gmail.com"
        if (!normalizedEmail.includes('@')) {
            normalizedEmail = `${normalizedEmail}@gmail.com`;
        }
        const user = await User_1.User.findOne({ email: normalizedEmail });
        if (!user) {
            res.status(401).json({
                success: false,
                message: 'Invalid email or password.',
            });
            return;
        }
        if (!user.isActive) {
            res.status(403).json({
                success: false,
                message: 'Your account has been deactivated. Please contact support.',
            });
            return;
        }
        const isMatch = await bcryptjs_1.default.compare(password, user.passwordHash);
        if (!isMatch) {
            res.status(401).json({
                success: false,
                message: 'Invalid email or password.',
            });
            return;
        }
        if (!user.emailVerified) {
            // Send OTP if email is not verified yet
            const otp = generateOTP();
            user.otp = otp;
            user.otpExpires = new Date(Date.now() + 10 * 60 * 1000);
            await user.save();
            await (0, emailService_1.sendOTPEmail)(normalizedEmail, otp, user.name);
            res.status(403).json({
                success: false,
                requiresVerification: true,
                email: normalizedEmail,
                message: 'Email not verified. A verification code has been sent to your email.',
            });
            return;
        }
        sendTokenResponse(user, 200, res, 'Login successful!');
    }
    catch (error) {
        console.error('Login error:', error);
        res.status(500).json({
            success: false,
            message: 'Server error during login',
        });
    }
};
exports.login = login;
// @route   POST /api/auth/logout
const logout = async (req, res) => {
    res.cookie('token', '', {
        httpOnly: true,
        expires: new Date(0),
    });
    res.status(200).json({
        success: true,
        message: 'Logged out successfully',
    });
};
exports.logout = logout;
// @route   POST /api/auth/forgot-password
const forgotPassword = async (req, res) => {
    try {
        const parseResult = forgotPasswordSchema.safeParse(req.body);
        if (!parseResult.success) {
            res.status(400).json({
                success: false,
                message: parseResult.error.errors[0].message,
            });
            return;
        }
        let { email } = parseResult.data;
        let normalizedEmail = email.toLowerCase().trim();
        if (!normalizedEmail.includes('@')) {
            normalizedEmail = `${normalizedEmail}@gmail.com`;
        }
        const user = await User_1.User.findOne({ email: normalizedEmail });
        if (!user) {
            // Generic success to prevent user enumeration
            res.status(200).json({
                success: true,
                message: 'If an account exists, a password reset code has been sent.',
            });
            return;
        }
        const otp = generateOTP();
        user.otp = otp;
        user.otpExpires = new Date(Date.now() + 10 * 60 * 1000);
        await user.save();
        await (0, emailService_1.sendPasswordResetEmail)(normalizedEmail, otp);
        res.status(200).json({
            success: true,
            message: 'Password reset code sent to your email.',
            email: normalizedEmail,
        });
    }
    catch (error) {
        res.status(500).json({
            success: false,
            message: 'Server error during password reset request',
        });
    }
};
exports.forgotPassword = forgotPassword;
// @route   POST /api/auth/reset-password
const resetPassword = async (req, res) => {
    try {
        const parseResult = resetPasswordSchema.safeParse(req.body);
        if (!parseResult.success) {
            res.status(400).json({
                success: false,
                message: parseResult.error.errors[0].message,
            });
            return;
        }
        let { email, otp, newPassword } = parseResult.data;
        let normalizedEmail = email.toLowerCase().trim();
        if (!normalizedEmail.includes('@')) {
            normalizedEmail = `${normalizedEmail}@gmail.com`;
        }
        const user = await User_1.User.findOne({ email: normalizedEmail });
        if (!user || !user.otp || user.otp !== otp) {
            res.status(400).json({
                success: false,
                message: 'Invalid OTP code.',
            });
            return;
        }
        if (user.otpExpires && user.otpExpires < new Date()) {
            res.status(400).json({
                success: false,
                message: 'OTP has expired.',
            });
            return;
        }
        const salt = await bcryptjs_1.default.genSalt(10);
        user.passwordHash = await bcryptjs_1.default.hash(newPassword, salt);
        user.otp = undefined;
        user.otpExpires = undefined;
        await user.save();
        res.status(200).json({
            success: true,
            message: 'Password reset successfully! You can now log in with your new password.',
        });
    }
    catch (error) {
        res.status(500).json({
            success: false,
            message: 'Server error resetting password',
        });
    }
};
exports.resetPassword = resetPassword;
// @route   GET /api/users/me
const getCurrentUser = async (req, res) => {
    if (!req.user) {
        res.status(401).json({ success: false, message: 'Not authenticated' });
        return;
    }
    res.status(200).json({
        success: true,
        user: {
            _id: req.user._id,
            name: req.user.name,
            email: req.user.email,
            role: req.user.role,
            emailVerified: req.user.emailVerified,
            isActive: req.user.isActive,
            createdAt: req.user.createdAt,
        },
    });
};
exports.getCurrentUser = getCurrentUser;
