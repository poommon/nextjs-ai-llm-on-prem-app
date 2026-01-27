import { ChatOllama } from "@langchain/ollama";
import { NextResponse } from "next/server";

// http://localhost:3000/api/chat
export async function POST() {
    const llm = new ChatOllama({
        model: 'scb10x/typhoon2.5-qwen3-4b:latest',
        temperature: 0.2,
        maxRetries: 3
    });

    const response = await llm.invoke([
        { role: 'system', content: 'คุณเป็นผู้จัดการฝ่าย HR คอยตอบคำถามให้กับพนักงานในเรื่องนโยบายการลา สวัสดิการต่างๆ' },
        { role: 'human', content: 'ปกติการลาพักผ่อนในประเทศไทย ลาได้กี่วัน' }
    ]); 

    return NextResponse.json({ llm_message: response.content });
}