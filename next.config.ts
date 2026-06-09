import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // 将 Node.js 原生模块排除出 Next.js webpack 打包范围
  // 改为运行时 require（Node.js runtime）
  serverExternalPackages: [
    "pdf-parse",
    "pdfjs-dist",
    "pdfkit",
    "@types/pdfkit",
  ],
};

export default nextConfig;
