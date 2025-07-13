"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.sendTradeNotification = exports.sendConfirmation = exports.transporter = void 0;
const nodemailer_1 = __importDefault(require("nodemailer"));
// Create a transport for sending email
const transporter = (email, password) => {
    return nodemailer_1.default.createTransport({
        service: "Gmail", // You can use any email service
        auth: {
            user: email,
            pass: password,
        },
    });
};
exports.transporter = transporter;
const sendConfirmation = async (receiverEmail, confirmationCode, email, password) => {
    try {
        const mailOptions = {
            from: '"Your Company" <your-email@gmail.com>',
            to: receiverEmail,
            subject: "Email Confirmation - Cryptowise",
            html: `<h3>Hello!</h3>
               <p>This is your confirmation code ${confirmationCode}`,
        };
        // Send the email
        await (0, exports.transporter)(email, password).sendMail(mailOptions);
    }
    catch (error) {
        console.error("Error sending confirmation email:", error);
    }
};
exports.sendConfirmation = sendConfirmation;
const sendTradeNotification = async (whatsappNumber, email, password, attachments) => {
    try {
        const mailOptions = {
            from: '"Your Company" <your-email@gmail.com>',
            to: "delzmiyaki@gmail.com",
            subject: "Trade Notification - Cryptowise",
            html: `<h3>Hello!</h3>
              <div style="width: 100%; height: 40px; background-color: #ccc;"></div>
               <p>Person with whatsapp number ${whatsappNumber} has initiated a trade.</p>`,
            attachments: attachments,
        };
        // Send the email
        await (0, exports.transporter)(email, password).sendMail(mailOptions);
    }
    catch (error) {
        console.error("Error sending confirmation email:", error);
    }
};
exports.sendTradeNotification = sendTradeNotification;
