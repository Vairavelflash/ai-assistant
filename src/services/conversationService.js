import axios from "axios";

export const getConversations = () =>{
    axios.get("/api/conversations")
}

export const createConversation = () =>{
    axios.post("/api/conversations")
}