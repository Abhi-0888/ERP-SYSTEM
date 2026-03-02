import axios from "axios";

const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5001";

export interface ChatMessage {
    role: "user" | "assistant";
    content: string;
}

export const AiService = {
    /**
     * Send a conversation to the backend AI endpoint.
     * @param messages - Full conversation history (user + assistant turns)
     * @returns The assistant's reply string
     */
    async chat(messages: ChatMessage[]): Promise<string> {
        const token =
            typeof window !== "undefined" ? localStorage.getItem("token") : null;

        const response = await axios.post(
            `${API_URL}/ai/chat`,
            { messages },
            {
                headers: {
                    "Content-Type": "application/json",
                    ...(token ? { Authorization: `Bearer ${token}` } : {}),
                },
            }
        );
        return response.data.reply as string;
    },
};
