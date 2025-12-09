import type { NextConfig } from "next";

const nextConfig: NextConfig = {
	serverExternalPackages: ["puppeteer-core", "@sparticuz/chromium"],
	// Increase timeout for AI generation tasks
	staticPageGenerationTimeout: 60,
};

export default nextConfig;
