# BLever.AI ESG Scoring Automation Platform

A modern web application for automating ESG (Environmental, Social, and Governance) scoring for companies.

## Overview

BLever.AI helps organizations automate their ESG data collection, analysis, and reporting processes. The platform uses AI to extract metrics from corporate documents, calculate ESG scores, and provide insights for sustainable business practices.

## Features

- **Document Management**: Upload, process, and organize ESG-related documents
- **Automated ESG Scoring**: AI-powered analysis provides comprehensive ESG scores
- **Dashboard Insights**: Visualize ESG performance across environmental, social, and governance categories
- **Company Profile Management**: Maintain company information and ESG contacts
- **Missing Metrics Tracking**: Identify and address data gaps in ESG reporting
- **Real-time Processing Updates**: Monitor document processing and scoring calculation status

## Tech Stack

- **Frontend**: Next.js, React, TypeScript, TailwindCSS, shadcn/ui components
- **Backend**: Node.js API with MongoDB database
- **Authentication**: Clerk for user and organization management
- **AI Processing**: Custom AI models for document analysis and ESG metric extraction
- **Deployment**: Docker, vercel, or custom deployment options

## Getting Started

### Prerequisites

- Node.js 18.x or later
- npm or yarn
- MongoDB connection (local or Atlas)
- Clerk account for authentication

### Installation

1. Clone the repository
   ```bash
   git clone https://github.com/your-username/blever-ai-webapp.git
   cd blever-ai-webapp
   ```

2. Install dependencies
   ```bash
   npm install
   # or
   yarn install
   ```

3. Set up environment variables
   ```
   # Create a .env.local file with the following variables
   NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=your_clerk_publishable_key
   CLERK_SECRET_KEY=your_clerk_secret_key
   NEXT_PUBLIC_CLERK_SIGN_IN_URL=/sign-in
   NEXT_PUBLIC_CLERK_SIGN_UP_URL=/sign-up
   NEXT_PUBLIC_CLERK_AFTER_SIGN_IN_URL=/dashboard
   NEXT_PUBLIC_CLERK_AFTER_SIGN_UP_URL=/onboarding
   
   # Backend API URL (default for local development)
   NEXT_PUBLIC_API_URL=http://localhost:3001
   ```

4. Run the development server
   ```bash
   npm run dev
   # or
   yarn dev
   ```

5. Open [http://localhost:3000](http://localhost:3000) in your browser

## Application Structure

- `/src/app`: Next.js pages and routes
- `/src/components`: Reusable React components
- `/src/hooks`: Custom React hooks
- `/src/lib`: Utility functions and shared logic
- `/public`: Static assets

## Key Pages

- **Dashboard**: Overview of ESG performance with key metrics and statistics
- **Company**: Manage company information and ESG contacts
- **Data Management**: Upload and manage documents for ESG analysis
- **Settings**: Configure application settings and preferences

## API Endpoints

The application interacts with a backend API for document processing and ESG scoring:

### Authentication
All API requests require authentication using a JWT bearer token.

### ESG Scores
- `GET /api/esg/scores`: Get ESG scores for the current organization
- `GET /api/esg/scoring-queue-status`: Check status of ESG score calculation

### Document Management
- `GET /api/documents`: List all documents for an organization
- `POST /api/documents`: Upload new documents
- `DELETE /api/documents/:id`: Delete a document
- `POST /api/esg/documents/:id/extract`: Extract ESG metrics from a document

### ESG Data
- `GET /api/esg/recommendations`: Get recommendations for improving ESG scores
- `GET /api/esg/metrics/missing`: Get missing metrics that would improve scores

## Document Processing

The system accepts various document formats:
- PDF files (preferred for most ESG reports)
- CSV, XLSX (for structured data)
- DOC, DOCX (for text documents)
- JSON (for structured data import)

Maximum file size: 10MB per document
Maximum batch upload: 10 documents at once

## ESG Scoring Methodology

The BLever.AI platform calculates ESG scores based on industry standards and best practices:

- **Environmental**: Carbon emissions, resource usage, waste management, etc.
- **Social**: Employee welfare, diversity & inclusion, community impact, etc.
- **Governance**: Board structure, ethics, transparency, risk management, etc.

Overall scores are calculated as percentages, with both performance scores and data sufficiency scores provided.

## Deployment

### Production Build
```bash
npm run build
npm start
# or
yarn build
yarn start
```

### Docker Deployment
```bash
docker build -t blever-ai .
docker run -p 3000:3000 blever-ai
```

## Troubleshooting

Common issues and their solutions:

- **Authentication Errors**: Ensure Clerk keys are correctly configured
- **API Connection Issues**: Verify API URL and network connectivity
- **Document Processing Failures**: Check file formats and sizes

## License

[MIT License](LICENSE)

## Support

For support requests, please contact support@blever.ai or open an issue on GitHub.
