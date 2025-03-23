import { Chat } from "../App";
import { AiOutlineLoading3Quarters } from "react-icons/ai";
import { FiSave } from "react-icons/fi";
import { useState } from "react";
import ReactMarkdown from "react-markdown";

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

  const isAiThinking =
    loading && chat.type === "ai" && chat.content === "Thinking...";
  const shouldShowSaveButton =
    chat.type === "ai" && onSave && chat.content !== "Thinking...";

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
        <div
          className={`leading-relaxed px-2 py-1 break-words text-sm ${
            chat.type === "user" ? "text-black" : "text-white"
          }`}
        >
          {chat.type === "user" || isAiThinking ? (
            <>
              {chat.content}
              {isAiThinking && (
                <AiOutlineLoading3Quarters className="inline animate-spin ml-2 text-white" />
              )}
            </>
          ) : (
            <div className="markdown-content">
              <ReactMarkdown
                components={{
                  // Style headers
                  h1: ({ node, ...props }) => (
                    <h1 className="text-xl font-bold my-2" {...props} />
                  ),
                  h2: ({ node, ...props }) => (
                    <h2 className="text-lg font-bold my-2" {...props} />
                  ),
                  h3: ({ node, ...props }) => (
                    <h3 className="text-md font-bold my-1" {...props} />
                  ),
                  // Style links
                  a: ({ node, ...props }) => (
                    <a className="text-blue-200 underline" {...props} />
                  ),
                  // Style code blocks
                  code: ({ node, className, children, ...props }) => {
                    const match = /language-(\w+)/.exec(className || "");
                    return (
                      <code
                        className={`${
                          match
                            ? "bg-blue-700 block p-2 rounded"
                            : "bg-blue-700 px-1 rounded"
                        }`}
                        {...props}
                      >
                        {children}
                      </code>
                    );
                  },
                  // Style paragraphs and lists
                  p: ({ node, ...props }) => <p className="mb-2" {...props} />,
                  ul: ({ node, ...props }) => (
                    <ul className="list-disc ml-4 mb-2" {...props} />
                  ),
                  ol: ({ node, ...props }) => (
                    <ol className="list-decimal ml-4 mb-2" {...props} />
                  ),
                  li: ({ node, ...props }) => (
                    <li className="mb-1" {...props} />
                  ),
                  // Style blockquotes
                  blockquote: ({ node, ...props }) => (
                    <blockquote
                      className="border-l-4 border-blue-300 pl-2 italic"
                      {...props}
                    />
                  ),
                  // Style strong and emphasis
                  strong: ({ node, ...props }) => (
                    <strong className="font-bold" {...props} />
                  ),
                  em: ({ node, ...props }) => (
                    <em className="italic" {...props} />
                  ),
                }}
              >
                {chat.content}
              </ReactMarkdown>
            </div>
          )}
        </div>

        {shouldShowSaveButton && (
          <button
            onClick={handleSave}
            disabled={isSaving || saved}
            className={`absolute -top-3 -right-3 p-2 rounded-full shadow-md text-white transition-colors 
              ${
                saved
                  ? "bg-green-500"
                  : isSaving
                  ? "bg-gray-400"
                  : "bg-blue-600 hover:bg-blue-700"
              }`}
            title={saved ? "Saved!" : "Save this idea"}
            aria-label={saved ? "Idea saved" : "Save idea"}
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
