"use client";
import axios from "axios";
import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import React, { useEffect, useState } from "react";

function layout({ children }) {
  const router = useRouter();
  const params = useParams()

  const [conversation, setConversation] = useState([]);

  useEffect(() => {
    fetchConversationList();
  }, []);

  async function fetchConversationList() {
    const res = await axios.get("/api/conversations");
    setConversation(res?.data);
  }

  return (
    <main className="h-screen flex ">
      <section className="border-r border-black h-full flex flex-col gap-2 p-1 min-w-40">
        {conversation?.length > 0 &&
          conversation.map((chat) => (
            <Link
              key={chat?.id}
              className={`w-fit whitespace-nowrap px-1 ${params?.id == chat?.id ? "bg-black text-white":"bg-white text-black"}`}
              href={`/chat/${chat?.id}`}
            //   onClick={() => router.push(chat?.id)}
            >
              {chat?.title}
            </Link>
          ))}
      </section>
      <div className="w-full flex flex-col px-2 mb-4">
       {children}
      </div>
    </main>
  );
}

export default layout;
