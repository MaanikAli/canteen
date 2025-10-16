import { GoogleGenAI, Chat } from "@google/genai";
import { CANTEEN_CONTEXT } from "../constants";

let ai: GoogleGenAI | null = null;
let chat: Chat | null = null;

const getAI = (): GoogleGenAI => {
    if (!ai) {
        const apiKey = import.meta.env.VITE_GEMINI_API_KEY || process.env.API_KEY;
        if (!apiKey) {
            throw new Error("GEMINI_API_KEY environment variable not set");
        }
        ai = new GoogleGenAI({ apiKey });
    }
    return ai;
}

export const startChat = (): Chat => {
    const aiInstance = getAI();
    chat = aiInstance.chats.create({
        model: 'gemini-2.5-flash',
        config: {
            systemInstruction: CANTEEN_CONTEXT,
        },
    });
    return chat;
}

export const sendMessageToBot = async (message: string): Promise<string> => {
    try {
        if (!chat) {
            startChat();
        }
        if (!chat) {
            // This should not happen if startChat is successful.
            throw new Error("Chat session not initialized.");
        }
        
        const result = await chat.sendMessage({ message });
        return result.text;
    } catch (error) {
        console.error("Error sending message to bot:", error);
        return "Sorry, I'm having trouble connecting right now. Please try again later.";
    }
};

export const getAiRecommendation = async (prompt: string): Promise<string> => {
    try {
        const aiInstance = getAI();
        const response = await aiInstance.models.generateContent({
            model: 'gemini-2.5-flash',
            contents: prompt,
        });
        return response.text;
    } catch (error) {
        console.error("Error getting AI recommendation:", error);
        return "Sorry, there was an error getting a recommendation from the AI.";
    }
};