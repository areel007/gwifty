"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
// src/server.ts
const app_1 = __importDefault(require("./app"));
const db_1 = require("./config/db");
const PORT = process.env.PORT || 3000;
async function main() {
    try {
        await (0, db_1.connectToDatabase)(process.env.DATABASE_URL);
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
// async function main() {
//   try {
//     await prisma.$connect();
//     console.log("✅ Connected to the database");
//     app.listen(PORT, () => {
//       console.log(`🚀 Server is listening on port ${PORT}`);
//     });
//   } catch (error) {
//     console.error("❌ Failed to start server:", error);
//     process.exit(1);
//   }
// }
// main();
// // 🔁 Gracefully disconnect Prisma on shutdown
// process.on("SIGINT", async () => {
//   console.log("\n🛑 Shutting down...");
//   await prisma.$disconnect();
//   console.log("🔌 Prisma disconnected");
//   process.exit(0);
// });
