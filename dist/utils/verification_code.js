"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.generateVerificationCode = void 0;
const generateVerificationCode = () => {
    // Generate a random 4-digit verification code
    return Math.floor(1000 + Math.random() * 9000).toString();
};
exports.generateVerificationCode = generateVerificationCode;
