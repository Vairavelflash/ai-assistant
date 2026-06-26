import axios from "axios";

export const getMessages = async (
  conversationId
) => {
  const response = await axios.get(
    `/api/conversations/${conversationId}/messages`
  );

  return response.data.messages;
};