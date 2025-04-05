import pkg from "pg";
const { Pool } = pkg;
import dotenv from "dotenv";

dotenv.config();

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: process.env.NODE_ENV === "production" ? { rejectUnauthorized: false } : false, // Only enforce SSL in production
  max: 10, // ✅ Limit max connections to prevent resource overuse
  idleTimeoutMillis: 30000, // ✅ Close idle connections after 30s
  connectionTimeoutMillis: 5000, // ✅ Timeout if connection takes >5s
});

const connectDB = async () => {
  try {
    const client = await pool.connect();
    console.log("📦 PostgreSQL Connected");
    client.release(); // ✅ Release the client back to the pool
  } catch (err) {
    console.error("❌ PostgreSQL Connection Error:", err);
    process.exit(1); // ✅ Stop the app if DB connection fails
  }
};

connectDB();

export default pool;
