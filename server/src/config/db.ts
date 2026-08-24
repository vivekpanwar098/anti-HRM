import mongoose from "mongoose";

export const connectDB = async (): Promise<void> => {
  const uri: string | undefined = process.env.MONGO_URI;
  if (!uri) throw new Error("MONGO_URI is not set in environment variables");

  try {
    await mongoose.connect(uri);
    console.log("MongoDB connected");
  } catch (err) {
    console.error("MongoDB connection error:", err);
    process.exit(1);
  }

  mongoose.connection.on("disconnected", (): void => {
    console.error("MongoDB disconnected");
  });

  mongoose.connection.on("reconnected", (): void => {
    console.log("MongoDB reconnected");
  });

  mongoose.connection.on("error", (err: Error): void => {
    console.error("MongoDB connection error:", err);
  });
};

// mongoose.connection.readyState: 0 = disconnected, 1 = connected, 2 = connecting, 3 = disconnecting
export const isDBConnected = (): boolean => mongoose.connection.readyState === 1;