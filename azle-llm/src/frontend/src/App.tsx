import { useState } from "react";
import { createActor, canisterId } from "../../declarations/backend";
import { LLMClient, Model } from "icp-llm-client";
import { AnonymousIdentity } from "@dfinity/agent";
import { RiRobot3Fill, RiAiGenerate2 } from "react-icons/ri";
import { IoLogoWechat } from "react-icons/io5";
import { BsFillSendFill } from "react-icons/bs";

function App() {
  const [greeting, setGreeting] = useState("");
  const [loading, setLoading] = useState(false);
  const [mode, setMode] = useState<"chat" | "genrate">("chat");
  const [userInput, setUserInput] = useState("");
  const [c, setC] = useState(0);
  const identity = new AnonymousIdentity();
  const client = new LLMClient({
    host: "https://ic0.app",
    identity: identity,
  });

  async function promptLLM() {
    try {
      setLoading(true);
      await count();
      console.log("Testing simple prompt...");
      const response = await client.prompt(
        Model.Llama3_1_8B,
        "What is the temperature of the sun, be brief.",
      );
      console.log("Response:", response);
      setLoading(false);
    } catch (error) {
      setLoading(false);
      console.error("Error:", error);
    }
  }

  // function handleSubmit(event: any) {
  //   event.preventDefault();
  //   const name = event.target.elements.name.value;
  //   const backend = createActor(canisterId);
  //   backend.greet(name).then((greeting: any) => {
  //     setGreeting(greeting);
  //   });
  //   return false;
  // }
  async function count() {
    const backend = createActor(canisterId);
    const num = await backend.getCount();
    setC(num);
  }

  return (
    <main className="flex flex-col items-center h-screen pt-12 mt-8 shadow-md bg-gray-100 rounded-md max-w-4xl mx-auto my-0">
      <h1 className="text-center flex items-center gap-2 text-4xl font-semibold my-4">
        <RiRobot3Fill size={24} />
        IC LLM Demo - Azle
      </h1>
      <div className="flex items-center justify-between gap-12 mt-12">
        <button className="flex flex-row items-center gap-2 rounded-md bg-blue-400 py-4 px-8 text-white">
          <IoLogoWechat size={28} />
          <p>Chat Mode</p>
        </button>
        <button className="flex flex-row items-center gap-2 rounded-md bg-gray-200 py-4 px-8 text-black">
          <RiAiGenerate2 size={28} />
          <p>Generator</p>
        </button>
      </div>
      <div className="relative h-3/4 border-[1px] border-gray-400 pt-14 bg-white rounded-md mx-12 w-full max-w-3xl mt-8">
        <h1>Hello</h1>
        <div className="flex justify-between items-center absolute bottom-0 border-t-[1px] border-gray-400 px-8 w-full h-20">
          <input
            className="w-3/4 text-md mx-4 focus:outline-none max-h-20"
            placeholder="Type here..."
          />
          <button className="w-15 h-15 rounded-xl px-4 py-2 bg-blue-400 text-white">
            <BsFillSendFill size={28} />
          </button>
        </div>
      </div>
    </main>
  );
}

export default App;
