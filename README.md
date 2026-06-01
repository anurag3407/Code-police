# Bad Code Police 🚓

An AI-powered automated code analysis tool that continuously monitors your GitHub repositories. Bad Code Police acts as an automated reviewer that detects security vulnerabilities, performance issues, bugs, and style inconsistencies, helping your team maintain a high standard of code quality.

## Features ✨

- **Automated Code Analysis**: Integrates directly with GitHub repositories via webhooks. Every push or pull request triggers an automated review.
- **AI-Powered Insights**: Uses advanced language models (Gemini) through LangChain to deeply analyze code context, detect complex bugs, and suggest actionable fixes.
- **Comprehensive Dashboards**: View historical runs, track issues over time, and manage organization-wide settings.
- **Categorized Findings**: Issues are categorized into Security, Performance, Readability, Bugs, Test Coverage, and Style.
- **Role-Based Access**: Manage organizations, projects, and team members.
- **Detailed Analytics**: Get insights on the number of critical, high, medium, and low severity issues, and how they evolve week over week.

## Tech Stack 🛠️

- **Frontend**: Next.js 16 (App Router), React 19, Tailwind CSS v4, Lucide React (Icons), Radix UI (Primitives)
- **Backend**: Next.js API Routes, Firebase Admin SDK
- **Database & Auth**: Firebase Firestore, Firebase Authentication
- **AI Integration**: LangChain, Google Gen AI (Gemini)
- **External APIs**: Octokit (GitHub API & Webhooks)

## Prerequisites 📋

- Node.js (v20 or higher)
- npm or yarn
- A Firebase Project (with Firestore and Authentication enabled)
- A GitHub OAuth App (for repository connections)
- A Google AI (Gemini) API Key

## Getting Started 🚀

### 1. Clone the repository

\`\`\`bash
git clone <repository-url>
cd code-police
\`\`\`

### 2. Install dependencies

\`\`\`bash
npm install
\`\`\`

### 3. Environment Setup

Copy the example environment file and fill in your credentials:

\`\`\`bash
cp env.example .env.local
\`\`\`

Fill in the required variables in `.env.local`:
- **Firebase Public Config**: Used by the client SDK.
- **Firebase Admin SDK**: Generate a new private key from your Firebase Project Settings > Service Accounts.
- **GitHub OAuth**: Create an OAuth app in your GitHub Developer Settings.
- **Google AI Key**: Get your API key from Google AI Studio.

### 4. Run the Development Server

\`\`\`bash
npm run dev
\`\`\`

Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

## Project Structure 📁

- \`src/app\`: Next.js App Router pages (Dashboard, Projects, Runs, Billing, Settings, Auth).
- \`src/components\`: Reusable UI components built with Radix UI and Tailwind CSS.
- \`src/hooks\`: Custom React hooks (e.g., \`useAuth\`, \`useOrg\`).
- \`src/lib\`: Core utilities including Firebase configuration (\`config.ts\`, \`admin.ts\`).
- \`src/types\`: TypeScript definitions.

## Deployment 🌐

The easiest way to deploy your Next.js app is to use the [Vercel Platform](https://vercel.com/new). Make sure to set all your environment variables in your Vercel project settings.

## Contributing 🤝

Contributions are welcome! Please feel free to submit a Pull Request.

1. Fork the project
2. Create your feature branch (\`git checkout -b feature/AmazingFeature\`)
3. Commit your changes (\`git commit -m 'Add some AmazingFeature'\`)
4. Push to the branch (\`git push origin feature/AmazingFeature\`)
5. Open a Pull Request

## License 📄

This project is licensed under the MIT License.
