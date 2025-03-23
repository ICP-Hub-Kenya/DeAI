import { Chat } from "../App";
import { AiOutlineLoading3Quarters } from "react-icons/ai";

function ChatContainer({ chat, loading }: { chat: Chat; loading?: boolean }) {
  return (
    <div className="w-full flex justify-end my-4">
      <div
        className={`max-w-3/4 p-3 rounded-xl shadow-sm ${
          chat.type === "user"
            ? "bg-gray-200 mr-4 ml-auto"
            : "bg-blue-500 ml-4 mr-auto self-start"
        }`}
        style={{ maxWidth: "75%" }}
      >
        <p
          className={`leading-relaxed px-2 py-1 break-words ${
            chat.type === "user" ? "text-black" : "text-white"
          }`}
        >
          {chat.content}
          {loading && chat.type === "ai" && chat.content === "Thinking..." && (
            <AiOutlineLoading3Quarters className="inline animate-spin ml-2 text-white" />
          )}
        </p>
      </div>
    </div>
  );
}

export default ChatContainer;
