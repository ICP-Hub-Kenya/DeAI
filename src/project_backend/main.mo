import Blob "mo:base/Blob";
import Cycles "mo:base/ExperimentalCycles";
import Debug "mo:base/Debug";
import Text "mo:base/Text";
import Nat "mo:base/Nat";
import Time "mo:base/Time";
import HashMap "mo:base/HashMap";
import Iter "mo:base/Iter";
import Principal "mo:base/Principal";
import Result "mo:base/Result";
import Error "mo:base/Error";
import Array "mo:base/Array";
import Int "mo:base/Int";
// Import the management canister
import IC "ic:aaaaa-aa";
// Import the Types module
import Types "./Types";

actor LLMIntegration {
  // ===== Types =====

  // Represents a provider configuration for different LLM services
  public type ProviderConfig = {
    endpoint : Text;
    api_key : Text;
    organization : ?Text;
  };

  // Represents different LLM models
  public type Model = {
    #OpenAI;
    #Anthropic;
    #Google;
  };

  // Represents a conversation between a user and the LLM
  public type Conversation = {
    id : Text;
    messages : [Message];
  };
  
  // Represents a single message in a conversation
  public type Message = {
    role : Text; // "user" or "assistant"
    content : Text;
    timestamp : Int;
  };

  // Represents an LLM response
  public type LLMResponse = {
    text : Text;
    model : Model;
    input_tokens : Nat;
    output_tokens : Nat;
    total_tokens : Nat;
    finish_reason : Text;
    function_call : ?Text;
  };

  // ===== State =====
  
  // Store LLM Provider configurations
  private let LLM_PROVIDERS = HashMap.HashMap<Model, ProviderConfig>(
    3, 
    func(a, b) { a == b }, 
    func(model) { 
      switch (model) { 
        case (#OpenAI) { 0 }; 
        case (#Anthropic) { 1 }; 
        case (#Google) { 2 }; 
      }
    }
  );

  // Store conversations by ID
  private stable var conversationsEntries : [(Text, Conversation)] = [];
  private var conversations = HashMap.HashMap<Text, Conversation>(
    10, Text.equal, Text.hash
  );

  // Initialize provider configurations
  public func initializeProviders() : async () {
    LLM_PROVIDERS.put(
      #OpenAI, 
      {
        endpoint = "https://api.openai.com/v1/chat/completions";
        api_key = "your-openai-api-key";
        organization = ?"your-org-id";
      }
    );

    LLM_PROVIDERS.put(
      #Anthropic, 
      {
        endpoint = "https://api.anthropic.com/v1/messages";
        api_key = "your-anthropic-api-key";
        organization = null;
      }
    );
  };

  // ===== Helper Functions =====
  
  // Generate a simple ID for a new conversation
  private func generateId() : Text {
    let timestamp = Int.toText(Time.now());
    return "conv-" # timestamp;
  };
  
  // Format messages for API request
  private func formatMessagesForAPI(messages : [Message]) : Text {
    var formattedMessages = "[";
    label l for (i in Iter.range(0, messages.size() - 1)) {
      formattedMessages #= "{\"role\": \"" # messages[i].role # 
                            "\", \"content\": \"" # messages[i].content # "\"}";
      if (i < messages.size() - 1) {
        formattedMessages #= ", ";
      };
    };
    formattedMessages #= "]";
    return formattedMessages;
  };

  // Transform function for HTTP response processing
  public query func transform(args : Types.TransformArgs) : async IC.http_request_result {
    {
      status = args.response.status;
      body = args.response.body;
      headers = [];
    }
  };
  
  // ===== LLM Integration =====
  
  private func callLLMProvider<system>(
    model : Model,
    messages : [Message],
    temperature : ?Float,
    max_tokens : ?Nat
  ) : async Result.Result<LLMResponse, Text> {
    // Retrieve provider configuration
    let providerConfig = switch (LLM_PROVIDERS.get(model)) {
      case (null) { 
        return #err("Unsupported model: " # debug_show(model));
      };
      case (?config) { config };
    };

    // Prepare request body
    let requestBody = "{" #
      "\"model\": \"gpt-3.5-turbo\", " #
      "\"messages\": " # formatMessagesForAPI(messages) # 
      (switch (temperature) {
        case (null) { "" };
        case (?temp) { ", \"temperature\": " # debug_show(temp) };
      }) #
      (switch (max_tokens) {
        case (null) { "" };
        case (?tokens) { ", \"max_tokens\": " # Nat.toText(tokens) };
      }) #
    "}";

    // Prepare HTTP request for IC management canister
    let request = {
      url = providerConfig.endpoint;
      max_response_bytes = null;
      headers = Array.append(
        [
          { name = "Content-Type"; value = "application/json" },
          { name = "Authorization"; value = "Bearer " # providerConfig.api_key }
        ],
        switch (providerConfig.organization) {
          case (null) { [] };
          case (?org) { [{ name = "OpenAI-Organization"; value = org }] };
        }
      );
      body = ?Text.encodeUtf8(requestBody);
      method = #post;
      transform = ?{
        function = transform;
        context = Blob.fromArray([]);
      };
    };

    // Add cycles for the HTTP request - fixed with system capability
    Cycles.add<system>(230_850_258_000);

    // Make the API call
    try {
      let http_response = await IC.http_request(request);
      
      if (http_response.status == 200) {
        // Parse response (simplified)
        let responseText = switch (Text.decodeUtf8(http_response.body)) {
          case (null) { "No response" };
          case (?text) { text };
        };

        return #ok({
          text = responseText;
          model = model;
          input_tokens = messages.size();
          output_tokens = 10;
          total_tokens = messages.size() + 10;
          finish_reason = "stop";
          function_call = null;
        });
      } else {
        return #err("HTTP Error: " # Nat.toText(http_response.status));
      }
    } catch (e) {
      return #err("Request failed: " # Error.message(e));
    };
  };

  // ===== Public API =====
  
  // Create a new conversation
  public func createConversation() : async Text {
    let id = generateId();
    let newConversation : Conversation = {
      id = id;
      messages = [];
    };
    conversations.put(id, newConversation);
    return id;
  };
  
  // Send a message to the LLM and get a response
  public func sendMessage<system>(conversationId: Text, message: Text) : async ?LLMResponse {
    switch (conversations.get(conversationId)) {
      case (null) {
        Debug.print("Conversation not found: " # conversationId);
        return null;
      };
      case (?conversation) {
        // Add user message to the conversation
        let userMessage : Message = {
          role = "user";
          content = message;
          timestamp = Time.now();
        };
        
        var messagesArray : [Message] = Array.tabulate<Message>(
          conversation.messages.size() + 1,
          func(i : Nat) : Message {
            if (i < conversation.messages.size()) {
              conversation.messages[i]
            } else {
              userMessage
            }
          }
        );
        
        // Call the LLM provider function with OpenAI model as an example
        let llmResponseResult = await callLLMProvider<system>(#OpenAI, messagesArray, null, null);
        
        switch (llmResponseResult) {
          case (#ok(response)) {
            // Add the LLM's response to the conversation
            let assistantMessage : Message = {
              role = "assistant";
              content = response.text;
              timestamp = Time.now();
            };
            
            messagesArray := Array.tabulate<Message>(
              messagesArray.size() + 1,
              func(i : Nat) : Message {
                if (i < messagesArray.size()) {
                  messagesArray[i]
                } else {
                  assistantMessage
                }
              }
            );
            
            // Update the conversation in the store
            let updatedConversation : Conversation = {
              id = conversationId;
              messages = messagesArray;
            };
            conversations.put(conversationId, updatedConversation);
            
            // Return the LLM response
            return ?response;
          };
          case (#err(errorMessage)) {
            Debug.print("Error from LLM provider: " # errorMessage);
            return null;
          };
        }
      };
    };
  };
  
  // Get all messages in a conversation
  public query func getConversation(conversationId: Text) : async ?Conversation {
    return conversations.get(conversationId);
  };
  
  // List all conversation IDs
  public query func listConversations() : async [Text] {
    return Iter.toArray(conversations.keys());
  };
  
  // Alternative implementation: simple prompt without maintaining conversation history
  public func simplePrompt<system>(prompt: Text) : async Result.Result<LLMResponse, Text> {
    let message : Message = {
      role = "user";
      content = prompt;
      timestamp = Time.now();
    };
    
    return await callLLMProvider<system>(#OpenAI, [message], null, null);
  };
  
  // ===== System Management =====
  
  // Required for stable memory when upgrading the canister
  system func preupgrade() {
    conversationsEntries := Iter.toArray(conversations.entries());
  };
  
  system func postupgrade() {
    conversations := HashMap.fromIter<Text, Conversation>(
      conversationsEntries.vals(), 
      conversationsEntries.size(),
      Text.equal,
      Text.hash
    );
    conversationsEntries := [];
  };

  // Initialize providers on deployment
  public func initCanister() : async () {
    await initializeProviders();
  }; 
}