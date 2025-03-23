import { useState, useRef, useEffect } from "react";
import { createActor, canisterId } from "../../declarations/backend";
import { LLMClient, Model } from "icp-llm-client";
import { AnonymousIdentity } from "@dfinity/agent";
import { RiRobot3Fill, RiAiGenerate2 } from "react-icons/ri";
import { IoLogoWechat } from "react-icons/io5";
import { BsFillSendFill } from "react-icons/bs";
import ChatContainer from "./components/ChatContainer";

export interface Chat {
  type: "user" | "ai";
  content: string;
}

type Mode = "chat" | "generate";

function App() {
  const [greeting, setGreeting] = useState("");
  const [loading, setLoading] = useState(false);
  const [mode, setMode] = useState<Mode>("generate");
  const [currentChats, setCurrentChats] = useState<Chat[]>([]);
  const [userInput, setUserInput] = useState("");
  const [c, setC] = useState(0);
  const chatContainerRef = useRef<HTMLDivElement>(null);

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

  async function promptLLM(message: string): Promise<string> {
    try {
      await count();
      console.log("Sending prompt to LLM...");
      const response = await client.prompt(Model.Llama3_1_8B, message);
      console.log("Response:", response);
      return response as string;
    } catch (error) {
      console.error("Error:", error);
      return "Sorry, I encountered an error processing your request.";
    }
  }

  async function count() {
    const backend = createActor(canisterId);
    const num = await backend.getCount();
    setC(num);
  }

  const handleUserSubmit = async () => {
    if (!userInput.trim()) return;

    // Add user message
    const userChat: Chat = {
      type: "user",
      content: userInput,
    };

    // Add temporary AI response with "Thinking..." message
    const loadingChat: Chat = {
      type: "ai",
      content: "Thinking...",
    };

    // Update chat state with new messages
    setCurrentChats((prevChats) => [...prevChats, userChat, loadingChat]);
    setLoading(true);
    setUserInput("");

    // Get AI response
    const aiResponse = await promptLLM(userInput);

    // Replace "Thinking..." with actual response
    setCurrentChats((prevChats) => {
      const newChats = [...prevChats];
      newChats.pop(); // Remove loading message
      newChats.push({
        type: "ai",
        content: aiResponse,
      });
      return newChats;
    });

    setLoading(false);
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

  return (
    <main className="flex flex-col items-center h-screen pt-12 mt-8 shadow-md bg-gray-100 rounded-md max-w-4xl mx-auto my-0">
      <h1 className="text-center flex items-center gap-2 text-4xl font-semibold my-4">
        <RiRobot3Fill size={24} />
        IC LLM Demo - Azle
      </h1>
      <div className="flex items-center justify-between gap-12 mt-12">
        <button
          className={`flex flex-row items-center gap-2 rounded-md py-4 px-8 ${
            mode === "chat"
              ? "text-white bg-blue-400"
              : "bg-gray-200 text-black"
          }`}
          onClick={() => handleModeChange("chat")}
        >
          <IoLogoWechat size={28} />
          <p>Chat Mode</p>
        </button>
        <button
          className={`flex flex-row items-center gap-2 rounded-md py-4 px-8 ${
            mode === "generate"
              ? "text-white bg-blue-400"
              : "bg-gray-200 text-black"
          }`}
          onClick={() => handleModeChange("generate")}
        >
          <RiAiGenerate2 size={28} />
          <p>Generator</p>
        </button>
      </div>
      <div className="relative h-3/4 border-[1px] border-gray-400 bg-white rounded-md mx-12 w-full max-w-3xl mt-8">
        <div
          ref={chatContainerRef}
          className="h-[calc(100%-80px)] overflow-y-auto p-4 flex flex-col"
        >
          {currentChats.length === 0 && (
            <p className="text-center text-gray-400 mt-8">
              Send a message to start the conversation
            </p>
          )}
          <div className="flex-grow space-y-2 pb-4">
            {currentChats.map((item, index) => (
              <ChatContainer key={index} chat={item} loading={loading} />
            ))}
          </div>
        </div>

        <div className="flex justify-between items-center absolute bottom-0 border-t-[1px] border-gray-400 px-8 w-full h-20 bg-white">
          <input
            className="w-full text-md mx-4 focus:outline-none max-h-20"
            placeholder="Type here..."
            value={userInput}
            onChange={handleInputChange}
            onKeyDown={handleKeyDown}
          />
          <button
            className="ml-2 rounded-xl px-4 py-2 bg-blue-400 text-white disabled:bg-blue-200"
            onClick={handleUserSubmit}
            disabled={loading || !userInput.trim()}
          >
            <BsFillSendFill size={28} />
          </button>
        </div>
      </div>
    </main>
  );
}

export default App;
