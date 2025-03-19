#!/bin/bash

# Exit on error
set -e

# Colors for output
GREEN=$(printf '\033[32m')
RED=$(printf '\033[31m')
NC=$(printf '\033[0m')

# Function to handle errors
handle_error() {
    printf "\n${RED}Error: Setup failed${NC}\n"
    exit 1
}

# Set up error handling
trap 'handle_error' ERR

printf "${GREEN}Setting up llm canister demo project...${NC}\n"

# Install canister-tools globally
printf "\n${GREEN}Installing canister-tools...${NC}\n"
npm install -g canister-tools

# Install dependencies for frontend and backend
printf "\n${GREEN}Installing dependencies...${NC}\n"
cd src/frontend
npm install

cd ../backend
cargo build

# Generate candid file for backend
printf "\n${GREEN}Generating candid file for backend...${NC}\n"
cd ..
npx generate-did backend

# Generate declarations
printf "\n${GREEN}Generating declarations...${NC}\n"
dfx generate

# Deploy canisters
printf "\n${GREEN}Deploying canisters...${NC}\n"
dfx deploy --playground

printf "\n${GREEN}Setup complete! You can now run 'npm run dev' in the src/frontend directory to start the development server.${NC}\n" 