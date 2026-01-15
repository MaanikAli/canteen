import { GoogleGenerativeAI } from "@google/generative-ai";
import { CANTEEN_CONTEXT } from "../constants";

let ai: GoogleGenerativeAI | null = null;
let chat: any = null;

const getAI = (): GoogleGenerativeAI => {
    if (!ai) {
        const apiKey = (globalThis as any).GEMINI_API_KEY || process.env.GEMINI_API_KEY || process.env.API_KEY;
        if (!apiKey) {
            throw new Error("Gemini API key not found. Please set GEMINI_API_KEY in your Vercel environment variables.");
        }
        ai = new GoogleGenerativeAI(apiKey);
    }
    return ai;
}

// Function to check if API key is available
export const isApiKeyAvailable = (): boolean => {
    try {
        const apiKey = (globalThis as any).GEMINI_API_KEY || process.env.GEMINI_API_KEY || process.env.API_KEY;
        return !!apiKey;
    } catch (error) {
        return false;
    }
}

export const startChat = () => {
    try {
        const aiInstance = getAI();
        const model = aiInstance.getGenerativeModel({
            model: "gemini-1.5-flash",
            systemInstruction: CANTEEN_CONTEXT,
        });
        chat = model.startChat({
            history: [],
        });
        return chat;
    } catch (error) {
        console.error("Failed to start chat:", error);
        return null;
    }
}

export const sendMessageToBot = async (message: string): Promise<string> => {
    try {
        if (!chat) {
            chat = startChat();
        }
        if (!chat) {
            return "Sorry, the AI assistant is currently unavailable. Please try again later.";
        }

        const result = await chat.sendMessage(message);
        return result.response.text();
    } catch (error) {
        console.error("Error sending message to bot:", error);
        return "Sorry, I'm having trouble connecting right now. Please try again later.";
    }
};

export const getAiRecommendation = async (prompt: string): Promise<string> => {
    try {
        const aiInstance = getAI();
        const model = aiInstance.getGenerativeModel({ model: "gemini-1.5-flash" });
        const result = await model.generateContent(prompt);
        return result.response.text();
    } catch (error) {
        console.error("Error getting AI recommendation:", error);
        return "Sorry, there was an error getting a recommendation from the AI.";
    }
};
