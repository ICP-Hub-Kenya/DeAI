# LLM Canister Demo

A demonstration project showing how to integrate ICPs LLM canister in your project. This project includes a simple Q&A interface and a basic project (code) generator.

## Project Structure

```
llm_canister/
├── src/
│   ├── backend/
│   │   └── src/
│   │       └── lib.rs      # Main backend canister code
│   └── frontend/
│       └── src/
│           ├── App.jsx     # React frontend
│           └── App.css     # Styling
```

## Backend Code Explanation

The backend canister (`lib.rs`) demonstrates three main uses of the IC LLM:

### 1. Simple Q&A Functionality
```rust
#[ic_cdk::update]
async fn ask_question(question: String) -> String {
    let messages = vec![
        ChatMessage {
            role: Role::System,
            content: "You are a helpful assistant that specializes in Internet Computer development.".to_string(),
        },
        ChatMessage {
            role: Role::User,
            content: question,
        },
    ];

    ic_llm::chat(Model::Llama3_1_8B, messages).await
}
```
This function:
- Takes a user question as input
- Creates a chat context with system and user messages
- Uses the Llama 3 1.8B model for responses
- Returns the response as a string

### 2. Direct Prompt Usage
```rust
#[ic_cdk::update]
async fn quick_prompt(prompt: String) -> String {
    ic_llm::prompt(Model::Llama3_1_8B, prompt).await
}
```
This demonstrates direct prompting:
- Simpler than chat mode
- Useful for straightforward generations
- No conversation context needed

### 3. Project Generator
```rust
#[derive(CandidType)]
pub struct SimpleProject {
    canister_code: String,
    dfx_json: String,
    readme: String,
}

#[ic_cdk::update]
async fn generate_simple_project(name: String, description: String, language: String) -> SimpleProject {
    // ... generation logic
}
```
The project generator:
- Takes project details as input
- Generates canister code, dfx.json, and README
- Uses specific prompts for each file type
- Cleans and formats the responses

## Setup Instructions

1. **Clone the Repository**
   ```bash
   git clone <repository-url>
   cd llm_canister
   ```

3. **Start Local Network**
   ```bash
   dfx start --clean --background
   ```

4. **Deploy the Canister**
   ```bash
   dfx deploy
   ```

## Using the IC LLM in Your Projects

### 1. Add Dependencies
In your `Cargo.toml`:
```toml
[dependencies]
candid = "0.10"
ic-cdk = "0.17.0"
ic-llm = "0.4.0"
```

### 2. Import Required Types
```rust
use candid::CandidType;
use ic_llm::{Model, ChatMessage, Role};
```

### 3. Create Chat Messages
```rust
let messages = vec![
    ChatMessage {
        role: Role::System,
        content: "System prompt here".to_string(),
    },
    ChatMessage {
        role: Role::User,
        content: "User message here".to_string(),
    },
];
```

### 4. Make LLM Calls
```rust
// Chat mode
let response = ic_llm::chat(Model::Llama3_1_8B, messages).await;

// Direct prompt mode
let response = ic_llm::prompt(Model::Llama3_1_8B, "Your prompt here").await;
```

## Best Practices

1. **Prompt Engineering**
   - Be specific in your prompts
   - Include examples when needed
   - Use system messages to set context

2. **Response Handling**
   - Clean and validate responses
   - Handle markdown and code blocks appropriately
   - Implement error handling

3. **Performance**
   - Keep prompts concise
   - Cache responses when appropriate
   - Consider rate limiting for production use

## Common Issues and Solutions

1. **Response Formatting**
   ```rust
   fn clean_code_response(code: String) -> String {
       code.lines()
           .skip_while(|line| {
               line.is_empty() 
               || line.contains("Here's") 
               || line.contains("```")
           })
           .collect::<Vec<&str>>()
           .join("\n")
           .trim()
           .to_string()
   }
   ```

2. **Error Handling**
   - Implement proper error types
   - Handle network timeouts
   - Validate LLM responses

## Contributing

Feel free to submit issues and enhancement requests!
