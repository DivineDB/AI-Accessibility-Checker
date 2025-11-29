# Accessibility Checker

**AI-Powered Accessibility Analysis & Remediation Tool**

![License](https://img.shields.io/badge/license-MIT-blue.svg)
![Next.js](https://img.shields.io/badge/Next.js-14-black)
![Tailwind](https://img.shields.io/badge/Tailwind-CSS-38bdf8)

## 🚀 The Problem

Traditional accessibility tools (like Axe or Lighthouse) are great at **detecting** issues, but they often fall short on **remediation**:

- They provide generic advice (e.g., "Fix contrast") without context.
- They don't understand your specific tech stack (Tailwind, React, etc.).
- They can't "see" the page to rule out false positives (e.g., white text on a dark image).

## 💡 The Solution

**Accessibility Checker** bridges the gap between detection and action. It combines industry-standard scanning (Axe-core) with multimodal AI (Google Gemini) to provide:

1.  **Visual Context**: The AI analyzes a screenshot of the element to understand the user impact.
2.  **Code-Specific Fixes**: Generates copy-pasteable code snippets (Tailwind classes, HTML attributes) tailored to the violation.
3.  **Human-Centric Explanations**: Explains _why_ an issue matters for specific users (e.g., "VoiceOver users will hear 'link' instead of 'Submit'").

## ✨ Key Features

- **🤖 AI-Powered Remediation**: Uses Google Gemini 2.0 Flash to generate specific code fixes.
- **📸 Multimodal Analysis**: Sends both code and screenshots to the AI for accurate context.
- **📄 Dark Mode PDF Export**: Generate professional, dark-themed PDF reports for stakeholders.
- **🏆 Interactive Scoring**: Visual feedback with confetti for high scores (>70) and guidance for low scores.
- **⚡ Real-time Analysis**: Scans pages and generates reports in under 60 seconds.
- **🎨 Modern UI**: Built with Shadcn UI and Tailwind CSS for a premium dark-mode experience.

## 🛠️ Tech Stack

- **Frontend**: Next.js 14 (App Router), React, Tailwind CSS, Lucide Icons.
- **Backend**: Next.js API Routes.
- **Scanning Engine**: Puppeteer, @axe-core/puppeteer.
- **AI Engine**: Google Gemini API (@google/generative-ai).
- **UI Components**: Shadcn UI.

## 🚀 Getting Started

### Prerequisites

- Node.js 18+
- A Google Gemini API Key ([Get one here](https://aistudio.google.com/app/apikey))

### Installation

1.  **Clone the repository:**

    ```bash
    git clone https://github.com/yourusername/acc-checker.git
    cd acc-checker
    ```

2.  **Install dependencies:**

    ```bash
    npm install
    ```

3.  **Configure Environment Variables:**
    Create a `.env.local` file in the root directory:

    ```env
    GEMINI_API_KEY=your_api_key_here
    ```

4.  **Run the Development Server:**

    ```bash
    npm run dev
    ```

5.  **Open the App:**
    Navigate to [http://localhost:3000](http://localhost:3000).

## 📖 Usage

1.  **Enter a URL**: Type the URL you want to test (e.g., `https://dequeuniversity.com/demo/mars/`).
2.  **Get Score**: Click "Get my score". The app will scan the page and analyze violations.
3.  **Review Issues**:
    - See the overall score.
    - Expand individual violations to see the **AI Fix**.
    - Read the **Impact** statement to understand the user experience.
4.  **Export**: Click "Export PDF" to save a report.

## 🤝 Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

## 📄 License

This project is licensed under the MIT License.
