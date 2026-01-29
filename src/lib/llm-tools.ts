import { tool } from "langchain";
import * as z from "zod";

const getCurrentTimeTool = tool(
    () => {
        const now = new Date();
        return now.toDateString() + now.toLocaleTimeString('th-TH'); 
    },
    {
        name: 'get_current_time',
        description: 'ดูวันที่ และเวลาปัจจุบัน',
        schema: z.object({})
    }
);

const getUserDataToolSchema = z.object({
    userId: z.number().describe("รหัสพนักงาน (เช่น 16) ต้องส่งมาเสมอเมื่อถามข้อมูลส่วนตัว")
});

function getUserDataTool(currentUserId: number, userRole: string) {

return tool(
    async ({ userId }) => {
        const res = await fetch('http://localhost:3000/api/user/' + userId);

        if (res.status === 404) {
            return JSON.stringify({
                err: "NOT FOUND",
                message: "ไม่พบข้อมูลพนักงาน"
            });
        }

        if (!res.ok) {
            return JSON.stringify({
                err: "FETCH ERROR",
                message: "การดึงข้อมูลมีปัญหาจาก Server"
            });
        }

        const data = await res.json();
        
        // ถ้า role = admin อนุญาตให้ดึงข้อมูลได้ทุกคน
        if (userRole === 'admin') {
            console.log("[Tool] Admin access granted.");
        } 
        // ถ้าไม่ใช่ admin ต้องตรวจสอบว่า userId ที่ขอข้อมูลตรงกับ currentUser.id หรือไม่
        else if (!currentUserId || currentUserId !== userId) {
            return `คุณไม่มีสิทธิ์ในการเข้าถึงข้อมูลของผู้ใช้ที่มีรหัส ${userId}`;
        }

        return JSON.stringify(data);
    },
    {
        name: "get_user_data",
        description: `
           เรียกดูข้อมูลส่วนตัวของพนักงาน ใช้เมื่อผู้ใช้ถามเกี่ยวกับ:
           - เงินเดือน (salary)
           - วันลาคงเหลือ (leave days)
           - วันที่เริ่มทำงาน (start date)
           ต้องส่ง userId เสมอ (ตัวเลข เช่น 16) ห้ามเดาข้อมูล
           ตัวอย่าง: getUserDataTool(userId=16)
        `,
        schema: getUserDataToolSchema,
    }
)
} 





export { getCurrentTimeTool, getUserDataTool };