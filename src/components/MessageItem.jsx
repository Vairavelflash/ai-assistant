export default function MessageItem({ message }) {
  // Handle Tool Messages
  if (message.role === 'tool') {
    return (
      <div className=" border-l-4 border-amber-500 bg-amber-50 p-2 rounded-r-lg"  key={message.id}>
        <div className="flex items-center gap-2 text-amber-700 font-normal mb-1">
          🔧 Tool Used: <span className="font-mono">{message.name || message.tool}</span>
        </div>
        <pre className="text-sm whitespace-pre-wrap bg-white p-1.5 rounded border text-gray-700">
          {message?.result}
        </pre>
      </div>
    );
  }

  // Assistant Message
  if (message.role === 'assistant') {
    return (
      <div className="flex justify-start mb-6"  key={message.id}>
        <div className="max-w-[85%]">
          <div className="font-medium text-gray-700 mb-1">Assistant</div>
          <div className="p-4 bg-white border border-gray-200 rounded-2xl shadow-sm">
            {message.content}
          </div>
        </div>
      </div>
    );
  }

  // User Message
  return (
    <div className="flex justify-end mb-6"  key={message.id}>
      <div className="max-w-[85%]">
        <div className="font-medium text-gray-700 mb-1 text-right">You</div>
        <div className="p-4 bg-blue-600 text-white rounded-2xl shadow-sm">
          {message.content}
        </div>
      </div>
    </div>
  );
}