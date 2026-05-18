const mongoose = require("mongoose");

const connectDB = async () => {
  const connUri = process.env.MONGODB_URI || "mongodb+srv://edumatch:Edumatch%40@exe101edumatch.1ruj8h4.mongodb.net/Edumatch?retryWrites=true&w=majority";
  const options = {
    serverSelectionTimeoutMS: 5000, // Timeout after 5s instead of hanging
    socketTimeoutMS: 45000,         // Close sockets after 45s of inactivity
  };

  let retries = 5;
  while (retries > 0) {
    try {
      const conn = await mongoose.connect(connUri, options);
      console.log(`MongoDB Connected Successfully: ${conn.connection.host}`);
      
      // Monitor connection status
      mongoose.connection.on("error", (err) => {
        console.error(`MongoDB Runtime Connection Error: ${err.message}`);
      });

      mongoose.connection.on("disconnected", () => {
        console.warn("MongoDB disconnected. Attempting reconnection...");
      });

      return conn;
    } catch (error) {
      retries -= 1;
      console.error(`Database Connection Failed. Retries remaining: ${retries}. Error: ${error.message}`);
      if (retries === 0) {
        console.error("Could not connect to MongoDB after 5 attempts. Exiting process.");
        process.exit(1);
      }
      // Wait for 2 seconds before retrying
      await new Promise((resolve) => setTimeout(resolve, 2000));
    }
  }
};

module.exports = connectDB;
