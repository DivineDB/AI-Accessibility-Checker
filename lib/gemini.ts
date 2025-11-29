import { GoogleGenerativeAI, SchemaType, Schema } from "@google/generative-ai";
import { AxeResults } from "axe-core";

// --- TYPE DEFINITIONS ---
export interface Recommendation {
	ruleId: string;
	summary: string;
	impact: string;
	codeFix: string;
}

// Schema for structured JSON output
const RecommendationSchema: Schema = {
	type: SchemaType.ARRAY,
	items: {
		type: SchemaType.OBJECT,
		properties: {
			ruleId: {
				type: SchemaType.STRING,
				description: "The axe-core rule identifier.",
			},
			summary: {
				type: SchemaType.STRING,
				description:
					"Professional summary citing WCAG Success Criteria (e.g., 'Contrast Fail WCAG 1.4.3').",
			},
			impact: {
				type: SchemaType.STRING,
				description:
					"User-centric impact explaining how specific tools (NVDA, VoiceOver) fail on this element.",
			},
			codeFix: {
				type: SchemaType.STRING,
				description: "Semantic code snippet fixing the issue.",
			},
		},
		required: ["ruleId", "summary", "impact", "codeFix"],
	},
};

const apiKey = process.env.GEMINI_API_KEY!;
const genAI = new GoogleGenerativeAI(apiKey);

export async function getAiRecommendations(
	violations: AxeResults["violations"],
	screenshotBase64: string // Expecting raw base64 string without data URI prefix
): Promise<Recommendation[]> {
	if (violations.length === 0) return [];

	// 1. Simplify the violations for the AI (Save tokens)
	const violationSummary = violations.map((v) => ({
		id: v.id,
		help: v.help,
		nodes: v.nodes.map((n) => n.html).slice(0, 3), // Top 3 snippets only
	}));

	// 2. The Expert System Prompt
	const systemPrompt = `
    You are a Senior Accessibility Engineer and WCAG 2.2 Specialist.
    
    INPUTS:
    1. A screenshot of the webpage.
    2. A JSON list of Axe-core violations detected in the code.

    YOUR TASK:
    For each violation, analyze the Visual Context (Screenshot) and the Code (JSON).
    
    REQUIREMENTS:
    - Summary: Cite specific WCAG criteria.
    - Impact: Explain *why* it matters. Mention specific tools (VoiceOver, JAWS, ZoomText).
    - Fix: Provide the specific Tailwind/HTML fix.
    
    If the screenshot shows that a contrast issue is actually a False Positive (e.g. text is on a dark image not visible in code), note that in the summary.
    `;

	const model = genAI.getGenerativeModel({
		model: "gemini-2.0-flash", // Updated to available model
		generationConfig: {
			responseMimeType: "application/json",
			responseSchema: RecommendationSchema,
		},
		systemInstruction: systemPrompt,
	});

	// Construct the payload
	const prompt = `Analyze these violations: ${JSON.stringify(
		violationSummary
	)}`;
	const imagePart = {
		inlineData: {
			data: screenshotBase64,
			mimeType: "image/png",
		},
	};

	console.log("Payload sent to Gemini:", {
		promptLength: prompt.length,
		imageLength: screenshotBase64.length,
		model: "gemini-2.0-flash",
	});

	// Send BOTH image and text - Let errors propagate!
	const result = await model.generateContent([prompt, imagePart]);

	console.log("Gemini Raw Response:", result.response.text());

	return JSON.parse(result.response.text());
}
