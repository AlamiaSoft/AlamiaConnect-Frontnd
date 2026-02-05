"use client"

// Ported and enhanced from UserAssitant prototype
export class AIService {
    private async getApiKey() {
        // In a real app, this would come from a secure backend or env
        return process.env.NEXT_PUBLIC_GEMINI_API_KEY || ""
    }

    async getChatResponse(message: string, persona: string, history: any[]) {
        try {
            // Simulated intelligence for demo
            const lowerMsg = message.toLowerCase();
            let responseText = "";

            if (persona === 'sales') {
                if (lowerMsg.includes("lead") || lowerMsg.includes("customer")) {
                    responseText = "Bilkul! (Absolutely!) I am using the 'create_lead' tool to register that for you. Success! New lead created in the pipeline.";
                } else if (lowerMsg.includes("visit") || lowerMsg.includes("field")) {
                    responseText = "Ji, I've logged the client visit with current GPS coordinates and photo evidence using 'log_visit'. Client is satisfied.";
                } else {
                    responseText = "Salaam! I am your Sales Engine. I can help you create leads or log client visits. What's the plan for today?";
                }
            } else if (persona === 'finance') {
                responseText = "Finance Assistant here. I'm checking the commission records for the current quarter. Tool 'get_commissions' accessed.";
            } else if (persona === 'cs') {
                responseText = "Customer Success mode active. I can help you tracking installation status or logging complaints via 'track_installation'.";
            } else {
                responseText = `As your ${persona} assistant, I am ready to process your request: "${message}". Tool indexing complete.`;
            }

            return {
                text: responseText,
                language_detected: lowerMsg.match(/[^\x00-\x7F]/) ? "ps/ur" : "en"
            }
        } catch (error) {
            console.error("AI Service Error:", error)
            throw error
        }
    }
}

export const aiService = new AIService()
