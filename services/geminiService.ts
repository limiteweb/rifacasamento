import { GoogleGenAI } from "@google/genai";

// FIX: Moved global window.aistudio type declaration to types.ts to resolve conflicting declarations.

export const generateVideo = async (prompt: string, aspectRatio: '16:9' | '9:16'): Promise<Blob> => {
  if (!process.env.API_KEY) {
    throw new Error("API key is not configured. Please select an API key.");
  }

  // Create a new instance right before the call to ensure it uses the latest key.
  const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
  
  let operation = await ai.models.generateVideos({
    model: 'veo-3.1-fast-generate-preview',
    prompt: prompt,
    config: {
      numberOfVideos: 1,
      resolution: '720p',
      aspectRatio: aspectRatio,
    }
  });

  // Poll for the result
  while (!operation.done) {
    await new Promise(resolve => setTimeout(resolve, 10000));
    operation = await ai.operations.getVideosOperation({ operation: operation });
  }

  if (!operation.response?.generatedVideos?.[0]?.video?.uri) {
    throw new Error("Video generation failed or returned no URI.");
  }

  const downloadLink = operation.response.generatedVideos[0].video.uri;
  
  // The response.body contains the MP4 bytes. You must append an API key when fetching from the download link.
  const response = await fetch(`${downloadLink}&key=${process.env.API_KEY}`);
  
  if (!response.ok) {
    throw new Error(`Failed to download video: ${response.statusText}`);
  }

  const videoBlob = await response.blob();
  return videoBlob;
};