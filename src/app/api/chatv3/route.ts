import { ChatOllama } from "@langchain/ollama";
import { AIMessageChunk, createAgent } from "langchain";
import { NextRequest } from "next/server";
import { toBaseMessages, toUIMessageStream } from '@ai-sdk/langchain';
import { createUIMessageStreamResponse, UIMessage } from 'ai';

import { getCurrentTimeTool, getUserDataTool } from "@/lib/llm-tools";
import { getServerUser } from "@/lib/auth";

export const maxDuration = 60;

// สร้าง agent ด้วย createAgent
const llm = new ChatOllama({
        model: 'scb10x/typhoon2.5-qwen3-4b:latest',
        temperature: 0.2,
        maxRetries: 3
});

function getdynamicSystemPrompt(userId:number) {
    // สามารถเพิ่ม logic เพื่อดึง prompt จากฐานข้อมูลหรือไฟล์ได้
    let prompt = process.env.SYSTEM_PROMPT || "You are a helpful assistant.";
    prompt = prompt?.replace("{userId}", userId.toString()) || prompt;
    console.log("System Prompt:", prompt);
    return prompt;
}


// http://localhost:3000/api/chatv3
export async function POST(req: NextRequest) {
    const { messages }: { messages: UIMessage[] } = await req.json();
    const currentUser = await getServerUser();
    if (!currentUser) {
        return new Response('Unauthorized', { status: 401 });
    }

    const langchainMessages = await toBaseMessages(messages);

    const agent = createAgent({
        model: llm,
        systemPrompt: getdynamicSystemPrompt(currentUser.id),
        tools: [
            getCurrentTimeTool,
            getUserDataTool,
        ],
    });

    const result = agent.streamEvents(
      { messages: langchainMessages },
      { streamMode: ['values', 'messages'] }
    );
    
    // Convert the LangChain stream to UI message stream
    return createUIMessageStreamResponse({
        stream: toUIMessageStream(result),
    });

}
