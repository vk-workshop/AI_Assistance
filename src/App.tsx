import { useState } from 'react';

interface ChatMessage {
  role: string;
  message: string;
}

const makeRequest = async (message: string) => {
  const response = await fetch('http://localhost:3002', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ message }),
  });

  const data = await response.json();

  return data;
}

function App() {
  const [message, setMessage] = useState('');
  const [chat, setChat] = useState<ChatMessage[]>([]);

  const askChatGpt = async (e: React.FormEvent) => {
    e.preventDefault();
    setChat((state) => ([...state, { role: 'Me', message }]));
    setMessage('');
    const response = await makeRequest(message);
    setChat((state) => ([...state, { role: 'ChatGPT', message: response }]));
  }

  return (
    <div className="flex flex-col h-screen">
      <div className="text-6xl font-extrabold text-center p-4">
        <span className="bg-clip-text text-transparent bg-gradient-to-r from-pink-500 to-violet-500">
          Book Store
        </span>
      </div>

      <div className="flex flex-col flex-grow overflow-auto p-4">
        {chat.map((item, i) => (
          <div key={i} className="flex mb-2">
            <div className="flex-grow">
              <div className="font-bold">{item.role}</div>
              <pre className="p-2 border rounded shadow-md whitespace-pre-wrap">{item.message}</pre>
            </div>
          </div>
        ))}
      </div>

      <form onSubmit={askChatGpt} className="flex p-4 border-t">
        <input 
          type="text" 
          value={message} 
          onChange={(e) => setMessage(e.target.value)}
          className="flex-grow mr-2 p-2 border rounded shadow-md"
          placeholder="Ask AI what a book are you looking for..."
        />
        <button type="submit" className="text-gray-900 bg-gradient-to-r from-teal-200 to-lime-200 hover:bg-gradient-to-l hover:from-teal-200 hover:to-lime-200 focus:ring-4 focus:outline-none focus:ring-lime-200 dark:focus:ring-teal-700 font-medium rounded-lg text-sm px-5 text-center">
          Send
        </button>
      </form>
    </div>
  );
}

export default App;
