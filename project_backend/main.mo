// Main.mo
// A simple LLM integration example for Motoko beginners

import Debug "mo:base/Debug";
import Text "mo:base/Text";
import Nat "mo:base/Nat";
import Int "mo:base/Int";
import Array "mo:base/Array";
import HashMap "mo:base/HashMap";
import Iter "mo:base/Iter";
import Time "mo:base/Time";
import Principal "mo:base/Principal";
import Buffer "mo:base/Buffer";

// This canister demonstrates how to integrate with an external LLM service
// using Motoko on the Internet Computer Platform (ICP)
actor LLMIntegration {

  // ===== Types =====

  // Represents a prompt to be sent to an LLM
  public type Prompt = {
    text: Text;
    maxTokens: Nat;
    temperature: Float;
  };

  // Represents a response received from an LLM
  public type LLMResponse = {
    generatedText: Text;
    promptTokens: Nat;
    completionTokens: Nat;
    totalTokens: Nat;
  };
  
  // Represents a conversation between a user and the LLM
  public type Conversation = {
    id: Text;
    messages: [Message];
  };
  
  // Represents a single message in a conversation
  public type Message = {
    role: Text; // "user" or "assistant"
    content: Text;
    timestamp: Int;
  };

  // ===== State =====
  
  // Store conversations by ID
  private stable var conversationsEntries : [(Text, Conversation)] = [];
  private var conversations = HashMap.HashMap<Text, Conversation>(
    0, Text.equal, Text.hash
  );

  // ===== Helper Functions =====
  
  // Generate a simple ID for a new conversation
  private func generateId() : Text {
    // In a real application, you'd want a more robust ID generation method
    let timestamp = Int.toText(Time.now());
    return "conv-" # timestamp;
  };
  
  // Format a prompt for the external LLM service
  private func formatPrompt(messages: [Message]) : Text {
    // Simple formatting: just concatenate messages with role labels
    // In a real implementation, you'd format according to your LLM provider's requirements
    var formattedPrompt = "";
    for (msg in messages.vals()) {
      formattedPrompt #= msg.role # ": " # msg.content # "\n";
    };
    return formattedPrompt;
  };
  
  // Parse LLM response 
  // Note: This is a simplified mock implementation
  private func parseLLMResponse(rawResponse: Text) : LLMResponse {
    // In a real implementation, you would parse the JSON from your LLM provider
    // This is a mock implementation
    return {
      generatedText = rawResponse;
      promptTokens = 10; // Mock value
      completionTokens = 20; // Mock value
      totalTokens = 30; // Mock value
    };
  };
  
  // ===== LLM Integration (Mock) =====
  
  // Mock LLM response generation
  // In a real application, this would be replaced with an HTTP outcall to an LLM API
  private func mockLLMResponse(prompt: Text) : Text {
    // This is a very simple mock implementation
    // In a real application, you would make an HTTP outcall to an LLM API
    
    let promptLower = Text.toLowercase(prompt);
    
    if (Text.contains(promptLower, #text "hello") or Text.contains(promptLower, #text "hi")) {
      return "Hello! I'm a mock LLM. How can I help you today?";
    } else if (Text.contains(promptLower, #text "motoko")) {
      return "Motoko is a programming language designed for the Internet Computer. It's named after the character Major Motoko Kusanagi from 'Ghost in the Shell'. Motoko offers modern language features like type safety, pattern matching, and automatic memory management.";
    } else if (Text.contains(promptLower, #text "internet computer") or Text.contains(promptLower, #text "icp")) {
      return "The Internet Computer is a blockchain network that provides a platform for running smart contracts (called canisters) and decentralized applications (dapps). It was developed by DFINITY Foundation.";
    } else if (Text.contains(promptLower, #text "dfinity")) {
      return "DFINITY Foundation is the organization behind the Internet Computer Protocol (ICP). They're working to build technology for an open internet.";
    } else {
      return "I'm a simple mock LLM implementation. In a real application, your prompt would be sent to an actual LLM API, and you would receive a more sophisticated response based on your input: \"" # prompt # "\"";
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
  public func sendMessage(conversationId: Text, message: Text) : async ?LLMResponse {
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
        
        // Create a Buffer from the existing messages to make it mutable
        let messagesBuffer = Buffer.Buffer<Message>(conversation.messages.size() + 2);
        for (msg in conversation.messages.vals()) {
          messagesBuffer.add(msg);
        };
        messagesBuffer.add(userMessage);
        
        // Format the entire conversation as a prompt
        let prompt = formatPrompt(Buffer.toArray(messagesBuffer));
        
        // In a real application, this would be an HTTP outcall to an LLM API
        // For this example, we use a mock implementation
        let llmResponseText = mockLLMResponse(prompt);
        
        // Add the LLM's response to the conversation
        let assistantMessage : Message = {
          role = "assistant";
          content = llmResponseText;
          timestamp = Time.now();
        };
        
        messagesBuffer.add(assistantMessage);
        
        // Update the conversation in the store
        let updatedConversation : Conversation = {
          id = conversationId;
          messages = Buffer.toArray(messagesBuffer);
        };
        conversations.put(conversationId, updatedConversation);
        
        // Parse and return the LLM response
        return ?parseLLMResponse(llmResponseText);
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
  
  // Alternative implementation: using a simple prompt/response pattern
  // without maintaining conversation history
  public func simplePrompt(prompt: Text) : async LLMResponse {
    let response = mockLLMResponse(prompt);
    return parseLLMResponse(response);
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
}