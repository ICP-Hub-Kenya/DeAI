# How to Interact with Your Native LLM Canister

Now that your canister is deployed, here's how you can interact with it:

## Using the Command Line (dfx)

### 1. Create a New Conversation
```bash
dfx canister call project_backend createConversation
```
This will return a conversation ID like:
```
("conv-1742936339203057900")
```
Save this ID for future interactions.

### 2. Send a Message in a Conversation
```bash
dfx canister call project_backend sendMessage '("your-conversation-id", "Tell me about the Internet Computer")'
```
Replace "your-conversation-id" with the ID you received from `createConversation`.

**Example**:
```bash
dfx canister call project_backend sendMessage '("conv-1742936339203057900", "What is ICP?")'
```
This will return the LLM's response:
```
(opt "ICP (Internet Computer Protocol) is a blockchain-based platform...")
```

### 3. Use Simple Prompt (Without Conversation History)
For a one-off interaction:
```bash
dfx canister call project_backend simplePrompt '("What is the Internet Computer?")'
```

### 4. View Conversation History
```bash
dfx canister call project_backend getConversation '("your-conversation-id")'
```

### 5. List All Conversations
```bash
dfx canister call project_backend listConversations
```

## Using the Candid UI
You can also interact with your canister through the Candid web interface:
Open the URL provided in your deployment output:
```
http://127.0.0.1:4943/?canisterId=gx2xg-kmaaa-aaaaa-qaasq-cai&id=gq3rs-huaaa-aaaaa-qaasa-cai
```
This will open the Candid UI where you can:
- Call the `createConversation` method
- Use the `sendMessage` method with your conversation ID and prompt
- Try the `simplePrompt` method for quick interactions
- View conversations with `getConversation`

The Candid UI provides a user-friendly interface for testing your canister's functionality.

## Example Workflow
1. Create a conversation:
```bash
dfx canister call project_backend createConversation
```
**Response**: 
```
("conv-1742937000000000000")
```

2. Send a message:
```bash
dfx canister call project_backend sendMessage '("conv-1742937000000000000", "What is the Internet Computer?")'
```
**Response**: 
```
(opt "The Internet Computer is a blockchain project developed by the DFINITY Foundation...")
```

3. Continue the conversation:
```bash
dfx canister call project_backend sendMessage '("conv-1742937000000000000", "What programming languages can I use on it?")'
```
**Response**: 
```
(opt "You can use several programming languages on the Internet Computer, including Motoko, Rust, JavaScript (via Azle), Python (via Kybra), and more...")
```

4. View the conversation history:
```bash
dfx canister call project_backend getConversation '("conv-1742937000000000000")'
```

The native LLM integration provides a much simpler and more reliable way to interact with LLMs on the Internet Computer compared to making HTTP outcalls to external APIs.
