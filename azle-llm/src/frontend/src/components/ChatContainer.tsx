import { Chat } from "../App";
import { AiOutlineLoading3Quarters } from "react-icons/ai";
import { FiSave } from "react-icons/fi";
import { useState } from "react";

interface ChatContainerProps {
  chat: Chat;
  loading?: boolean;
  onSave?: (content: string) => Promise<boolean>;
}

function ChatContainer({ chat, loading, onSave }: ChatContainerProps) {
  const [isSaving, setIsSaving] = useState(false);
  const [saved, setSaved] = useState(false);

  const handleSave = async () => {
    if (!onSave || isSaving || saved) return;

    setIsSaving(true);
    const success = await onSave(chat.content);
    setIsSaving(false);

    if (success) {
      setSaved(true);
      setTimeout(() => setSaved(false), 3000); // Reset saved state after 3 seconds
    }
  };

  return (
    <div className="w-full flex justify-end my-4">
      <div
        className={`max-w-3/4 p-3 rounded-xl shadow-sm relative ${
          chat.type === "user"
            ? "bg-gray-200 mr-4 ml-auto"
            : "bg-blue-500 ml-4 mr-auto self-start"
        }`}
        style={{ maxWidth: "75%" }}
      >
        <p
          className={`leading-relaxed px-2 py-1 break-words text-sm ${
            chat.type === "user" ? "text-black" : "text-white"
          }`}
        >
          {chat.content}
          {loading && chat.type === "ai" && chat.content === "Thinking..." && (
            <AiOutlineLoading3Quarters className="inline animate-spin ml-2 text-white" />
          )}
        </p>

        {chat.type === "ai" && onSave && chat.content !== "Thinking..." && (
          <button
            onClick={handleSave}
            disabled={isSaving || saved}
            className={`absolute -top-3 -right-3 p-2 rounded-full shadow-md text-white 
              ${
                saved
                  ? "bg-green-500"
                  : isSaving
                  ? "bg-gray-400"
                  : "bg-blue-600 hover:bg-blue-700"
              }`}
            title={saved ? "Saved!" : "Save this idea"}
          >
            {isSaving ? (
              <AiOutlineLoading3Quarters className="animate-spin" size={16} />
            ) : (
              <FiSave size={16} />
            )}
          </button>
        )}
      </div>
    </div>
  );
}

export default ChatContainer;
