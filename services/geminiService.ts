
import { GoogleGenAI } from "@google/genai";
import { CallEntry } from "../types";

const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

export async function getCallInsights(calls: CallEntry[]) {
  if (calls.length === 0) return null;

  const dataString = calls.slice(0, 50).map(c => 
    `Num: ${c.number}, Time: ${c.timestamp}, Dur: ${c.durationFormatted}`
  ).join('\n');

  try {
    const response = await ai.models.generateContent({
      model: 'gemini-3-flash-preview',
      contents: `Analyze these call logs and provide a brief professional summary (3-4 bullet points) of patterns like peak call times, frequent contacts, or average call efficiency. Use Markdown.\n\n${dataString}`,
      config: {
        systemInstruction: "You are a senior telecommunications analyst. Provide concise, data-driven insights based on the provided logs.",
      },
    });

    return response.text;
  } catch (error) {
    console.error("Gemini Insight Error:", error);
    return "Failed to generate AI insights.";
  }
}
