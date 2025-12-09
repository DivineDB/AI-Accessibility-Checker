import { NextResponse } from "next/server";
import puppeteer from "puppeteer-core";
import chromium from "@sparticuz/chromium";
import { runAxeScan } from "@/lib/axe";
import { getAiRecommendations } from "@/lib/gemini";

// Helper for Vercel Pro
export const maxDuration = 60;
export const dynamic = "force-dynamic";

async function getBrowser() {
	if (process.env.NODE_ENV === "production" || process.env.VERCEL) {
		// 1. Configure the path to the remote binary
		// This URL matches the version of @sparticuz/chromium you installed (v131)
		const executablePath = await chromium.executablePath(
			"https://github.com/Sparticuz/chromium/releases/download/v131.0.1/chromium-v131.0.1-pack.tar"
		);

		return puppeteer.launch({
			args: chromium.args,
			defaultViewport: (chromium as any).defaultViewport,
			executablePath,
			headless: (chromium as any).headless,
			ignoreHTTPSErrors: true,
		} as any);
	} else {
		// Local Development
		// Dynamic import to avoid bundling puppeteer in production
		const { default: localPuppeteer } = await import("puppeteer");
		return localPuppeteer.launch({
			headless: true,
			args: ["--no-sandbox", "--disable-setuid-sandbox"],
		});
	}
}

export async function POST(req: Request) {
	try {
		const { url } = await req.json();

		if (!url) {
			return NextResponse.json({ error: "URL is required" }, { status: 400 });
		}

		const browser = await getBrowser();

		const page = await browser.newPage();

		await page.setViewport({ width: 1280, height: 800 });
		await page.goto(url, { waitUntil: "domcontentloaded", timeout: 45000 });
		await new Promise((resolve) => setTimeout(resolve, 5000));

		const results = await runAxeScan(page);
		const screenshot = await page.screenshot({
			encoding: "base64",
			type: "jpeg",
			quality: 50,
			fullPage: true,
		});

		// NEW: Extract links with readable names
		const links = await page.evaluate(() => {
			const origin = window.location.origin;
			return (
				Array.from(document.querySelectorAll("a"))
					.filter((a) => a.href.startsWith(origin)) // Internal only
					.filter((a) => !a.href.includes("#")) // Ignore anchors
					.map((a) => {
						// Clean up the text or fallback to the path
						let name = a.innerText.trim();
						if (!name || name.length > 30) {
							// Fallback: Use the URL path (e.g. /about-us) if text is missing or too long
							const path = new URL(a.href).pathname;
							name = path === "/" ? "Home" : path.replace(/\//g, " ").trim();
						}
						return { url: a.href, name: name || "Untitled Page" };
					})
					// Remove duplicates based on URL
					.filter((v, i, a) => a.findIndex((t) => t.url === v.url) === i)
					.slice(0, 50)
			);
		});

		await browser.close();

		// Get AI recommendations
		console.log("Starting AI analysis...");
		let aiRecommendations: any[] = [];
		try {
			// Pass raw base64 (without data:image/... prefix)
			aiRecommendations = await getAiRecommendations(
				results.violations,
				screenshot
			);
		} catch (error) {
			console.error("Gemini API failed:", error);
			// Re-throw to ensure the frontend sees the error
			throw error;
		}

		console.log("AI analysis complete.");

		return NextResponse.json({
			violations: results.violations,
			aiRecommendations,
			screenshot: `data:image/png;base64,${screenshot}`,
			links, // Return discovered links
		});
	} catch (error) {
		console.error("Scan error:", error);
		return NextResponse.json(
			{
				error: "Failed to analyze URL",
				details: error instanceof Error ? error.message : String(error),
			},
			{ status: 500 }
		);
	}
}
