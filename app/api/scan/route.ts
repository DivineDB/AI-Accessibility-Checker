import { NextResponse } from "next/server";
import puppeteer from "puppeteer-core";
import chromium from "@sparticuz/chromium";
import { runAxeScan } from "@/lib/axe";
import { getAiRecommendations } from "@/lib/gemini";

export const maxDuration = 60; // Allow up to 60 seconds (Pro plan feature, but helpful to set)
export const dynamic = "force-dynamic";

// Optional: Load local puppeteer for development only
const getLocalPuppeteer = async () => {
	try {
		const p = await import("puppeteer");
		return p.default;
	} catch (e) {
		console.error("Local puppeteer not found", e);
		return null;
	}
};

export async function POST(req: Request) {
	try {
		const { url } = await req.json();

		if (!url) {
			return NextResponse.json({ error: "URL is required" }, { status: 400 });
		}

		let browser;
		if (process.env.NODE_ENV === "production" || process.env.VERCEL) {
			// Production (Vercel)
			browser = await puppeteer.launch({
				args: chromium.args,
				defaultViewport: (chromium as any).defaultViewport,
				executablePath: await chromium.executablePath(),
				headless: (chromium as any).headless,
				ignoreHTTPSErrors: true,
			} as any);
		} else {
			// Local Development
			const localPuppeteer = await getLocalPuppeteer();
			if (localPuppeteer) {
				browser = await localPuppeteer.launch({
					headless: true,
					args: ["--no-sandbox", "--disable-setuid-sandbox"],
				});
			} else {
				// Fallback if local puppeteer fails (shouldn't happen if installed)
				browser = await puppeteer.launch({
					channel: "chrome",
					headless: true,
					args: ["--no-sandbox", "--disable-setuid-sandbox"],
				});
			}
		}

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
