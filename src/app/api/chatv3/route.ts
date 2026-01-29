import { ChatOllama } from "@langchain/ollama";
import { createAgent } from "langchain";
import { NextRequest } from "next/server";
import { toBaseMessages, toUIMessageStream } from '@ai-sdk/langchain';
import { createUIMessageStreamResponse, UIMessage } from 'ai';

import { getCurrentTimeTool, getUserDataTool } from "@/lib/llm-tools";
import { getServerUser } from "@/lib/auth/server";
import { redirect } from "next/navigation";
import { MultiServerMCPClient } from "@langchain/mcp-adapters";

// สร้าง agent ด้วย createAgent
const llm = new ChatOllama({
        // model: 'qwen3-vl:4b',
        model: 'gpt-oss:20b-cloud',
        temperature: 0.2,
        maxRetries: 3
});

// Tool จาก MCP Server
async function getMCPTools() {
    const mcpClient = new MultiServerMCPClient({
        product: {
            transport: 'http',
            url: 'http://localhost:3001/mcp', // https://mcp-server-app-eta.vercel.app/mcp
        },
    });
    const mcpTools = await mcpClient.getTools();
    return mcpTools;
}


// async function getMCPTools() {
//     const mcpClient = new MultiServerMCPClient({
//         product: {
//             transport: 'http',
//             url: 'http://localhost:3001/mcp',
//         }
//     });
//     const mcpTools = await mcpClient.getTools();
    
//     // Wrap MCP tools เพื่อให้ return เป็น string เสมอ
//     // แก้ปัญหา "Non string tool message content is not supported"
//     const wrappedTools = mcpTools.map((mcpTool) => {
//         const originalInvoke = mcpTool.invoke.bind(mcpTool);

//         mcpTool.invoke = async (input: any, config?: any) => {
//             const result = await originalInvoke(input, config);
//             // ถ้า result ไม่ใช่ string ให้แปลงเป็น JSON string
//             if (typeof result === 'string') {
//                 return result;
//             }
//             return JSON.stringify(result);
//         };
//         return mcpTool;
//     });
    
//     return wrappedTools;
// }

// สร้าง dynamic system prompt
function getDynamicPrompt(userId: number, userRole: string) {
    let prompt = process.env.SYSTEM_PROMPT;
    prompt = prompt?.replace('{userId}', userId.toString());
    if (userRole === 'admin') {
        prompt += `\n\n สิทธิ์: ผู้ดูแลระบบ สามารถใช้งานได้ทุกฟังก์ชัน สามารถค้นหาข้อมูลพนักงานได้ทุกคน ทุกรหัสพนักงาน`
    }
    console.log(prompt);
    return prompt;
}

// http://localhost:3000/api/chatv3
export async function POST(req: NextRequest) {
    const currentUser = await getServerUser();
    if (!currentUser) {
        redirect('/login');
    }

    const { messages }: { messages: UIMessage[] } = await req.json();

    const langchainMessages = await toBaseMessages(messages);

    // Load Tools Local + MCP
    const mcpTools = await getMCPTools(); 

    const allTools = [...mcpTools, getCurrentTimeTool, getUserDataTool(currentUser.id, currentUser.role)];

    const agent = createAgent({
        model: llm,
        systemPrompt: getDynamicPrompt(currentUser.id, currentUser.role),
        tools: allTools
    });

    const result = agent.streamEvents(
      { messages: langchainMessages },
      { version: 'v2' }
    );
    
    // Convert the LangChain stream to UI message stream
    return createUIMessageStreamResponse({
        stream: toUIMessageStream(result),
    });

}