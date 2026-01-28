import { getCurrentTime } from "@/lib/llm-tools";
import { ChatOllama } from "@langchain/ollama";
import { BaseMessage, HumanMessage, SystemMessage, ToolMessage } from "langchain";
import { NextResponse } from "next/server";

const llm = new ChatOllama({
    model: "scb10x/typhoon2.5-qwen3-4b:latest",
    temperature: 0.2,
    maxRetries: 3,

});

const llmWithTools = llm.bindTools([getCurrentTime]);

export async function POST() {
    const tools = { get_current_time: getCurrentTime };

    const messages: BaseMessage[] = [
        new SystemMessage(
            "คุณเป็นผู้จัดการฝ่าย HR คอยตอบคำถามให้กับพนักงานในเรีื่องนโยบายการลา และสวัสดิการต่างๆ ของบริษัท",
        ),
        new HumanMessage("วันนี้วันที่เท่าไหร่?"),
    ];

    let response = await llmWithTools.invoke(messages);

    // Loop เพื่อจัดการ tool calls จนกว่า model ไม่มี tool calls อีก
    while (response.tool_calls && response.tool_calls.length > 0) {
        // เก็บข้อความจาก model ที่มี tool calls
        messages.push(response);

        for (const toolCall of response.tool_calls) {
            const tool = tools[toolCall.name as keyof typeof tools];
            if (!tool) {
                throw new Error(`Unknown tool: ${toolCall.name}`);
            }

            const toolArgs =
                typeof toolCall.args === "string"
                    ? (() => {
                          try {
                              return JSON.parse(toolCall.args);
                          } catch {
                              return {};
                          }
                      })()
                    : toolCall.args ?? {};

            const toolResult = await tool.invoke(toolArgs);
            const toolContent =
                typeof toolResult === "string"
                    ? toolResult
                    : JSON.stringify(toolResult) ?? "";

            messages.push(
                new ToolMessage({
                    content: toolContent,
                    tool_call_id: toolCall.id ?? "",
                    name: toolCall.name,
                }),
            );
        }

        // เรียก model อีกครั้ง
        response = await llmWithTools.invoke(messages);
    }


    return NextResponse.json({ llm_message: response.content });
}