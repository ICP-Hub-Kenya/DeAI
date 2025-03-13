import { useState } from 'react';
import { backend } from 'declarations/backend';
import { Prism as SyntaxHighlighter } from 'react-syntax-highlighter';
import { vscDarkPlus } from 'react-syntax-highlighter/dist/esm/styles/prism';
import ReactMarkdown from 'react-markdown';
import './App.css';

function App() {
  const [mode, setMode] = useState('chat');
  const [input, setInput] = useState('');
  const [projectName, setProjectName] = useState('');
  const [projectDesc, setProjectDesc] = useState('');
  const [language, setLanguage] = useState('motoko');
  const [response, setResponse] = useState(null);
  const [loading, setLoading] = useState(false);

  const chatExamples = [
    {
      category: "Getting Started",
      prompts: [
        "What is the Internet Computer Protocol (ICP)?",
        "How do I create my first canister?",
        "Explain what cycles are in Internet Computer",
      ]
    },
    {
      category: "Development",
      prompts: [
        "How do I make inter-canister calls?",
        "Explain the difference between query and update calls",
        "What are the best practices for canister development?",
      ]
    },
    {
      category: "Deployment",
      prompts: [
        "How do I deploy a canister to mainnet?",
        "How can I manage cycles in my canister?",
        "What is the difference between local and mainnet deployment?",
      ]
    }
  ];

  const projectExamples = [
    {
      name: "Token Canister",
      description: "A basic token canister with transfer and balance check functionality",
      language: "motoko"
    },
    {
      name: "Profile Storage",
      description: "A user profile storage system with CRUD operations",
      language: "rust"
    },
    {
      name: "Todo List",
      description: "A simple todo list with add, remove, and list tasks functionality",
      language: "motoko"
    }
  ];

  const handleChat = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const answer = await backend.ask_question(input);
      setResponse(answer);
    } catch (error) {
      setResponse('Error: Failed to get response');
    }
    setLoading(false);
  };

  const handleGenerate = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const project = await backend.generate_simple_project(
        projectName,
        projectDesc,
        language
      );
      setResponse(project);
    } catch (error) {
      setResponse('Error: Failed to generate project');
    }
    setLoading(false);
  };

  const handleExampleClick = (example) => {
    if (mode === 'chat') {
      setInput(example);
    } else {
      setProjectName(example.name);
      setProjectDesc(example.description);
      setLanguage(example.language);
    }
  };

  const CodeBlock = ({ language, code, title }) => {
    // Clean up any remaining markdown artifacts
    const cleanCode = code.replace(/```[a-z]*\n/g, '').replace(/```$/g, '');

    return (
      <div className="code-block">
        <div className="code-header">
          <span className="language-tag">{language}</span>
          <button 
            onClick={() => navigator.clipboard.writeText(cleanCode)}
            className="copy-button"
          >
            Copy
          </button>
        </div>
        <SyntaxHighlighter 
          language={language} 
          style={vscDarkPlus}
          customStyle={{
            margin: 0,
            borderRadius: '0 0 8px 8px',
          }}
        >
          {cleanCode}
        </SyntaxHighlighter>
      </div>
    );
  };

  const renderProjectFiles = (response) => (
    <div>
      <h3>Generated Project:</h3>
      
      <div className="code-section">
        <h4>Canister Code</h4>
        <CodeBlock 
          language={language.toLowerCase()} 
          code={response.canister_code}
        />
      </div>

      <div className="code-section">
        <h4>dfx.json</h4>
        <CodeBlock 
          language="json" 
          code={response.dfx_json}
        />
      </div>

      <div className="code-section">
        <h4>README.md</h4>
        <div className="markdown-content">
          <ReactMarkdown>{response.readme}</ReactMarkdown>
        </div>
      </div>
    </div>
  );

  const renderExamples = () => (
    <div className="examples-section">
      <h3>Try these examples:</h3>
      <div className="examples-list">
        {mode === 'chat' ? (
          chatExamples.map(category => (
            <div key={category.category}>
              <h4>{category.category}:</h4>
              {category.prompts.map(prompt => (
                <div 
                  key={prompt} 
                  className="example-item"
                  onClick={() => handleExampleClick(prompt)}
                >
                  • {prompt}
                </div>
              ))}
            </div>
          ))
        ) : (
          projectExamples.map(example => (
            <div 
              key={example.name} 
              className="example-item"
              onClick={() => handleExampleClick(example)}
            >
              • {example.name}: {example.description} ({example.language})
            </div>
          ))
        )}
      </div>
    </div>
  );

  return (
    <div className="app">
      <h1>
        <span role="img" aria-label="robot">🤖</span> 
        IC LLM Demo
      </h1>
      
      <div className="mode-selector">
        <button 
          onClick={() => {
            setMode('chat');
            setResponse(null);
          }}
          className={mode === 'chat' ? 'active' : ''}
        >
          💬 Chat Mode
        </button>
        <button 
          onClick={() => {
            setMode('project');
            setResponse(null);
          }}
          className={mode === 'project' ? 'active' : ''}
        >
          🚀 Project Generator
        </button>
      </div>

      {mode === 'chat' ? (
        <>
          <form onSubmit={handleChat}>
            <textarea
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="Ask anything about Internet Computer development..."
              rows="4"
            />
            <button type="submit" disabled={loading || !input}>
              {loading ? (
                <>Thinking<span className="loading"></span></>
              ) : (
                'Ask Question'
              )}
            </button>
          </form>
          {renderExamples()}
        </>
      ) : (
        <>
          <form onSubmit={handleGenerate}>
            <input
              type="text"
              value={projectName}
              onChange={(e) => setProjectName(e.target.value)}
              placeholder="Enter your project name..."
            />
            <textarea
              value={projectDesc}
              onChange={(e) => setProjectDesc(e.target.value)}
              placeholder="Describe what your project should do..."
              rows="3"
            />
            <select 
              value={language}
              onChange={(e) => setLanguage(e.target.value)}
            >
              <option value="motoko">Motoko</option>
              <option value="rust">Rust</option>
            </select>
            <button type="submit" disabled={loading || !projectName || !projectDesc}>
              {loading ? (
                <>Generating<span className="loading"></span></>
              ) : (
                '🔨 Generate Project'
              )}
            </button>
          </form>
          {renderExamples()}
        </>
      )}

      {response && (
        <div className="response">
          {mode === 'chat' ? (
            <div>
              <h3>Answer:</h3>
              <p>{response}</p>
            </div>
          ) : (
            renderProjectFiles(response)
          )}
        </div>
      )}
    </div>
  );
}

export default App;
