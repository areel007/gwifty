"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.upload = void 0;
// middlewares/upload.ts
const multer_1 = __importDefault(require("multer"));
exports.upload = (0, multer_1.default)({ storage: multer_1.default.memoryStorage() });
