import LLM "mo:llm";
import Text "mo:base/Text";
import HashMap "mo:base/HashMap";
import Iter "mo:base/Iter";
import Time "mo:base/Time";
import Int "mo:base/Int";
import Debug "mo:base/Debug";
import Array "mo:base/Array";
import Error "mo:base/Error"; 
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
    return "conv-" # timestamp;
  };

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
  public func sendMessage(conversationId: Text, message: Text) : async ?Text {
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
        
        // Format messages for LLM
        var chatMessages : [LLM.ChatMessage] = [];
        for (msg in messagesArray.vals()) {
          let role = switch (msg.role) {
            case "user" { #user };
            case "assistant" { #assistant };
            case "system" { #system_ };
            case _ { #user }; // Default to user for unknown roles
          };
          
          chatMessages := Array.append(chatMessages, [{
            role = role;
            content = msg.content;
          }]);
        };
        
        // Call the native LLM
        try {
          let response = await LLM.chat(#Llama3_1_8B, chatMessages);
          
          // Add the LLM's response to the conversation
          let assistantMessage : Message = {
            role = "assistant";
            content = response;
            timestamp = Time.now();
          };
          
          messagesArray := Array.append(messagesArray, [assistantMessage]);
          
          // Update the conversation in the store
          let updatedConversation : Conversation = {
            id = conversationId;
            messages = messagesArray;
          };
          conversations.put(conversationId, updatedConversation);
          
          // Return the LLM response
          return ?response;
        } catch (e) {
          Debug.print("Error from LLM: " # Error.message(e));
          return null;
        }
      };
    };
  };
  
  // Simple prompt without conversation history
  public func simplePrompt(prompt: Text) : async ?Text {
    try {
      let response = await LLM.prompt(#Llama3_1_8B, prompt);
      return ?response;
    } catch (e) {
      Debug.print("Error from LLM: " # Error.message(e));
      return null;
    }
  };
  
  // Get all messages in a conversation
  public query func getConversation(conversationId: Text) : async ?Conversation {
    return conversations.get(conversationId);
  };
  
  // List all conversation IDs
  public query func listConversations() : async [Text] {
    return Iter.toArray(conversations.keys());
  };
  
  // System Management
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