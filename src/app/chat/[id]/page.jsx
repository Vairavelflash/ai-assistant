"use client";

import ChatPage from "@/components/ChatPage";
import axios from "axios";
import { useParams, useRouter } from "next/navigation";
import React, { Fragment, useEffect, useState } from "react";

function page() {
  const { id } = useParams();
  const router = useRouter();
  const [chat, setChat] = useState([]);

  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);

  const sendMessage = async () => {
    if (!input.trim()) return;

    const userMessage = {
      id: crypto.randomUUID(),
      role: "user",
      content: input,
    };

    setMessages((prev) => [...prev, userMessage]);

    const currentInput = input;

    setInput("");
    setLoading(true);

    const assistantId = crypto.randomUUID();

    setMessages((prev) => [
      ...prev,
      {
        id: assistantId,
        role: "assistant",
        content: "",
      },
    ]);

    const response = await fetch("/api/test-stream", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        conversationId: id,
        message: currentInput,
      }),
    });

    const reader = response.body.getReader();

    const decoder = new TextDecoder();

    while (true) {
      const { done, value } = await reader.read();

      if (done) break;

      const chunk = decoder.decode(value);

      const events = chunk.split("\n").filter(Boolean);

      for (const event of events) {
        const data = JSON.parse(event);

        /*
         * TOOL EVENT
         */
        if (data.type === "tool_start") {
          setMessages((prev) => [
            ...prev,
            {
              id: crypto.randomUUID(),
              role: "tool",
              tool: data.tool,
              result: data.result,
            },
          ]);
        }

        /*
         * TEXT EVENT
         */
        if (data.type === "text_end") {
          setMessages((prev) =>
            prev.map((msg) =>
              msg.id === assistantId
                ? {
                    ...msg,
                    content: msg.content + data.content,
                  }
                : msg,
            ),
          );
        }
      }
    }

    setLoading(false);
    //   router.refresh();
  };

  useEffect(() => {
    if (!loading) {
      fetchMessages();
    }
  }, [id, loading]);

  const fetchMessages = async () => {
    try {
      const { data } = await axios.get(`/api/conversations/${id}`);
console.log('first',data)
      setChat(
        data.map((msg) => ({
          id: msg.id || msg?._id,
          role: msg.role,
          content: msg.content,
        })),
      );
    } catch (error) {
      console.error(error);
    }
  };

  console.log("first", id);
  return (
    <Fragment>
      <div className=" flex-1 overflow-y-auto p-6 space-y-4">
        {id && <ChatPage chatHistory={chat} conversationId={id} />}
      </div>
      <div className="flex gap-2">
        <input
          value={input}
          onChange={(e) => setInput(e.target.value)}
          className="border p-3 flex-1 rounded"
          placeholder="Ask something..."
          onKeyDown={(e) => {if(e.key === "Enter"){
     sendMessage()
          }
          }}
        />

        <button
          onClick={sendMessage}
          disabled={loading}
          className="px-4 py-2 border rounded"
        >
          Send
        </button>
      </div>
    </Fragment>
  );
}

export default page;
