"use client";

import { useEffect, useState } from "react";
import axios from "axios";
import MessageItem from "./MessageItem";

export default function ChatPage({chatHistory, conversationId }) {


if(!conversationId){
    return <p>No Requested conversation</p>
}
  return (
    <div className="space-y-4">
      {chatHistory?.map((message) => <MessageItem key={message?.id || message?._id} message={message}/>)}
    </div>
  );
}