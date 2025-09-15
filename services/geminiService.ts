
import { GoogleGenAI, Type, Modality, GenerateContentResponse } from "@google/genai";
import { GeminiImagePart } from '../types';

if (!process.env.API_KEY) {
    throw new Error("API_KEY environment variable not set");
}

const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

/**
 * Converts a File object to a base64 encoded string.
 */
export const fileToBase64 = (file: File): Promise<string> => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onload = () => {
      const result = reader.result as string;
      // remove "data:mime/type;base64," prefix
      resolve(result.split(',')[1]);
    };
    reader.onerror = (error) => reject(error);
  });
};

/**
 * Gets design suggestions for the given images.
 */
export const getDesignSuggestions = async (images: GeminiImagePart[]): Promise<string[]> => {
  try {
    const imageParts = images.map(img => ({ inlineData: img.inlineData }));
    
    const response: GenerateContentResponse = await ai.models.generateContent({
      model: "gemini-2.5-flash",
      contents: { 
          parts: [
              ...imageParts,
              { text: "You are an expert interior designer. Analyze this room and provide 5 creative, actionable suggestions to improve its design. Focus on themes, color palettes, furniture, and lighting." }
          ] 
      },
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            suggestions: {
              type: Type.ARRAY,
              items: {
                type: Type.STRING,
                description: 'A single design suggestion.'
              }
            }
          }
        }
      }
    });

    const jsonStr = response.text.trim();
    const result = JSON.parse(jsonStr);
    return result.suggestions || [];
  } catch (error) {
    console.error("Error getting design suggestions:", error);
    throw new Error("Failed to generate design ideas. Please check the console for details.");
  }
};

/**
 * Edits an image based on a text prompt.
 */
export const editImage = async (
  images: GeminiImagePart[],
  prompt: string
): Promise<{ newImageBase64: string | null; textResponse: string | null }> => {
    try {
        const imageParts = images.map(img => ({ inlineData: img.inlineData }));
        const response: GenerateContentResponse = await ai.models.generateContent({
            model: 'gemini-2.5-flash-image-preview',
            contents: {
                parts: [
                    ...imageParts,
                    { text: prompt },
                ],
            },
            config: {
                responseModalities: [Modality.IMAGE, Modality.TEXT],
            },
        });

        let newImageBase64: string | null = null;
        let textResponse: string | null = null;

        for (const part of response.candidates[0].content.parts) {
            if (part.text) {
                textResponse = part.text;
            } else if (part.inlineData && part.inlineData.data) {
                newImageBase64 = part.inlineData.data;
            }
        }
        
        if (!newImageBase64) {
            textResponse = textResponse || "I couldn't generate a new image for that request, but here's my thought: ";
        }

        return { newImageBase64, textResponse };
    } catch (error) {
        console.error("Error editing image:", error);
        throw new Error("Failed to edit the image. Please try a different prompt.");
    }
};
