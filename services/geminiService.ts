
import { GoogleGenAI } from "@google/genai";

const API_KEY = process.env.API_KEY;

if (!API_KEY) {
  throw new Error("API_KEY environment variable not set");
}

const ai = new GoogleGenAI({ apiKey: API_KEY });

export async function describeImage(base64Image: string): Promise<string> {
  try {
    const imagePart = {
      inlineData: {
        mimeType: 'image/jpeg',
        data: base64Image.split(',')[1],
      },
    };

    const textPart = {
      text: "Describe esta imagen en español de forma concisa pero detallada. Céntrate en los objetos principales, el entorno y cualquier acción que esté ocurriendo."
    };

    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: { parts: [imagePart, textPart] },
    });

    return response.text;
  } catch (error) {
    console.error("Error generating description from Gemini:", error);
    if (error instanceof Error) {
        return `Error al contactar la IA: ${error.message}`;
    }
    return "Ocurrió un error desconocido al generar la descripción.";
  }
}
