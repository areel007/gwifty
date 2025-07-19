// src/server.ts
import app from "./app";
import { connectToDatabase } from "./config/db";

const PORT = process.env.PORT || 3000;

async function main() {
  try {
    await connectToDatabase(process.env.DATABASE_URL!);
    app.listen(PORT, () => {
      console.log(`🚀 Server is listening on port ${PORT}`);
    });
  } catch (error) {
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
