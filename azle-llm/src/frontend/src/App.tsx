import { useState } from "react";
import { createActor, canisterId } from "../../declarations/backend";
import { LLMClient, Model } from "icp-llm-client";
import { AnonymousIdentity } from "@dfinity/agent";

function App() {
  const [greeting, setGreeting] = useState("");
  const [loading, setLoading] = useState(false);
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
    <main>
      <img src="/logo2.svg" alt="DFINITY logo" />
      <br />
      <br />

      <section className="text-red-500 font-bold" id="greeting">
        {c}
      </section>
      {loading ? (
        <h1>Loading</h1>
      ) : (
        <button onClick={promptLLM}>Call an LLM</button>
      )}
    </main>
  );
}

export default App;
