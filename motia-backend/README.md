# Motia Backend Configuration

## Environment Variables

Create a `.env` file in the `motia-backend` directory with the following variables:

```bash
# Database
DATABASE_URL=your_neon_database_url_here

# AI Provider
GOOGLE_GENERATIVE_AI_API_KEY=your_google_api_key_here

# Motia API Key
MOTIA_API_KEY=motia-NTE4YjgyMDAtZjEwYy00YjEzLWExNzUt

# Server Configuration
PORT=3001
NODE_ENV=development
```

## Installation

```bash
cd motia-backend
npm install
```

## Running the Backend

```bash
npm run dev
```

This will start the Motia backend on `http://localhost:3001`.

## Deploying to Cloud

To deploy the Motia backend to the cloud using the Motia CLI:

```bash
# Install Motia CLI globally
npm install -g motia

# Login with your API key
motia login --api-key motia-NTE4YjgyMDAtZjEwYy00YjEzLWExNzUt

# Deploy to cloud
motia deploy
```
