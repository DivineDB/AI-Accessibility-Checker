"use client";

import { useState, useEffect } from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import confetti from "canvas-confetti";
import {
	Loader2,
	Search,
	Layout,
	AlertTriangle,
	CheckCircle,
	XCircle,
	Terminal,
	ArrowRight,
	Plus,
	Globe,
	Download,
	Clock,
	ChevronRight,
	ThumbsDown,
	ThumbsUp,
} from "lucide-react";

export default function Dashboard() {
	const [urlInput, setUrlInput] = useState("");
	const [isScanning, setIsScanning] = useState(false);
	const [pages, setPages] = useState<any[]>([]);
	const [activePageIndex, setActivePageIndex] = useState<number>(0);
	const [error, setError] = useState<string | null>(null);
	const [expandedFix, setExpandedFix] = useState<string | null>(null);
	const [showOverlay, setShowOverlay] = useState(false);

	// Helper to scan a specific url
	const runScan = async (targetUrl: string) => {
		if (!targetUrl) return;
		setIsScanning(true);
		setError(null);

		try {
			const response = await fetch("/api/scan", {
				method: "POST",
				headers: { "Content-Type": "application/json" },
				body: JSON.stringify({ url: targetUrl }),
			});
			const data = await response.json();

			if (!response.ok) {
				throw new Error(data.error || "Scan failed");
			}

			// Add timestamp to the result data
			const resultWithTime = { ...data, scannedAt: new Date() };

			setPages((prev) => {
				const newPages = [...prev, { url: targetUrl, data: resultWithTime }];
				return newPages;
			});
			setActivePageIndex(pages.length); // Note: pages.length is old length, which is correct index for new item
			setUrlInput("");
		} catch (err) {
			setError(err instanceof Error ? err.message : "Scan failed");
		} finally {
			setIsScanning(false);
		}
	};

	const activePage = pages[activePageIndex];
	const activeResult = activePage?.data;

	// Trigger effects when active page changes
	useEffect(() => {
		if (activePage) {
			const score = Math.max(0, 100 - activePage.data.violations.length * 5);
			if (score > 70) {
				confetti({
					particleCount: 100,
					spread: 70,
					origin: { y: 0.6 },
					colors: ["#6366f1", "#a855f7", "#ec4899"], // Indigo, Purple, Pink
				});
				setShowOverlay(true);
			} else {
				setShowOverlay(true);
			}
		}
	}, [activePage]);

	// --- RATING LOGIC ---
	const score = activeResult
		? Math.max(0, 100 - activeResult.violations.length * 5)
		: 0;

	const getScoreConfig = (s: number) => {
		if (s >= 90)
			return {
				label: "Excellent",
				text: "text-emerald-400",
				stroke: "stroke-emerald-500",
				bg: "bg-emerald-500/10",
				border: "border-emerald-500/20",
			};
		if (s >= 70)
			return {
				label: "Fair",
				text: "text-amber-400",
				stroke: "stroke-amber-500",
				bg: "bg-amber-500/10",
				border: "border-amber-500/20",
			};
		return {
			label: "Poor",
			text: "text-rose-500",
			stroke: "stroke-rose-500",
			bg: "bg-rose-500/10",
			border: "border-rose-500/20",
		};
	};

	const config = getScoreConfig(score);
	const radius = 60;
	const circumference = 2 * Math.PI * radius;
	const strokeDashoffset = circumference - (score / 100) * circumference;

	return (
		<main className="min-h-screen bg-zinc-950 text-zinc-100 font-sans flex flex-col relative">
			{/* --- Score Overlay --- */}
			{showOverlay && activePage && (
				<div
					className="fixed inset-0 z-[100] flex items-center justify-center bg-black/80 backdrop-blur-sm animate-in fade-in duration-300 print:hidden"
					onClick={() => setShowOverlay(false)}
				>
					<div className="bg-zinc-900 border border-zinc-800 p-8 rounded-2xl shadow-2xl max-w-md text-center transform transition-all scale-100 animate-in zoom-in-95 duration-300">
						{Math.max(0, 100 - activePage.data.violations.length * 5) > 70 ? (
							<>
								<div className="w-20 h-20 bg-emerald-500/20 rounded-full flex items-center justify-center mx-auto mb-6">
									<ThumbsUp className="w-10 h-10 text-emerald-500" />
								</div>
								<h2 className="text-3xl font-bold text-white mb-2">
									Great Job!
								</h2>
								<p className="text-zinc-400 mb-6">
									Your accessibility score is looking good.
								</p>
							</>
						) : (
							<>
								<div className="w-20 h-20 bg-rose-500/20 rounded-full flex items-center justify-center mx-auto mb-6">
									<ThumbsDown className="w-10 h-10 text-rose-500" />
								</div>
								<h2 className="text-3xl font-bold text-white mb-2">
									Needs Improvement
								</h2>
								<p className="text-zinc-400 mb-6">
									There are significant accessibility issues to fix.
								</p>
							</>
						)}
						<Button onClick={() => setShowOverlay(false)} className="w-full">
							View Report
						</Button>
					</div>
				</div>
			)}
			{/* --- Global Header --- */}
			<div className="border-b border-zinc-800 bg-zinc-900/50 backdrop-blur-xl sticky top-0 z-50 h-16 flex items-center justify-between px-6 shadow-md print:hidden">
				<div className="flex items-center gap-2 font-bold text-xl shrink-0">
					<div className="w-8 h-8 bg-indigo-600 rounded-lg flex items-center justify-center shadow-lg shadow-indigo-500/20 transition-transform hover:scale-105 duration-300">
						<Layout className="w-5 h-5 text-white" />
					</div>
					<span>
						Accessibility <span className="text-zinc-500">Checker</span>
					</span>
				</div>
				<div className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 w-full max-w-xl px-4">
					<div className="relative group">
						<div className="absolute -inset-0.5 bg-gradient-to-r from-indigo-500 to-purple-600 rounded-lg blur opacity-20 group-hover:opacity-40 transition duration-500"></div>
						<div className="relative flex gap-2 bg-zinc-900 rounded-lg p-1">
							<div className="relative flex-1">
								<Search className="absolute left-3 top-2.5 w-4 h-4 text-zinc-500" />
								<Input
									value={urlInput}
									onChange={(e) => setUrlInput(e.target.value)}
									placeholder="Enter URL to scan..."
									className="pl-9 bg-transparent border-none focus-visible:ring-0 text-sm h-9"
									onKeyDown={(e) => e.key === "Enter" && runScan(urlInput)}
									disabled={isScanning}
								/>
							</div>
							<Button
								size="sm"
								onClick={() => runScan(urlInput)}
								disabled={isScanning || !urlInput}
								className="bg-indigo-600 hover:bg-indigo-500 text-white h-9 px-4 transition-all hover:scale-105 active:scale-95"
							>
								{isScanning ? (
									<Loader2 className="w-4 h-4 animate-spin" />
								) : (
									"Get my score"
								)}
							</Button>
						</div>
					</div>
				</div>
				<div className="w-8"></div> {/* Spacer */}
			</div>

			<div className="flex flex-1 overflow-hidden">
				{/* --- Sidebar --- */}
				<div className="w-72 border-r border-zinc-800 bg-zinc-900/30 overflow-y-auto p-4 space-y-2 hidden lg:block print:hidden">
					<div className="flex items-center justify-between mb-4 px-2">
						<h3 className="text-xs font-bold text-zinc-500 uppercase tracking-wider">
							Session History
						</h3>
						<span className="text-[10px] bg-zinc-800 px-2 py-0.5 rounded-full text-zinc-400">
							{pages.length}
						</span>
					</div>

					{pages.length === 0 && (
						<div className="text-sm text-zinc-600 text-center py-8 italic">
							No pages scanned yet.
						</div>
					)}

					{pages.map((page, idx) => {
						const pScore = Math.max(0, 100 - page.data.violations.length * 5);
						const pConfig = getScoreConfig(pScore);
						return (
							<button
								key={idx}
								onClick={() => setActivePageIndex(idx)}
								className={`w-full text-left p-3 rounded-xl text-sm transition-all duration-200 border group ${
									activePageIndex === idx
										? "bg-zinc-800 border-zinc-700 shadow-sm scale-[1.02]"
										: "border-transparent hover:bg-zinc-800/50 text-zinc-400 hover:translate-x-1"
								}`}
							>
								<div className="font-medium truncate text-zinc-200">
									{new URL(page.url).pathname === "/"
										? "Home"
										: new URL(page.url).pathname}
								</div>
								<div className="text-[10px] text-zinc-500 truncate mb-2">
									{page.url}
								</div>
								<div className="flex items-center justify-between">
									<span className={`text-xs font-bold ${pConfig.text}`}>
										{pConfig.label} ({pScore})
									</span>
									<ChevronRight className="w-3 h-3 text-zinc-600" />
								</div>
							</button>
						);
					})}
				</div>

				{/* --- Main Content --- */}
				<div className="flex-1 overflow-y-auto p-6 lg:p-10">
					{error && (
						<div className="bg-rose-500/10 border border-rose-500/20 text-rose-400 p-4 rounded-xl mb-8 flex items-center gap-3 animate-in slide-in-from-top-2">
							<AlertTriangle className="w-5 h-5" /> {error}
						</div>
					)}

					{isScanning ? (
						<div className="max-w-6xl mx-auto space-y-8 animate-pulse">
							<div className="bg-zinc-900/50 border border-zinc-800 p-8 rounded-3xl h-64"></div>
							<div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
								<div className="h-40 bg-zinc-900/50 rounded-2xl"></div>
								<div className="lg:col-span-2 h-96 bg-zinc-900/50 rounded-2xl"></div>
							</div>
						</div>
					) : error ? (
						<div className="h-full flex flex-col items-center justify-center text-rose-500 space-y-4">
							<div className="p-6 bg-rose-500/10 rounded-full border border-rose-500/20">
								<AlertTriangle className="w-12 h-12" />
							</div>
							<div className="text-center">
								<h2 className="text-xl font-bold">Analysis Failed</h2>
								<p className="text-zinc-400 mt-2 max-w-md px-4">{error}</p>
							</div>
						</div>
					) : !activeResult ? (
						<div className="h-full flex flex-col items-center justify-center text-zinc-500 space-y-6">
							<div className="p-6 bg-zinc-900 rounded-full">
								<Globe className="w-12 h-12 text-zinc-700" />
							</div>
							<div className="text-center max-w-md">
								<h2 className="text-xl font-semibold text-zinc-300 mb-2">
									Ready to Audit
								</h2>
								<p className="text-sm">
									Enter a website URL above to start the automated accessibility
									analysis powered by Gemini AI.
								</p>
							</div>
						</div>
					) : (
						<div className="max-w-6xl mx-auto space-y-8">
							{/* --- REPORT HERO CARD --- */}
							<div className="bg-zinc-900 border border-zinc-800 p-8 rounded-3xl shadow-xl relative overflow-hidden print:border-none print:shadow-none">
								<div
									className={`absolute top-0 right-0 w-64 h-64 bg-gradient-to-br ${config.bg.replace(
										"/10",
										"/5"
									)} blur-3xl rounded-full pointer-events-none -mr-16 -mt-16 print:hidden`}
								></div>

								<div className="flex flex-col md:flex-row items-center gap-10 relative z-10">
									{/* Score Circle */}
									<div className="relative w-40 h-40 shrink-0">
										<svg className="w-full h-full -rotate-90 transform drop-shadow-2xl">
											<circle
												cx="80"
												cy="80"
												r={radius}
												stroke="currentColor"
												strokeWidth="8"
												fill="transparent"
												className="text-zinc-800"
											/>
											<circle
												cx="80"
												cy="80"
												r={radius}
												stroke="currentColor"
												strokeWidth="8"
												fill="transparent"
												strokeDasharray={circumference}
												strokeDashoffset={strokeDashoffset}
												strokeLinecap="round"
												className={`${config.stroke} transition-all duration-1000`}
											/>
										</svg>
										<div className="absolute inset-0 flex flex-col items-center justify-center">
											<span className={`text-5xl font-black ${config.text}`}>
												{score}
											</span>
											<span className="text-zinc-500 text-xs uppercase tracking-wider font-bold mt-1">
												Score
											</span>
										</div>
									</div>

									{/* Report Details */}
									<div className="flex-1 text-center md:text-left space-y-4">
										<div>
											<div
												className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-bold border mb-3 ${config.bg} ${config.text} ${config.border}`}
											>
												{config.label} Rating
											</div>
											<h1 className="text-3xl font-bold text-white mb-1">
												Accessibility Report
											</h1>
											<a
												href={activePage.url}
												target="_blank"
												rel="noreferrer"
												className="text-zinc-400 text-sm hover:text-indigo-400 hover:underline truncate block max-w-md"
											>
												{activePage.url}
											</a>
										</div>

										<div className="flex flex-wrap gap-4 justify-center md:justify-start text-sm text-zinc-400">
											<div className="flex items-center gap-2 bg-zinc-950/50 px-3 py-2 rounded-lg border border-zinc-800">
												<AlertTriangle className="w-4 h-4 text-rose-500" />
												<span className="text-zinc-200 font-bold">
													{activeResult.violations.length}
												</span>{" "}
												Issues
											</div>
											<div className="flex items-center gap-2 bg-zinc-950/50 px-3 py-2 rounded-lg border border-zinc-800">
												<Globe className="w-4 h-4 text-indigo-500" />
												<span className="text-zinc-200 font-bold">
													{activeResult.links?.length || 0}
												</span>{" "}
												Links
											</div>
											<div className="flex items-center gap-2 bg-zinc-950/50 px-3 py-2 rounded-lg border border-zinc-800">
												<Clock className="w-4 h-4 text-zinc-500" />
												{activePage.data.scannedAt
													? new Date(
															activePage.data.scannedAt
													  ).toLocaleTimeString()
													: "Just now"}
											</div>
										</div>
									</div>

									{/* Actions */}
									<div className="flex flex-col gap-3 print:hidden">
										<Button
											variant="outline"
											onClick={() => window.print()}
											className="border-zinc-700 hover:bg-zinc-800 text-zinc-100 hover:text-white transition-all hover:scale-105"
										>
											<Download className="w-4 h-4 mr-2" /> Export PDF
										</Button>
									</div>
								</div>
							</div>

							<div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
								{/* --- Left Column: Crawler & Preview --- */}
								<div className="space-y-6 print:hidden">
									{/* Discovered Links */}
									<div className="bg-zinc-900/50 border border-zinc-800 rounded-2xl p-5">
										<h3 className="font-semibold text-zinc-200 mb-4 flex items-center gap-2 text-sm uppercase tracking-wider">
											<Globe className="w-4 h-4 text-indigo-500" /> Discovered
											Pages
										</h3>
										<div className="space-y-1 max-h-60 overflow-y-auto pr-2 custom-scrollbar">
											{activeResult.links?.map(
												(link: { name: string; url: string }, i: number) => (
													<div
														key={i}
														className="flex items-center justify-between group p-2 hover:bg-zinc-800 rounded-lg transition-colors cursor-default"
													>
														<div className="flex flex-col overflow-hidden mr-2">
															<span
																className="text-sm text-zinc-300 truncate w-full block"
																title={link.name}
															>
																{link.name}
															</span>
															<span className="text-[10px] text-zinc-600 truncate font-mono">
																{link.url}
															</span>
														</div>
														<Button
															size="icon"
															variant="ghost"
															onClick={() => runScan(link.url)}
															className="h-7 w-7 text-zinc-500 hover:text-indigo-400 hover:bg-indigo-500/10"
															title="Scan this page"
														>
															<Plus className="w-4 h-4" />
														</Button>
													</div>
												)
											)}
										</div>
									</div>
								</div>

								{/* --- Right Column: Issues List --- */}
								<div className="lg:col-span-2 space-y-4">
									<div className="flex items-center justify-between">
										<h3 className="font-semibold text-zinc-200 flex items-center gap-2 text-sm uppercase tracking-wider">
											<Terminal className="w-4 h-4 text-indigo-500" /> Detailed
											Analysis
										</h3>
									</div>

									{activeResult.aiRecommendations.map((rec: any, i: number) => (
										<div
											key={i}
											className="bg-zinc-900 border border-zinc-800 rounded-xl overflow-hidden shadow-sm hover:border-zinc-700 transition-all break-inside-avoid"
										>
											<div className="p-5 flex gap-4">
												<div className="mt-1">
													<XCircle className="w-5 h-5 text-rose-500" />
												</div>
												<div className="flex-1">
													<div className="flex justify-between items-start mb-2 gap-4">
														<h4 className="font-medium text-zinc-200 text-base">
															{rec.summary}
														</h4>
														<span className="text-[10px] bg-zinc-950 border border-zinc-800 px-2 py-1 rounded text-zinc-500 font-mono whitespace-nowrap">
															{rec.ruleId}
														</span>
													</div>
													<p className="text-sm text-zinc-400 mb-4 leading-relaxed">
														{rec.impact}
													</p>
													<Button
														variant="outline"
														size="sm"
														onClick={() =>
															setExpandedFix(
																expandedFix === rec.ruleId ? null : rec.ruleId
															)
														}
														className={`h-8 text-xs border-zinc-700 transition-all duration-300 print:hidden ${
															expandedFix === rec.ruleId
																? "bg-zinc-800 text-white"
																: "bg-transparent text-zinc-400 hover:text-zinc-200"
														}`}
													>
														{expandedFix === rec.ruleId
															? "Hide Remediation"
															: "View AI Fix"}
													</Button>
												</div>
											</div>

											<div
												className={`grid transition-all duration-500 ease-in-out ${
													expandedFix === rec.ruleId
														? "grid-rows-[1fr] opacity-100"
														: "grid-rows-[0fr] opacity-0"
												}`}
											>
												<div className="overflow-hidden">
													<div className="bg-black/40 border-t border-zinc-800 p-4">
														<div className="flex items-center gap-2 mb-2">
															<span className="w-2 h-2 rounded-full bg-emerald-500"></span>
															<span className="text-xs font-bold text-zinc-500 uppercase">
																Suggested Code
															</span>
														</div>
														<pre className="text-xs font-mono text-emerald-400 overflow-x-auto bg-zinc-950/50 p-3 rounded-lg border border-zinc-800/50">
															<code>
																{rec.codeFix
																	.replace(/```(css|html|jsx|tsx)?/g, "")
																	.replace(/```/g, "")
																	.trim()}
															</code>
														</pre>
													</div>
												</div>
											</div>
										</div>
									))}
								</div>
							</div>
						</div>
					)}
				</div>
			</div>
		</main>
	);
}
