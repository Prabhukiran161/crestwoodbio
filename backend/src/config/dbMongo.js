import mongoose from "mongoose";

const connectMongoDB = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI,{
      // useNewUrlParser: true,
      // useUnifiedTopology: true,
      connectTimeoutMS: 5000, // ✅ Timeout if connection takes >5s
      serverSelectionTimeoutMS: 5000, // ✅ Avoid long MongoDB downtimes
    });
    console.log("✅ MongoDB Atlas connected successfully");
  } catch (error) {
    console.error("❌ MongoDB connection error:", error);
    process.exit(1);
  }
};

// ✅ Register event listeners only ONCE (outside the function)
mongoose.connection.on("connected", () => {
  console.log("✅ MongoDB Connected!");
});

mongoose.connection.on("error", (err) => {
  console.error("❌ MongoDB Connection Error:", err);
});

mongoose.connection.on("disconnected", () => {
  console.warn("⚠️ MongoDB Disconnected! Retrying...");
});


export default connectMongoDB;
