import { GoogleGenAI, Type } from "@google/genai";
import { MnemonicResponse, VocabularyResponse } from '../types';

const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

export const getMnemonic = async (kana: string, romaji: string, type: 'Hiragana' | 'Katakana'): Promise<MnemonicResponse | null> => {
  try {
    const prompt = `Generate a creative and memorable mnemonic (memory aid) for the Japanese ${type} character "${kana}" (pronounced ${romaji}). 
    The target audience is Chinese speakers learning Japanese.
    
    Return the response in JSON format.
    The response must include:
    1. "mnemonic": A short, catchy phrase in Chinese to remember the shape or sound.
    2. "description": A brief explanation of the visual association.
    `;

    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: prompt,
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            mnemonic: { type: Type.STRING },
            description: { type: Type.STRING },
          },
          required: ["mnemonic", "description"],
        },
      },
    });

    if (response.text) {
        return JSON.parse(response.text) as MnemonicResponse;
    }
    return null;
  } catch (error) {
    console.error("Error fetching mnemonic:", error);
    return null;
  }
};

export const getVocabulary = async (kana: string): Promise<VocabularyResponse | null> => {
  try {
    const prompt = `Provide a simple, common Japanese vocabulary word that starts with or contains the character "${kana}".
    The target audience is beginners (JLPT N5 level).
    
    Return the response in JSON format.
    The response must include:
    1. "word": The word in Japanese (including Kanji if applicable).
    2. "reading": The reading in Kana (Hiragana/Katakana).
    3. "meaning": The meaning in Chinese.
    `;

    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: prompt,
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            word: { type: Type.STRING },
            reading: { type: Type.STRING },
            meaning: { type: Type.STRING },
          },
          required: ["word", "reading", "meaning"],
        },
      },
    });

    if (response.text) {
        return JSON.parse(response.text) as VocabularyResponse;
    }
    return null;
  } catch (error) {
    console.error("Error fetching vocabulary:", error);
    return null;
  }
};
