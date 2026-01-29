import { ChatOllama } from "@langchain/ollama";
import { AIMessageChunk, createAgent } from "langchain";
import { NextRequest } from "next/server";
import { toBaseMessages, toUIMessageStream } from '@ai-sdk/langchain';
import { createUIMessageStreamResponse, UIMessage } from 'ai';

import { getCurrentTimeTool } from "@/lib/llm-tools";

export const maxDuration = 60;

// สร้าง agent ด้วย createAgent
const llm = new ChatOllama({
        model: 'scb10x/typhoon2.5-qwen3-4b:latest',
        temperature: 0.2,
        maxRetries: 3
});

const agent = createAgent({
    model: llm,
    systemPrompt: 'คุณเป็นผู้จัดการฝ่าย HR คอยตอบคำถามให้กับพนักงานในเรื่องนโยบายการลา สวัสดิการต่างๆ',
    tools: [getCurrentTimeTool],
});

// http://localhost:3000/api/chatv2
export async function POST(req: NextRequest) {
    const { messages }: { messages: UIMessage[] } = await req.json();
    console.log(messages);

    // Convert AI SDK UIMessages to LangChain messages
    const langchainMessages = await toBaseMessages(messages);

    console.log(langchainMessages);

    // const result = await agent.stream(
    //   { messages: langchainMessages },
    //   {streamMode : ['values','messages']}

    // );

    const result = agent.streamEvents(
      { messages: langchainMessages }  ,
      {streamMode : ['values','messages']},
    );

    return createUIMessageStreamResponse({
        stream: toUIMessageStream(result),
    });


    /////////////////
    //// Old code แบบเก่าที่ stream ทีละคำ  ///
    ///////////////
    
    // const result = await agent.invoke(
    //   { messages: langchainMessages },
    // );
    
    // async function* createMessageStream() {
    //   // ดึง message สุดท้าย (คำตอบจาก AI)
    //   const lastMessage = result.messages[result.messages.length - 1];
    //   const content = typeof lastMessage.content === 'string' 
    //     ? lastMessage.content 
    //     : JSON.stringify(lastMessage.content);

    //   // แบ่ง content เป็น words และ stream ทีละคำ
    //   const words = content.split(' ');
    //   for (let i = 0; i < words.length; i++) {
    //     const word = words[i];
    //     const isLast = i === words.length - 1;
    //     const chunk = isLast ? word : word + ' '; // เพิ่มช่องว่างระหว่างคำ
        
    //     yield new AIMessageChunk({ content: chunk });
        
    //     // หน่วงเวลา 20ms ต่อคำ เพื่อให้ดูเหมือนพิมพ์จริงๆ
    //     await new Promise(resolve => setTimeout(resolve, 20));
    //   }
    // }   
    

    // Convert the LangChain stream to UI message stream
    // return createUIMessageStreamResponse({
    //     stream: toUIMessageStream(createMessageStream()),
    // });

}