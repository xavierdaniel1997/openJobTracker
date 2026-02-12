import { PrismaClient } from "../generated/prisma";
import { Pool } from "pg";
import { PrismaPg } from "@prisma/adapter-pg";

if (!process.env.DATABASE_URL) {
  throw new Error("❌ DATABASE_URL is undefined. Check dotenv loading order.");
}

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
});

const adapter = new PrismaPg(pool);

const prisma = new PrismaClient({
  adapter,
  log: ["info", "warn", "error"],
});




export const connectDB = async () => {
  try {
    await prisma.$queryRaw`SELECT 1`;
    console.log("✅ Database connected successfully");
  } catch (error) {
    console.error("❌ Database connection failed");

    if (error instanceof Error) {
      console.error("Reason:", error.message);
    } else {
      console.error("Unknown database error");
    }

    process.exit(1); 
  }
};

export default prisma;
