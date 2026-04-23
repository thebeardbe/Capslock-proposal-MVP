# Autonomous Micro-Agency – Weekly Brief MVP

A premium AI-powered performance marketing analysis tool. This MVP (Minimum Viable Product) automates the process of parsing Google Ads daily performance data, calculating Week-over-Week (WoW) deltas, detecting significant changes, and generating executive summaries using Gemini 3.1 Flash.

## 🚀 Key Features

- **Automated Data Ingestion**: Drag-and-drop CSV parser with schema validation.
- **WoW Aggregation**: Intelligent calculation of Cost, Conversion, CPA, and CTR deltas.
- **AI-Enhanced Briefs**: Generates professional 2-3 paragraph textual summaries using the Gemini 3.1 Flash API.
- **Dynamic Dashboard**: Interactive React frontend with real-time metric cards and tactical recommendations.
- **Observability**: Centralized event logging system (saved to disk) accessible via a hidden diagnostic page.
- **Premium UI**: Dark-themed, glassmorphic design system tailored to the CapsLock global branding.

## 🛠 Tech Stack

- **Frontend**: React 18, Vite, TypeScript, Vanilla CSS.
- **Backend (Logging)**: Node.js (ES Modules).
- **AI**: Gemini 3.1 Flash (via Google Generative Language API).
- **Deployment**: Docker, Docker Compose (Nginx proxy-ready).

## 🚦 Getting Started

### Prerequisites

- [Docker](https://www.docker.com/) and [Docker Compose](https://docs.docker.com/compose/).
- A Google Gemini API Key.

### Installation & Setup

1. **Clone the repository**:
   ```bash
   git clone <repository-url>
   cd Capslock-proposal-MVP
   ```

2. **Configure environment variables**:
   Create a `.env` file in the root directory:
   ```env
   VITE_GEMINI_API_KEY=your_gemini_api_key_here
   ALLOWED_HOST=your.domain.com
   ```

3. **Run with Docker**:
   ```bash
   docker compose up -d --build
   ```
   The application will be available at `http://localhost:5173` (or your configured `ALLOWED_HOST`).

## 📋 Mock Data & Testing

The application includes 6 mock CSV files for instant testing. You can run these directly from the **"Test Examples ▼"** dropdown in the header to see how the analysis and AI summaries perform across different client scenarios.

## 🔍 Diagnostics & Logs

Access the persistent log viewer at:
`http://<your-domain>/filip`

Logs are persisted to `logs/app.jsonl` on the host machine via a volume mount.

## 📄 License

&copy; 2026 [Filip Bunkens](https://www.bunkens.be) made for CapsLock.
