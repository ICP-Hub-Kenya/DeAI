# Examples on how to use the LLM Canister with ICP Ninja

## 📑 Table of Contents
1. [Introduction to ICP Ninja](#introduction-to-icp-ninja)
2. [Introduction to LLM Canister](#introduction-to-llm-canister)
3. [Create an LLM Chatbot using ICP Ninja & LLM Canister](#create-an-llm-chatbot-using-icp-ninja--llm-canister)
4. [(Showcase) lookup agent using LLM Canister](#(Showcase)-lookup-agent-using-llm-canister)

# Introduction to ICP Ninja 

> ICP Ninja is a Web Based development environment that is designed to simplify the creation and deployment of applications on ICP

It will help developers who want to quickluy get started with building on ICP, without going through the whole process of complex setups 

## What is ICP Ninja: 
[ICP Ninja](https://icp.ninja) is a browser based IDE (Intergrated Development Environment) that allows someone to: 
* Directly build and deplpy ICP canisters directly from the web browser 
* Develop applications without downloading the canister development kit (CDK), create a developer identity, or acquire cycles
* Access project templates that show ICP's unique capabilities 
* Deploy projects with a simple click of a button 

📝 Check out the official article [here](https://medium.com/dfinity/enhancing-icp-dapp-development-using-icp-ninja-ai-11d5dad408ef#6423)

## ✨ Key features: 
ICP Ninja has these key features: 
1. **Easy Deployment**: Select a template project and click "Deploy" to get your application running on the mainnet
2. **Multiple language support**: Develop in Motoko, Rust, and (in pipeline) Typescript & Python
3. **AI Learning Assistant**: get help with code explanation, fixing and optimization from AI assistant trained on the documentation 
4. **Project Sharing**: Share whatever projects you've made with others via direct links, or export to GitHub 
5. **Authentication Options:** Log in with [internet identity](https://internetcomputer.org/internet-identity) or [Github](https://github.com/) to save your progress
6. **Developer Tools:** Access canister logging, live project compilation logs, and a professional code editor

## 🚀 Getting started & How to use ICP Ninja: 
1. **Access the platform**: Visit [icp.ninja](https://icp.ninja)

![icpninja](./images/icpninja.png)

2. **Choose a project**: Select from example templates or start a new project

### Create a new project and start from scratch 

![newproject](./images/createproject.png)

* Select the project type: whether fullstack, backend only or frontend only 
* Select the backend language, currently supported ones are motoko and rust only 
* Click on "Create Project" to get started

**OR**

From the example templates, click on the project you want to use.
![chooseproject](./images/exampleproject.png)

For my case I've choosen LLM Chatbot 

![llmchatbot](./images/llmchatbot.png)

* I will then select my preferred language, motoko or rust
* Then check out the 13 steps that serve as an introduction to make you familiar with the online IDE. Go through them keenly to understand the editor and utilize the different features present. 

> **Note**: Deployed projects remain active for 20 minutes but can be redeployed as needed. For long-term development, you'll want to migrate to a local environment.

Now that we have an understanding of ICP Ninja, let's proceed to create an LLM Chatbot using ICP Ninja and the LLM Canister. 

# Create an LLM Chatbot using ICP Ninja & LLM Canister 

## Section 1: Introduction to LLM Canister: 

LLMs can now be accessed directly from a canister with just a few lines of code. This guide will help you understand how it works and get started quickly.

### 🔄 How does it work?

The LLM Canister system uses "AI Workers" to process prompts efficiently and securely.

**AI Workers:** These are stateless nodes that are set up for the sole purpose of processing LLM prompts.

### 📊 System Architecture Flow

```mermaid
sequenceDiagram
    participant C as Your Canister
    participant L as LLM Canister
    participant W as AI Workers
    
    C->>L: 1. Send prompt
    Note over L: 2. Store in queue
    W->>L: 3. Poll for prompts
    L->>W: 4. Send prompt
    Note over W: 5. Process prompt
    W->>L: 6. Return response
    L->>C: 7. Send response
```

### 🔍 Process Overview:
1. Your canister sends prompts to the LLM canister
2. LLM Canister queues the prompts
3. AI Workers continuously check for new prompts
4. AI Workers process the prompts using Llama 3.1 8B
5. Responses are returned to the LLM Canister
6. Your canister receives the processed result

## 💻 Quick Start

### Rust Example
```rust
use ic_llm::Model;

// Simple prompt
ic_llm::prompt(Model::Llama3_1_8B, "What's the speed of light?").await;

// Chat with multiple messages: when you want your model to maintain context accross multiple messages e.g chat message or when simulating a conversation
use ic_llm::{ChatMessage, Role};

ic_llm::chat(
    Model::Llama3_1_8B,
    vec![
        ChatMessage {
            role: Role::System, // System sets the context behaviour of the model
            content: "You are a helpful assistant".to_string(),
        },
        ChatMessage {
            role: Role::User, // This represents the user's inputs
            content: "How big is the sun?".to_string(),
        },
    ],
).await;
```

### Motoko Example
```motoko
import LLM "mo:llm";
// Simple prompt
await LLM.prompt(#Llama3_1_8B, "What's the speed of light?");

// Chat with multiple messages
await LLM.chat(#Llama3_1_8B, [
  {
    role = #system_;
    content = "You are a helpful assistant.";
  },
  {
    role = #user;
    content = "How big is the sun?";
  }
]);
```

## ℹ️ Important Details

### Current Status
- LLM Canister Principal: `w36hm-eqaaa-aaaal-qr76a-cai`
- The LLM Canister is currently controlled by the DFINITY team (until stability is achieved)
- AI Workers are managed by the DFINITY team
- Service is currently free to use

### 📚 Libraries
1. [Rust Library](https://docs.rs/ic-llm/latest/ic_llm/)
2. [Motoko Library](https://mops.one/llm)

### ⚠️ Limitations
1. **Model Support:**
   - Currently only Llama 3.1 8B model is supported
   - More models planned based on community feedback

2. **Request Constraints:**
   - Maximum 10 messages per chat request
   - Prompt length across all messages cannot exceed `10kiB`
   - Output is limited to `200` tokens

### 🔒 Privacy Considerations
- Prompts are not completely private
- AI Worker operators can theoretically see prompts
- User identity remains anonymous
- DFINITY only logs aggregate metrics (request counts, token usage)

## 🔮 Future Developments
1. **Latency Improvements:**
   - Working on reducing end-to-end request time
   - Exploring non-replicated mode for faster response

2. **Decentralization Plans:**
   - Moving towards decentralized AI worker deployment
   - Exploring "badlands" concept for permissionless worker operation

## Section 2: Create a chatbot on ICP Ninja using LLM Canister: 

We'll go to [icp.ninja](https://icp.ninja), go to the **fork a project** section and click on the **LLM chatbot** project.

![example projects](./images/exampleproject.png)

![llm chatbot](./images/llmchatbot.png)

We'll then select our preferred language, in this case we'll be using **motoko**

This is what we'll see after opening the project: 
![Motoko llm chatbot](./images/motokollmchatbot.png)

### 📁 Project Structure:
We have two main folders, the **backend**  and **frontend** folders
- The **backend** folder contains the **motoko canister** located in the **app.mo** file.
- The **frontend** folder contains the code for the chatbot interface, which is responsible for displaying the chat messages and handling the user input.
- You can Edit the **mops.toml** file to add Motoko dependencies to the project.

We can now click on the deploy button on the top right corner to **deploy** the project on mainnet playground. This is more of the testnet version of icp mainnet. The project will only be available via the generated link for 20 minutes. 

Once deployed, this is what you'll see in the terminal 
![deployed project](./images/deployurls.png)

The UI (both backend and frontend) are available in the right section of the IDE 
![UI](./images/ui.png)

You can now start editing the backend and frontend code to build your project

### 🤖 Create a simple llm chatbot: 

You can now edit your **app.mo** code to use a system prompt: 
```motoko 
public func chat(messages : [LLM.ChatMessage]) : async Text {
    await LLM.chat(#Llama3_1_8B, [
       {
        role = #system_;
        content = "You are a helpful assistant that is very knowledgable in develping canisters and dApps on Internet Computer";
      }, 
      // We need to properly format the user messages
      // This assumes the last message is what we want to send
      {
        role = #user; 
        content = messages[messages.size() - 1].content; 
      }
    ]);
  };
```

You can now re-deploy your project and test the new changes. Try out the prompt: `Hi there, how can you assist me?` and evaluate the response you'll get from the chatbot.

### 🤝 Using the inbuilt **Ask AI** feature: 
You can now directly "vibe code" with the AI Assistant provided for you 

Highlight on the section you'd want to make a change, `right click` on it or `ctrl + right click` and select each of the different options: 
Ask AI: `Explain, fix, improve or modify`
![askai](./images/askai.png)

Click on `modify` give it a prompt like `Add a dark theme to the chatbot`

![modify](./images/modify.png)

And you can see it made all the modifications: 
![dark chatbot](./images/darkchatbot.png)

### 📤 Exporting your code to github: 
Once you're done with creating your project, you'll need to export it to GitHub to collaborate with your colleagues and share your work.

Click on the `export` button in the top right corner of the IDE 

Log in with GitHub, and once it's done you'll see the link to your project returned 

And that's all you need to start your project! 

## ``(Showcase)`` Lookup Agent using LLM Canister

Beyond a basic chat bot, the `llm canister` can also be used to create an `autonomous AI Agent` that can reason and act — in this case, to ``fetch the price of ICP from the ICP ledger``.

Let's explore how to build a specialized agent that can look up ICP account balances.

![lookup agent](./images/lookup-agent.png)

### What is a Lookup Agent?

A lookup agent is a specialized AI agent that performs a specific task - in this case, looking up ICP account balances. It demonstrates how to:
1. Create a focused AI agent with a specific purpose
2. Integrate with other canisters (like the ICP Ledger)
3. Process and validate user inputs
4. Handle complex workflows with the LLM

### Step-by-Step Implementation

#### 1. Clone and Setup the Example

First, clone the example repository:

```bash
git clone https://github.com/dfinity/llm.git
cd llm/examples/icp-lookup-agent-rust
```

#### 2. Deployment Options

You have two options for deploying the lookup agent:

##### Option A: Local Deployment with Ollama (Recommended)

This option gives you more control and better performance:

1. Install Ollama from [ollama.com](https://ollama.com/)
2. Start the Ollama server:
   ```bash
   ollama serve
   ```
3. Download the required model:
   ```bash
   ollama run llama3.1:8b
   ```
4. Deploy the canisters:
   ```bash
   dfx start --clean
   dfx deps pull
   dfx deploy
   dfx deps deploy
   ```

Benefits of local deployment:
- Faster response times
- No rate limiting
- Full control over the LLM model
- Better for development and testing
- Can customize model parameters

##### Option B: Playground Deployment

For quick testing or demonstrations:

1. Deploy to the playground:
   ```bash
   dfx deploy --playground
   ```

Limitations of playground deployment:
- Slower response times due to shared resources
- Rate limiting may apply
- Limited control over model parameters
- Best for quick demos or testing

#### 3. Understanding the Code

The example implements a lookup agent that can check ICP account balances. Here's how it works:

1. **System Prompt**: The agent uses a specialized system prompt that defines its behavior:
   ```rust
   const SYSTEM_PROMPT: &str = "You are an assistant that specializes in looking up the balance of ICP accounts...";
   ```

2. **Account Lookup**: The agent can query the ICP Ledger canister to get account balances:
   ```rust
   async fn lookup_account(account: &str) -> String {
       // Validates and looks up account balance
   }
   ```

3. **Chat Interface**: The main chat function processes user messages and handles the lookup workflow:
   ```rust
   #[ic_cdk::update]
   async fn chat(messages: Vec<ChatMessage>) -> String {
       // Processes messages and performs lookups
   }
   ```

#### 4. Testing the Agent

Once deployed, you can test the agent with various inputs:

1. **Valid Account Lookup**:
   ```
   User: "What's the balance of 1234567890abcdef1234567890abcdef1234567890abcdef1234567890abcdef?"
   Agent: "Balance of 1234567890abcdef1234567890abcdef1234567890abcdef1234567890abcdef is X ICP"
   ```

2. **Invalid Input**:
   ```
   User: "What's my balance?"
   Agent: "Please provide an ICP account (64-character hexadecimal string)."
   ```

3. **General Questions**:
   ```
   User: "What can you do?"
   Agent: "I am an agent specializing in looking up ICP balances. You can give me an ICP account and I can look up its balance."
   ```

### Key Features

1. **Specialized Functionality**: The agent is focused on one task - looking up ICP balances
2. **Input Validation**: Ensures proper account format before making ledger calls
3. **Clear Communication**: Provides helpful guidance for invalid inputs
4. **Integration**: Seamlessly works with the ICP Ledger canister
5. **Error Handling**: Gracefully handles invalid accounts and failed lookups

### Best Practices

1. **Clear System Prompt**: Define explicit rules and behaviors
2. **Input Validation**: Always validate user input before processing
3. **Error Handling**: Provide clear error messages
4. **Integration Testing**: Test with various input scenarios
5. **Documentation**: Maintain clear documentation of the agent's capabilities

This example demonstrates how to create a focused, task-specific AI agent on the Internet Computer. You can use this pattern to build other specialized agents for different purposes.

You can check out the official repository for the different examples on how to use the llm canister [here](https://github.com/dfinity/llm)