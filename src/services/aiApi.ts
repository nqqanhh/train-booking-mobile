import { api } from "./api";

export const sendChatMessage = async (message: string) => {
  try {
    const response = await api.post("/ai/chat", { message });
    console.log("API Response:", response.data);
    return response.data;
  } catch (error) {
    console.error("API Error:", error);
    throw error;
  }
};
