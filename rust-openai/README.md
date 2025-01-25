# Tutorial: Building DeAI with ICP HTTP Outcalls 

## Introduction to DeAI with HTTP Outcalls: 
The most basic form of decentralized AI involves smart contracts making HTTP requests to Web2 AI services. While not fully decentralized, this approach leverages ICP's unique HTTP outcalls feature to bridge traditional AI services with on-chain logic. 

## Understanding HTTP Outcalls in ICP: 
ICP canisters can make HTTPS requests to external services, enabling integration with Web2 APIs. This feature is crucial for:

- Accessing AI models without hosting them on-chain
- Maintaining flexibility with different AI providers
- Reducing computational load on the canister

Check out full documentation on [HTTPs outcalls](https://internetcomputer.org/docs/current/developer-docs/smart-contracts/advanced-features/https-outcalls/https-outcalls-overview)

## Why Use a Proxy?
Direct calls from ICP canisters to OpenAI's API present several challenges:

1. Rate limiting and API key management
2. Response transformation and error handling
3. Security of API credentials
4. CORS and request formatting

Our solution uses a Supabase Edge Function as a proxy to:

- Securely store API keys
- Handle request/response formatting
- Manage rate limiting
- Add additional security layers
