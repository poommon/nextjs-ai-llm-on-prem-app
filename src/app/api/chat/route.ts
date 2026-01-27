import { getCurrentTime } from "@/app/lib/llm-tools";
import { ChatPromptTemplate } from "@langchain/core/prompts";
import { ChatOllama } from "@langchain/ollama";
import { NextResponse } from "next/server";

// http://localhost:3000/api/chat
export async function POST() {
    const llm = new ChatOllama({
        model: 'scb10x/typhoon2.5-qwen3-4b:latest',
        temperature: 0.2,
        maxRetries: 3
    });

    const llmWithTool = llm.bindTools([getCurrentTime]);

    const prompt = ChatPromptTemplate.fromMessages([
        ['system', 'คุณเป็นผู้จัดการฝ่าย HR คอยตอบคำถามให้กับพนักงานในเรื่องนโยบายการลา สวัสดิการต่างๆ'],
        ['human', '{question}']
    ]);

    const chain = prompt.pipe(llmWithTool);

    const response = await chain.invoke({ question: 'วันนี้วันที่เท่าไหร่ครับ' }); 

    return NextResponse.json({ llm_message: response });
}