import { getCurrentTimeTool } from "@/lib/llm-tools";
import { ChatOllama } from "@langchain/ollama";
import { createAgent, HumanMessage, SystemMessage } from "langchain";
import { NextResponse } from "next/server";

// สร้าง agent ด้วย crateAgent
    const llm = new ChatOllama({
        model: 'scb10x/typhoon2.5-qwen3-4b:latest',
        temperature: 0.2,
        maxRetries: 3
    });
    const agent = createAgent({ 
          model: llm 
          , systemPrompt: 'คุณเป็นผู้จัดการฝ่าย HR คอยตอบคำถามให้กับพนักงานในเรื่องนโยบายการลา สวัสดิการต่างๆ'
        , tools : [ getCurrentTimeTool] // เพิ่มเครื่องมือถ้ามี
    });


// http://localhost:3000/api/chat-agent
export async function POST() {

    const response = await agent.invoke({
        messages: [
           // new SystemMessage('คุณเป็นผู้จัดการฝ่าย HR คอยตอบคำถามให้กับพนักงานในเรื่องนโยบายการลา สวัสดิการต่างๆ')
            // new HumanMessage('สวัสดี ปกติการลาพักผ่อน ในประเทศ ลาได้กี่วัน') 
              new HumanMessage('สวัสดีครับ วันนี้วันที่เท่าไหร่ครับ')

        ]} ,
        {recursionLimit:20}
    ); 

    return NextResponse.json({ llm_message: response.messages[response.messages.length - 1].content });
}