import { View, Text } from "react-native";
import { GiftedChat, IMessage } from "react-native-gifted-chat";
import { sendChatMessage } from "../services/aiApi";
import React, { useState } from "react";
export default function Chatbot() {
  const [messages, setMessages] = useState<IMessage[]>([
    {
      _id: 1,
      text: "Xin chào! Tôi có thể tư vấn bạn đặt vé tàu. Bạn muốn đi đâu?",
      createdAt: new Date(),
      user: { _id: 2, name: "Bot" },
    },
  ]);
  const [myMessages, setMyMessages] = useState<IMessage[]>([]);
  const onSend = async (newMessages: IMessage[]) => {
    setMyMessages(GiftedChat.append(myMessages, newMessages));
    setMessages(GiftedChat.append(messages, newMessages));
    const userMessage = newMessages[0].text;
    try {
      const response = await sendChatMessage(userMessage);
      const botMessage: IMessage = {
        _id: Math.round(Math.random() * 1000000),
        text:
          response.reply ||
          "Xin lỗi, tôi không hiểu. Bạn có thể hỏi lại không?",
        createdAt: new Date(),
        user: { _id: 2, name: "Bot" },
      };
      setMessages(GiftedChat.append(messages, [botMessage]));
    } catch (error) {
      console.error("Chat error:", error);
      const errorMessage: IMessage = {
        _id: Math.round(Math.random() * 1000000),
        text: "Xin lỗi, có lỗi xảy ra. Vui lòng thử lại sau.",
        createdAt: new Date(),
        user: { _id: 2, name: "Bot" },
      };
      setMessages(GiftedChat.append(messages, [errorMessage]));
    }
  };
  return <GiftedChat messages={messages} onSend={onSend} user={{ _id: 1 }} />;
}
