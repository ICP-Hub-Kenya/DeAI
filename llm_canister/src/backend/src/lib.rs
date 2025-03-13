use candid::CandidType;
use ic_llm::{Model, ChatMessage, Role};

// Simple Q&A functionality
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

// Direct prompt example
#[ic_cdk::update]
async fn quick_prompt(prompt: String) -> String {
    ic_llm::prompt(Model::Llama3_1_8B, prompt).await
}

// Simple Project Generator
#[derive(CandidType)]
pub struct SimpleProject {
    canister_code: String,
    dfx_json: String,
    readme: String,
}

#[ic_cdk::update]
async fn generate_simple_project(name: String, description: String, language: String) -> SimpleProject {
    // Generate main canister code
    let code_prompt = format!(
        "Generate a simple {} canister named '{}' that {}. Include basic CRUD operations.",
        language, name, description
    );
    let canister_code = ic_llm::prompt(Model::Llama3_1_8B, code_prompt).await;

    // Generate dfx.json
    let dfx_prompt = format!(
        "Create a basic dfx.json configuration for a canister named '{}'",
        name
    );
    let dfx_json = ic_llm::prompt(Model::Llama3_1_8B, dfx_prompt).await;

    // Generate README
    let readme_prompt = format!(
        "Write a simple README.md for a project named '{}' that {}",
        name, description
    );
    let readme = ic_llm::prompt(Model::Llama3_1_8B, readme_prompt).await;

    SimpleProject {
        canister_code,
        dfx_json,
        readme,
    }
}

// Example templates
#[ic_cdk::query]
fn get_project_examples() -> Vec<String> {
    vec![
        "Counter: A simple counter canister with increment and get functions".to_string(),
        "Todo List: Basic todo list with add, remove, and list tasks".to_string(),
        "Profile: User profile storage with update and get methods".to_string(),
    ]
}

ic_cdk::export_candid!();
