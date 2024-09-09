import OpenAI from "openai";
import { OpenAIStream, StreamingTextResponse } from "ai";

const openai = new OpenAI();

export const runtime = "edge";

export async function POST(req: Request) {
  try {
    const { characters, model } = await req.json();

    // Construct prompt based on user-created characters
    let charactersPrompt = "Generate a story using the following characters:\n";
    characters.forEach((char: { name: string; description: string; personality: string }) => {
      charactersPrompt += `Name: ${char.name}, Description: ${char.description}, Personality: ${char.personality}\n`;
    });

    const response = await openai.chat.completions.create({
      model: model || "gpt-4o-mini",
      stream: true,
      messages: [
        {
          role: "system",
          content: `You are a story generator. Use the characters provided by the user to create a cohesive story. Ensure that each character’s description and personality are reflected in the narrative. The story should be under 500 words. Summarize each character's role at the end.`,
        },
        {
          role: "user",
          content: charactersPrompt,
        },
      ],
    });

    const stream = OpenAIStream(response);
    return new StreamingTextResponse(stream);
  } catch (error) {
    return new Response("There was an issue processing your request. Please try again.", {
      status: 500,
    });
  }
}
