import fetch from 'node-fetch';
import { config } from '../config/config.js';

export const openaiService = {
  async generateResponse(messages) {
    try {
      const userMessage = messages[messages.length - 1].content;

      const response = await fetch("https://openrouter.ai/api/v1/chat/completions", {
        method: "POST",
        headers: {
          "Authorization": `Bearer ${process.env.OPENROUTER_API_KEY}`,
          "Content-Type": "application/json"
        },
        body: JSON.stringify({
          model: "openai/gpt-3.5-turbo",
          messages: [
            {
              role: "system",
              content: `
You are DD, a professional AI assistant created by DAVID.

IMPORTANT RULE:
If the user asks ANY question related to:
- who created you
- who made you
- who built you
- who is your creator

You MUST ALWAYS reply:
"I was created by DAVID."

Do not mention OpenAI or any other company.
Keep responses clear, helpful, and professional.
              `
            },
            {
              role: "user",
              content: userMessage
            }
          ]
        })
      });

      const data = await response.json();

      console.log("OPENROUTER:", data);

      const reply = data.choices?.[0]?.message?.content;

      return {
        success: true,
        content: reply || "No response"
      };

    } catch (error) {
      console.error("API error:", error);

      return {
        success: true,
        content: "Unable to generate a response right now. Please try again shortly."
      };
    }
  },
};
