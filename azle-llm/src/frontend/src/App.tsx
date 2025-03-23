import { useState, useRef, useEffect } from "react";
import { createActor, canisterId } from "../../declarations/backend";
import { LLMClient, Model } from "icp-llm-client";
import { AnonymousIdentity } from "@dfinity/agent";
import { RiRobot3Fill, RiAiGenerate2 } from "react-icons/ri";
import { IoLogoWechat } from "react-icons/io5";
import { BsFillSendFill, BsTrash } from "react-icons/bs";
import ChatContainer from "./components/ChatContainer";
import { AiOutlineLoading3Quarters } from "react-icons/ai";
import "./markdown-styles.css";

export interface Chat {
  type: "user" | "ai";
  content: string;
  timestamp?: Date;
}

type Mode = "chat" | "generate";

function App() {
  const [loading, setLoading] = useState(false);
  const [loadingIdeas, setLoadingIdeas] = useState(false);
  const [mode, setMode] = useState<Mode>("generate");
  const [currentChats, setCurrentChats] = useState<Chat[]>([]);
  const [userInput, setUserInput] = useState("");
  const [c, setC] = useState(0);
  const [myIdeas, setMyIdeas] = useState<string[]>([]);
  const [saveSuccess, setSaveSuccess] = useState<boolean | null>(null);
  const chatContainerRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  const identity = new AnonymousIdentity();
  const client = new LLMClient({
    host: "https://ic0.app",
    identity: identity,
  });

  // Scroll to bottom of chat when messages change
  useEffect(() => {
    if (chatContainerRef.current) {
      chatContainerRef.current.scrollTop =
        chatContainerRef.current.scrollHeight;
    }
  }, [currentChats]);

  // Focus input on load
  useEffect(() => {
    if (inputRef.current) {
      inputRef.current.focus();
    }
  }, []);

  // Fetch ideas when component mounts or mode changes to 'chat'
  useEffect(() => {
    if (mode === "chat") {
      fetchIdeas();
    }
  }, [mode]);

  async function fetchIdeas() {
    try {
      setLoadingIdeas(true);
      const ideas = await getIdeas();
      setMyIdeas(ideas);
    } catch (error) {
      console.error("Error fetching ideas:", error);
    } finally {
      setLoadingIdeas(false);
    }
  }

  async function promptLLM(message: string): Promise<string> {
    try {
      await count();
      const response = await client.prompt(Model.Llama3_1_8B, message);
      return response as string;
    } catch (error) {
      console.error("Error from LLM:", error);
      return "Sorry, I encountered an error processing your request.";
    }
  }

  async function saveIdea(idea: string): Promise<boolean> {
    try {
      const backend = createActor(canisterId);
      const result = await backend.saveIDea(idea);

      // If save was successful, refresh the ideas list
      if (result) {
        await fetchIdeas();
      }

      setSaveSuccess(result);
      setTimeout(() => setSaveSuccess(null), 3000);

      return result;
    } catch (error) {
      console.error("Error saving idea:", error);
      setSaveSuccess(false);
      setTimeout(() => setSaveSuccess(null), 3000);
      return false;
    }
  }

  async function getIdeas(): Promise<string[]> {
    try {
      const backend = createActor(canisterId);
      const response = await backend.getIDeas();
      return response;
    } catch (error) {
      console.error("Error getting ideas:", error);
      return [];
    }
  }

  async function count() {
    try {
      const backend = createActor(canisterId);
      const num = await backend.getCount();
      setC(num);
    } catch (error) {
      console.error("Error getting count:", error);
    }
  }

  const handleUserSubmit = async () => {
    const trimmedInput = userInput.trim();
    if (!trimmedInput || loading) return;

    // Add user message
    const userChat: Chat = {
      type: "user",
      content: trimmedInput,
      timestamp: new Date(),
    };

    // Add temporary AI response with "Thinking..." message
    const loadingChat: Chat = {
      type: "ai",
      content: "Thinking...",
      timestamp: new Date(),
    };

    // Update chat state with new messages
    setCurrentChats((prevChats) => [...prevChats, userChat, loadingChat]);
    setLoading(true);
    setUserInput("");

    try {
      // Get AI response
      const aiResponse = await promptLLM(trimmedInput);

      // Replace "Thinking..." with actual response
      setCurrentChats((prevChats) => {
        const newChats = [...prevChats];
        newChats.pop(); // Remove loading message
        newChats.push({
          type: "ai",
          content: aiResponse,
          timestamp: new Date(),
        });
        return newChats;
      });
    } catch (error) {
      // Handle any errors during the prompt
      setCurrentChats((prevChats) => {
        const newChats = [...prevChats];
        newChats.pop(); // Remove loading message
        newChats.push({
          type: "ai",
          content: "Sorry, I couldn't generate a response. Please try again.",
          timestamp: new Date(),
        });
        return newChats;
      });
    } finally {
      setLoading(false);
      // Focus back on input after sending
      if (inputRef.current) {
        inputRef.current.focus();
      }
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setUserInput(e.target.value);
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleUserSubmit();
    }
  };

  const handleModeChange = (newMode: Mode) => {
    setMode(newMode);
  };

  const clearChat = () => {
    setCurrentChats([]);
  };

  return (
    <main className="flex flex-col items-center h-screen pt-12 mt-8 shadow-md bg-gray-100 rounded-md max-w-4xl mx-auto my-0">
      <h1 className="text-center flex items-center gap-2 text-4xl font-semibold my-4">
        <RiRobot3Fill size={24} className="text-blue-500" />
        IC LLM Demo - Azle
      </h1>

      {saveSuccess !== null && (
        <div
          className={`fixed top-4 right-4 p-3 rounded-md shadow-md transition-opacity ${
            saveSuccess ? "bg-green-500 text-white" : "bg-red-500 text-white"
          }`}
        >
          {saveSuccess ? "Idea saved successfully!" : "Failed to save idea"}
        </div>
      )}

      <div className="flex items-center justify-between gap-12 mt-8">
        <button
          className={`flex flex-row items-center gap-2 rounded-md py-4 px-8 transition-colors ${
            mode === "chat"
              ? "text-white bg-blue-500"
              : "bg-gray-200 text-black hover:bg-gray-300"
          }`}
          onClick={() => handleModeChange("chat")}
        >
          <IoLogoWechat size={24} />
          <p>My Ideas</p>
        </button>
        <button
          className={`flex flex-row items-center gap-2 rounded-md py-4 px-8 transition-colors ${
            mode === "generate"
              ? "text-white bg-blue-500"
              : "bg-gray-200 text-black hover:bg-gray-300"
          }`}
          onClick={() => handleModeChange("generate")}
        >
          <RiAiGenerate2 size={24} />
          <p>Generator</p>
        </button>

        {mode === "generate" && currentChats.length > 0 && (
          <button
            onClick={clearChat}
            className="flex items-center gap-1 text-sm text-gray-600 hover:text-red-500 transition-colors"
            title="Clear chat history"
          >
            <BsTrash size={14} />
            <span>Clear</span>
          </button>
        )}
      </div>

      <div className="relative h-3/4 border-[1px] border-gray-400 bg-white rounded-md mx-12 w-full max-w-3xl mt-8 overflow-hidden">
        {mode === "generate" ? (
          <>
            <div
              ref={chatContainerRef}
              className="h-[calc(100%-80px)] overflow-y-auto p-4 flex flex-col"
            >
              {currentChats.length === 0 && (
                <div className="flex flex-col items-center justify-center h-full">
                  <p className="text-center text-gray-400 mb-2">
                    Send a message to start the conversation
                  </p>
                  <p className="text-center text-gray-300 text-sm max-w-md">
                    Try asking for creative ideas, brainstorming, or questions
                    about ICP development
                  </p>
                </div>
              )}
              <div className="flex-grow space-y-2 pb-4">
                {currentChats.map((item, index) => (
                  <ChatContainer
                    key={index}
                    chat={item}
                    loading={loading}
                    onSave={saveIdea}
                  />
                ))}
              </div>
            </div>

            <div className="flex justify-between items-center absolute bottom-0 border-t-[1px] border-gray-400 px-8 w-full h-20 bg-white">
              <input
                ref={inputRef}
                className="w-full text-md mx-4 focus:outline-none focus:ring-1 focus:ring-blue-300 rounded-lg p-2 max-h-20"
                placeholder="Type a message or prompt..."
                value={userInput}
                onChange={handleInputChange}
                onKeyDown={handleKeyDown}
                disabled={loading}
              />
              <button
                className="ml-2 rounded-xl px-4 py-2 bg-blue-500 text-white disabled:bg-blue-200 hover:bg-blue-600 transition-colors"
                onClick={handleUserSubmit}
                disabled={loading || !userInput.trim()}
              >
                <BsFillSendFill size={20} />
              </button>
            </div>
          </>
        ) : (
          <div className="h-full overflow-y-auto p-4">
            <h2 className="text-xl font-semibold mb-4 flex items-center">
              <IoLogoWechat className="mr-2 text-blue-500" />
              Saved Ideas
            </h2>

            {loadingIdeas && (
              <div className="flex justify-center my-8">
                <AiOutlineLoading3Quarters
                  className="animate-spin text-blue-500"
                  size={24}
                />
              </div>
            )}

            {!loadingIdeas && myIdeas.length === 0 && (
              <div className="flex flex-col items-center justify-center h-64">
                <p className="text-center text-gray-500 my-4">
                  No saved ideas yet.
                </p>
                <p className="text-center text-gray-400 text-sm max-w-md">
                  Generate content in the Generator tab and click the save
                  button on AI responses to store them here.
                </p>
              </div>
            )}

            <div className="space-y-4">
              {myIdeas.map((idea, index) => (
                <div
                  key={index}
                  className="p-4 bg-blue-50 rounded-lg border border-blue-200 hover:shadow-md transition-shadow"
                >
                  <p className="text-sm text-gray-800">{idea}</p>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      <p className="text-xs text-gray-400 mt-4">
        Powered by ICP LLM | Count: {c}
      </p>
    </main>
  );
}

export default App;
