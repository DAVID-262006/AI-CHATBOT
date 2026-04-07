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
            { role: "user", content: userMessage }
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
        content: "Sorry, something went wrong. Please try again."
      };
    }
  },
};