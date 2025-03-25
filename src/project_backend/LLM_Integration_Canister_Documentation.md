# LLM Integration Canister Documentation

## Overview
The LLM Integration canister provides a way to:
- Create and manage conversations with LLMs
- Send prompts to LLMs and receive responses
- Store conversation history
- Support multiple LLM providers

## Setup and Deployment

### Prerequisites
- dfx installed
- An Internet Computer identity configured
- API keys for the LLM providers you want to use (OpenAI, Anthropic)

### Deployment Steps
1. Update the API keys in the `initializeProviders` function:
   ```motoko
   public func initializeProviders() : async () {
     LLM_PROVIDERS.put(
       #OpenAI, 
       {
         endpoint = "https://api.openai.com/v1/chat/completions";
         api_key = "your-openai-api-key"; // Replace with your actual API key
         organization = ?"your-org-id";   // Replace with your org ID or set to null
       }
     );

     LLM_PROVIDERS.put(
       #Anthropic, 
       {
         endpoint = "https://api.anthropic.com/v1/messages";
         api_key = "your-anthropic-api-key"; // Replace with your actual API key
         organization = null;
       }
     );
   };
   ```
2. Deploy the canister:
   ```bash
   dfx deploy
   ```
3. Initialize the canister after deployment:
   ```bash
   dfx canister call project_backend initCanister
   ```

## API Reference

### Creating a Conversation
To start a new conversation with an LLM:
```bash
dfx canister call project_backend createConversation
```
This returns a conversation ID that you'll use for subsequent interactions.

### Sending a Message
To send a message to the LLM within a conversation:
```bash
dfx canister call project_backend sendMessage '("conv-123456789", "Tell me about the Internet Computer")'
```
**Parameters**:
- Conversation ID (Text): The ID returned from `createConversation`
- Message (Text): The prompt to send to the LLM

### Getting Conversation History
To retrieve the full history of a conversation:
```bash
dfx canister call project_backend getConversation '("conv-123456789")'
```

### Listing All Conversations
To get a list of all conversation IDs:
```bash
dfx canister call project_backend listConversations
```

### Simple Prompt (Stateless)
For a one-off interaction without maintaining conversation history:
```bash
dfx canister call project_backend simplePrompt '("What is the Internet Computer?")'
```

## Frontend Integration
To integrate with a frontend application, you can use the JavaScript Agent to call the canister methods. Here's an example of how to interact with the canister from a web application:
```javascript
import { Actor, HttpAgent } from "@dfinity/agent";
import { idlFactory } from "./declarations/project_backend/project_backend.did.js";

// Create an agent and actor
const agent = new HttpAgent();
const llmActor = Actor.createActor(idlFactory, {
  agent,
  canisterId: "gq3rs-huaaa-aaaaa-qaasa-cai" // Replace with your canister ID
});

// Create a new conversation
async function createConversation() {
  const conversationId = await llmActor.createConversation();
  console.log("New conversation created:", conversationId);
  return conversationId;
}

// Send a message and get a response
async function sendMessage(conversationId, message) {
  const response = await llmActor.sendMessage(conversationId, message);
  if (response) {
    console.log("LLM response:", response.text);
    return response;
  } else {
    console.error("Failed to get response");
    return null;
  }
}

// Example usage
async function chatExample() {
  const conversationId = await createConversation();
  const response = await sendMessage(conversationId, "Tell me about the Internet Computer");
  
  // Display the response in your UI
  document.getElementById("response").textContent = response.text;
}
```

## Authentication with Internet Identity
To add authentication to your application, you can integrate with Internet Identity. This allows users to authenticate before interacting with the LLM Internet Identity integration.
Here's an example of how to add a login button that interacts with Internet Identity:
```javascript
import { AuthClient } from "@dfinity/auth-client";
import { HttpAgent } from "@dfinity/agent";

const loginButton = document.getElementById("login");
loginButton.onclick = async (e) => {
  e.preventDefault();

  // Create an auth client
  let authClient = await AuthClient.create();

  // Start the login process and wait for it to finish
  await new Promise((resolve) => {
    authClient.login({
      identityProvider: process.env.II_URL,
      onSuccess: resolve,
    });
  });

  // At this point we're authenticated, and we can get the identity from the auth client
  const identity = authClient.getIdentity();
  
  // Using the identity obtained from the auth client, we can create an agent to interact with the IC
  const agent = new HttpAgent({identity});
  
  // Create the actor with the authenticated agent
  const authenticatedActor = Actor.createActor(idlFactory, {
    agent,
    canisterId: "gq3rs-huaaa-aaaaa-qaasa-cai"
  });
  
  // Now you can use authenticatedActor to make calls to the canister
};
```

## Considerations and Limitations
- **Cycles**: HTTP outcalls require cycles. Make sure your canister has sufficient cycles to make external API calls.
- **API Keys**: Keep your API keys secure. In a production environment, consider using more secure methods to manage API keys.
- **Rate Limits**: Be aware of rate limits imposed by LLM providers.
- **Response Parsing**: The current implementation has simplified response parsing. In a production environment, you would want to properly parse the JSON response from the LLM provider.
- **Alternative Approach**: Consider using the native LLM canister on the Internet Computer for a simpler integration:
  ```motoko
  import LLM "mo:llm";
  await LLM.prompt(#Llama3_1_8B, "What's the speed of light?")
  ```

## Troubleshooting
- If you encounter errors related to the system capability, make sure you're using a recent version of the Motoko base library (0.11.0 or later).
- For HTTP outcall errors, check that you have sufficient cycles in your canister.
- If responses are not being parsed correctly, examine the raw response and adjust your parsing logic accordingly.
