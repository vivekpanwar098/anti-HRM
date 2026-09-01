import path from "node:path";
import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  turbopack: {
    root: path.join(__dirname, ".."),
  },

   images: {
    qualities: [70, 75], // 🔧 FIX: quality=70 ko explicitly allow list me add kiya
  }
  
};

export default nextConfig;
