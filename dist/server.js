"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
// src/server.ts
const app_1 = __importDefault(require("./app"));
const prisma_1 = __importDefault(require("./lib/prisma"));
const PORT = process.env.PORT || 3000;
async function main() {
    try {
        await prisma_1.default.$connect();
        console.log("✅ Connected to the database");
        app_1.default.listen(PORT, () => {
            console.log(`🚀 Server is listening on port ${PORT}`);
        });
    }
    catch (error) {
        console.error("❌ Failed to start server:", error);
        process.exit(1);
    }
}
main();
// 🔁 Gracefully disconnect Prisma on shutdown
process.on("SIGINT", async () => {
    console.log("\n🛑 Shutting down...");
    await prisma_1.default.$disconnect();
    console.log("🔌 Prisma disconnected");
    process.exit(0);
});
