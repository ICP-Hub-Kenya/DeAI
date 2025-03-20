# Motoko LLM Integration Guide for Beginners

This guide will help you understand how to use and extend the LLM integration boilerplate for the Internet Computer Platform (ICP) using Motoko.

## Overview

The boilerplate provides a simple framework for integrating Large Language Models (LLMs) with your Motoko canisters. It demonstrates the concepts using a mock LLM implementation that can be replaced with real LLM API calls when you're ready.

The boilerplate allows you to:

1. Create conversations
2. Send messages to an LLM (mock implementation included)
3. Retrieve conversation history
4. Manage multiple conversations

## Prerequisites

- Basic understanding of programming concepts
- [dfx](https://internetcomputer.org/docs/current/developer-docs/setup/install/) installed (the Internet Computer SDK)
- An Internet Computer identity set up

## Project Structure

The boilerplate contains a single Motoko file (`Main.mo`) that defines an actor called `LLMIntegration`. This actor handles all the LLM-related functionality.

## Key Concepts

### 1. Types

The boilerplate defines several types:

- `Prompt`: Represents a prompt to send to an LLM
- `LLMResponse`: Represents the response from an LLM
- `Conversation`: Represents a conversation (a series of messages)
- `Message`: Represents a single message in a conversation with timestamp

### 2. State Management

The canister maintains state using a HashMap to store conversations:

```motoko
private var conversations = HashMap.HashMap<Text, Conversation>(
  0, Text.equal, Text.hash
);
```

### 3. Mock LLM Implementation

Since actual HTTP outcalls require additional setup, the boilerplate includes a mock LLM implementation:

```motoko
private func mockLLMResponse(prompt: Text) : Text {
  // Simple pattern matching on the prompt content
  let promptLower = Text.toLowercase(prompt);
  
  if (Text.contains(promptLower, #text "hello")) {
    return "Hello! I'm a mock LLM. How can I help you today?";
  } else if (Text.contains(promptLower, #text "motoko")) {
    return "Motoko is a programming language...";
  }
  // ...
}
```

## How to Use the Boilerplate

### 1. Create a New Project

```bash
# Initialize a new project
dfx new project
cd project
```

### 2. Replace the Default Main.mo

Replace the default `src/project_backend/main.mo` with the boilerplate code.

### 3. Deploy the Canister

```bash
# Start the local Internet Computer replica
dfx start --background

# Deploy your canister
dfx deploy
```

### 4. Interact with the Canister

```bash
# Create a new conversation
dfx canister call  project_backend createConversation
# This will return a conversation ID, e.g., "conv-1679012345678900000"

# Send a message (replace CONVERSATION_ID with the ID returned above)
dfx canister call project_backend sendMessage '("conv-1679012345678900000", "Tell me about Motoko")'

# Get conversation history
dfx canister call project_backend getConversation '("conv-1679012345678900000")'

# Use the simple prompt function (doesn't maintain conversation history)
dfx canister call project_backend simplePrompt '("What is the Internet Computer?")'
```

## Real LLM Integration

To implement real LLM integration, you'll need to:

1. Set up HTTP outcalls capability for your canister
2. Replace the `mockLLMResponse` function with actual HTTP requests

### Setting Up HTTP Outcalls

First, you need to configure your canister to allow HTTP outcalls in your `dfx.json`:

```json
{
  "canisters": {
    "llm_integration": {
      "main": "src/project_backend/main.mo",
      "type": "motoko",
      "outcalls": {
        "bindings": ["http_request"]
      }
    }
  }
}
```

### Implementation with HTTP Outcalls

When you're ready to implement real HTTP outcalls to an LLM API, you'll need to:

1. Install the proper HTTP request management library
2. Update your canister to make HTTP requests to your chosen LLM provider
3. Handle the responses properly

Here's a conceptual example of how this might look (not included in the boilerplate):

```motoko
// Example of an HTTP outcall implementation (conceptual - requires additional libraries)
public func callLLMService(prompt: Text) : async Text {
  // Configure your HTTP request to an LLM provider like OpenAI or Anthropic
  let request = {
    url = "https://api.openai.com/v1/completions";
    method = "POST";
    headers = [
      { name = "Content-Type"; value = "application/json" },
      { name = "Authorization"; value = "Bearer YOUR_API_KEY" }
    ];
    body = "{\"model\": \"text-davinci-003\", \"prompt\": \"" # prompt # "\", \"max_tokens\": 100}";
  };

  // Make the HTTP request
  let response = await ic.http_request(request);
  
  // Parse the response and extract the generated text
  // This would involve JSON parsing
  return response.body;
}
```

## Best Practices

1. **Stable Memory**: The boilerplate includes `preupgrade` and `postupgrade` functions to handle canister upgrades correctly.
2. **Conversation Management**: Consider implementing methods to delete old conversations to manage memory usage.
3. **Error Handling**: Add robust error handling to deal with potential issues like rate limiting, API errors, etc.
4. **Security**: When implementing real API calls, store API keys securely and consider using Principal-based authentication.
5. **Testing**: Write tests for your canister using the dfx testing framework.

## Extending the Boilerplate

### 1. Add User Authentication

```motoko
// Track which conversations belong to which users
private var userConversations = HashMap.HashMap<Principal, [Text]>(
  0, Principal.equal, Principal.hash
);

// Create a conversation tied to a specific user
public shared(msg) func createUserConversation() : async Text {
  let user = msg.caller;
  let conversationId = await createConversation();
  
  switch (userConversations.get(user)) {
    case (null) {
      userConversations.put(user, [conversationId]);
    };
    case (?conversations) {
      let newConversations = Array.append(conversations, [conversationId]);
      userConversations.put(user, newConversations);
    };
  };
  
  return conversationId;
}
```

### 2. Implement a Token Counter

```motoko
// Simple token counter (very basic implementation)
func countTokens(text: Text) : Nat {
  // In a real implementation, you'd use a proper tokenization algorithm
  // This is just a simple approximation (counting words)
  let words = Text.split(text, #char ' ');
  return Iter.size(words);
}
```

### 3. Add Rate Limiting

```motoko
// Track requests per user
private var userRequests = HashMap.HashMap<Principal, Nat>(
  0, Principal.equal, Principal.hash
);

// Check if a user has exceeded their rate limit
public shared(msg) func checkRateLimit() : async Bool {
  let user = msg.caller;
  
  switch (userRequests.get(user)) {
    case (null) { return true }; // No requests yet
    case (?count) {
      if (count > 100) { // Arbitrary limit
        return false; // Rate limited
      } else {
        return true; // Under limit
      };
    };
  };
}
```

## Further Learning

- [Motoko Programming Language Documentation](https://internetcomputer.org/docs/current/developer-docs/build/cdks/motoko-dfinity/motoko/)
- [Internet Computer HTTP Outcalls Documentation](https://internetcomputer.org/docs/current/developer-docs/build/cdks/motoko-dfinity/outgoing-http-calls/)
- [DFINITY Examples Repository](https://github.com/dfinity/examples)
- [Internet Computer Developer Forum](https://forum.dfinity.org/)