async function testScan() {
	console.log("Starting scan test...");
	try {
		const response = await fetch("http://localhost:3000/api/scan", {
			method: "POST",
			headers: { "Content-Type": "application/json" },
			body: JSON.stringify({ url: "https://dequeuniversity.com/demo/mars/" }),
		});

		if (!response.ok) {
			console.error("Scan failed with status:", response.status);
			const text = await response.text();
			console.error("Response:", text);
			return;
		}

		const data = await response.json();
		console.log("Scan successful!");
		console.log(
			"Violations count:",
			data.violations ? data.violations.length : "N/A"
		);
		console.log(
			"AI Recommendations count:",
			data.aiRecommendations ? data.aiRecommendations.length : "N/A"
		);
		console.log("Screenshot present:", !!data.screenshot);
		console.log("Links count:", data.links ? data.links.length : "N/A");
	} catch (error) {
		console.error("Error during scan test:", error);
	}
}

testScan();
