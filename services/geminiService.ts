import { GoogleGenAI, Type, Schema } from "@google/genai";
import { KeywordEntry } from "../types";

const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

const keywordSchema: Schema = {
  type: Type.ARRAY,
  items: {
    type: Type.OBJECT,
    properties: {
      keyword: {
        type: Type.STRING,
        description: "The generated keyword or phrase."
      },
      keywordType: {
        type: Type.STRING,
        enum: ["Short Tail", "Long Tail", "Question", "Commercial"],
        description: "The categorization of the keyword length and nature."
      },
      searchIntent: {
        type: Type.STRING,
        enum: ["Informational", "Commercial", "Transactional", "Navigational"],
        description: "The user intent behind the search."
      },
      priorityScore: {
        type: Type.NUMBER,
        description: "A score from 0 to 100 indicating ranking potential and value."
      },
      importance: {
        type: Type.STRING,
        description: "A short, one-line explanation of why this keyword is valuable."
      }
    },
    required: ["keyword", "keywordType", "searchIntent", "priorityScore", "importance"]
  }
};

export const generateKeywords = async (seed: string): Promise<KeywordEntry[]> => {
  try {
    const prompt = `
      Act as a world-class SEO strategist.
      Generate a comprehensive keyword research table based on the seed keyword: "${seed}".

      Requirements:
      1. Generate EXACTLY 100 unique keyword entries. Do not stop early.
      2. Include a diverse mix:
         - Short tail (broad terms)
         - Long tail (specific, low volume but high intent)
         - Questions (People Also Ask style, starting with Who, What, Where, When, Why, How)
         - Buyer/Commercial keywords (including words like "best", "price", "buy", "review", "vs", "near me")
         - Synonyms and related semantic terms.
      3. Assign a realistic Priority Score (0-100) based on estimated value and intent.
      4. Determine the Search Intent accurately.
      5. Provide a brief, punchy reason for Importance.

      Return the data strictly as a JSON array.
    `;

    const response = await ai.models.generateContent({
      model: "gemini-2.5-flash",
      contents: prompt,
      config: {
        responseMimeType: "application/json",
        responseSchema: keywordSchema,
        temperature: 0.7, // Slight creativity for synonyms
      },
    });

    const text = response.text;
    if (!text) {
      throw new Error("No data returned from Gemini.");
    }

    const data = JSON.parse(text) as KeywordEntry[];
    return data;

  } catch (error) {
    console.error("Gemini API Error:", error);
    throw error;
  }
};