import LLM "mo:llm";
import Text "mo:base/Text";
import HashMap "mo:base/HashMap";
import Iter "mo:base/Iter";
import Time "mo:base/Time";
import Int "mo:base/Int";
import Debug "mo:base/Debug";
import Array "mo:base/Array";
import Error "mo:base/Error"; 
import Nat "mo:base/Nat";
actor NativeLLMIntegration {
  // Types
  public type Conversation = {
    id : Text;
    messages : [Message];
  };
  
  public type Message = {
    role : Text; // "user" or "assistant"
    content : Text;
    timestamp : Int;
  };

  // State
  private stable var conversationsEntries : [(Text, Conversation)] = [];
  private var conversations = HashMap.HashMap<Text, Conversation>(
    10, Text.equal, Text.hash
  );

  // Generate a simple ID for a new conversation
  private func generateId() : Text {
    let timestamp = Int.toText(Time.now());
    Debug.print("Generating new conversation ID: conv-" # timestamp);
    return "conv-" # timestamp;
  };

  // Create a new conversation
  public func createConversation() : async Text {
    Debug.print("Creating new conversation");
    let id = generateId();
    let newConversation : Conversation = {
      id = id;
      messages = [];
    };
    conversations.put(id, newConversation);
    Debug.print("Created conversation with ID: " # id);
    return id;
  };
  
  // Send a message to the LLM and get a response
  public func sendMessage(conversationId: Text, message: Text) : async ?Text {
    Debug.print("Received message request for conversation: " # conversationId);
    Debug.print("Message content: " # message);
    
    switch (conversations.get(conversationId)) {
      case (null) {
        Debug.print("Conversation not found: " # conversationId);
        return null;
      };
      case (?conversation) {
        Debug.print("Found conversation. Current message count: " # Nat.toText(conversation.messages.size()));
        
        // Add user message to the conversation
        let userMessage : Message = {
          role = "user";
          content = message;
          timestamp = Time.now();
        };
        
        Debug.print("Created user message with timestamp: " # Int.toText(userMessage.timestamp));
        
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
        
        Debug.print("Updated messages array. New size: " # Nat.toText(messagesArray.size()));
        
        // Format messages for LLM
        var chatMessages : [LLM.ChatMessage] = [];
        Debug.print("Formatting messages for LLM chat");
        
        for (msg in messagesArray.vals()) {
          Debug.print("Processing message with role: " # msg.role);
          let role = switch (msg.role) {
            case "user" { #user };
            case "assistant" { #assistant };
            case "system" { #system_ };
            case _ { 
              Debug.print("Unknown role, defaulting to user: " # msg.role);
              #user 
            };
          };
          
          chatMessages := Array.append(chatMessages, [{
            role = role;
            content = msg.content;
          }]);
        };
        
        Debug.print("Formatted " # Nat.toText(chatMessages.size()) # " messages for LLM");
        Debug.print("Calling LLM.chat with Llama3_1_8B model...");
        
        // Call the native LLM
        try {
          Debug.print("Awaiting LLM response...");
          let response = await LLM.chat(#Llama3_1_8B, chatMessages);
          Debug.print("Received LLM response: " # response);
          
          // Add the LLM's response to the conversation
          let assistantMessage : Message = {
            role = "assistant";
            content = response;
            timestamp = Time.now();
          };
          
          Debug.print("Created assistant message with timestamp: " # Int.toText(assistantMessage.timestamp));
          
          messagesArray := Array.append(messagesArray, [assistantMessage]);
          Debug.print("Updated messages array. Final size: " # Nat.toText(messagesArray.size()));
          
          // Update the conversation in the store
          let updatedConversation : Conversation = {
            id = conversationId;
            messages = messagesArray;
          };
          conversations.put(conversationId, updatedConversation);
          Debug.print("Updated conversation in store");
          
          // Return the LLM response
          return ?response;
        } catch (e) {
          let errorMsg = Error.message(e);
          Debug.print("Error from LLM: " # errorMsg);
          Debug.print("Error details: Code = " # debug_show(Error.code(e)));
          return null;
        }
      };
    };
  };
  
  // Simple prompt without conversation history
  public func simplePrompt(prompt: Text) : async ?Text {
    Debug.print("Received simple prompt request: " # prompt);
    Debug.print("Calling LLM.prompt with Llama3_1_8B model...");
    
    try {
      Debug.print("Awaiting LLM response...");
      let response = await LLM.prompt(#Llama3_1_8B, prompt);
      Debug.print("Received LLM response: " # response);
      return ?response;
    } catch (e) {
      let errorMsg = Error.message(e);
      Debug.print("Error from LLM: " # errorMsg);
      Debug.print("Error details: Code = " # debug_show(Error.code(e)));
      return null;
    }
  };
  
  // Get all messages in a conversation
  public query func getConversation(conversationId: Text) : async ?Conversation {
    Debug.print("Getting conversation: " # conversationId);
    let result = conversations.get(conversationId);
    
    switch (result) {
      case (null) { 
        Debug.print("Conversation not found: " # conversationId);
      };
      case (?conversation) {
        Debug.print("Found conversation with " # Nat.toText(conversation.messages.size()) # " messages");
      };
    };
    
    return result;
  };
  
  // List all conversation IDs
  public query func listConversations() : async [Text] {
    let ids = Iter.toArray(conversations.keys());
    Debug.print("Listing " # Nat.toText(ids.size()) # " conversations");
    return ids;
  };
  
  // System Management
  system func preupgrade() {
    Debug.print("Preparing for canister upgrade");
    conversationsEntries := Iter.toArray(conversations.entries());
    Debug.print("Saved " # Nat.toText(conversationsEntries.size()) # " conversations for upgrade");
  };
  
  system func postupgrade() {
    Debug.print("Canister upgrade completed");
    conversations := HashMap.fromIter<Text, Conversation>(
      conversationsEntries.vals(), 
      conversationsEntries.size(),
      Text.equal,
      Text.hash
    );
    Debug.print("Restored " # Nat.toText(conversations.size()) # " conversations after upgrade");
    conversationsEntries := [];
  };
  
  // Test function to verify LLM is working
  public func testLLM() : async Text {
    Debug.print("Running LLM test function");
    try {
      Debug.print("Attempting simple test prompt to LLM");
      let response = await LLM.prompt(#Llama3_1_8B, "Hello, are you working?");
      Debug.print("LLM test successful! Response: " # response);
      return "LLM is working! Response: " # response;
    } catch (e) {
      let errorMsg = Error.message(e);
      Debug.print("LLM test failed with error: " # errorMsg);
      return "LLM test failed: " # errorMsg;
    }
  };
}