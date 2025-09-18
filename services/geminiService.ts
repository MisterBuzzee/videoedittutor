import { GoogleGenAI, Type } from "@google/genai";
import { Application, Tutorial } from "../types";

const ai = new GoogleGenAI({ apiKey: process.env.API_KEY as string });

export const getTutorial = async (prompt: string, appName: Application): Promise<Tutorial> => {
  const model = "gemini-2.5-flash";
  
  const appSpecificContext = {
    [Application.DavinciResolve]: "When generating tutorials for Davinci Resolve, pay close attention to its unique 'Page' structure (Edit, Cut, Fusion, Color, Fairlight, Deliver). Specify which page the user should be on for each step. Mention nodes when discussing color grading or Fusion effects.",
    [Application.SonyVegas]: "For Sony Vegas, emphasize its powerful timeline-based editing and audio manipulation features. Refer to standard layouts and toolbars. Vegas Pro is known for its flexibility, so mention alternative ways to achieve a task if applicable.",
    [Application.FinalCutPro]: "For Final Cut Pro, tutorials must reference the magnetic timeline, libraries, events, and projects. Explain how clips connect and how to use tools like the Position, Trim, and Blade tools within this non-traditional timeline.",
  };

  const systemInstruction = `You are an expert ${appName} tutor. Your mission is to provide comprehensive, in-depth, and easy-to-follow step-by-step tutorials. 
  
  **Application-Specific Guidance:** ${appSpecificContext[appName]}
  
  The user will ask how to do something. You MUST respond with a tutorial in the requested JSON format. Each step should be highly detailed, actionable, and precise. Explain not just *what* to do, but also *why* it's done. Include specific menu paths (e.g., 'File > Open'), tool names, and common keyboard shortcuts (e.g., Ctrl+C / Cmd+C). Assume the user has the application open but is a beginner who appreciates thorough explanations. Give the tutorial a short, relevant title. Crucially, do NOT include the step number (e.g., "Step 1:") in the step description string itself; the user interface will add that automatically.`;

  try {
    const response = await ai.models.generateContent({
      model: model,
      contents: `Generate a tutorial for: "${prompt}"`,
      config: {
        systemInstruction,
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            title: {
              type: Type.STRING,
              description: "A short, descriptive title for the tutorial.",
            },
            steps: {
              type: Type.ARRAY,
              items: {
                type: Type.STRING,
              },
              description: "An array of strings, where each string is a single, detailed step in the tutorial.",
            },
          },
          required: ["title", "steps"],
        },
      },
    });

    const jsonString = response.text.trim();
    if (!jsonString) {
      throw new Error("Received an empty response from the API.");
    }
    
    const parsedJson = JSON.parse(jsonString);
    
    if (!parsedJson.title || !Array.isArray(parsedJson.steps)) {
        throw new Error("Invalid JSON structure received from API.");
    }

    return parsedJson as Tutorial;

  } catch (error) {
    console.error("Error generating tutorial:", error);
    throw new Error("Failed to get tutorial from Gemini API.");
  }
};
