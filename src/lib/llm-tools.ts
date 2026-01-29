import { error } from "console";
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

const getUserDataTool = tool(
    async ({ userId }) => {
        const res = await fetch('http://localhost:3000/api/user/' + userId);

        
       if(res.status === 404){
         return JSON.stringify({ 
            error: "ไม่พบข้อมูลผู้ใช้"
            , message : `ไม่พบข้อมูลพนักงานที่มีรหัส ${userId}`

          });
       }  
 
       if (!res.ok) {
        return JSON.stringify({ 
            error: "เกิดข้อผิดพลาดในการดึงข้อมูล"
            ,message : `สถานะการตอบกลับ ${res.status} ${res.statusText}`
        }); 
         }

          // ตรวจสอบสิทธิ์ให้เข้าถึงข้อมูลเฉพาะของตัวเอง
        const data = await res.json();
        const isOwnData = (userId === data.userId); // สมมติ userId มาจาก session หรือ token
         console.log(data,isOwnData)

       if (!isOwnData) {
               return JSON.stringify({ 
            error: "Access Denied"
            , message : `ไม่อนุญาติให้เข้าถึงข้อมูลบุคลลอื่น ${userId}`

          });
       }  

         return JSON.stringify(await res.json());
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
);


export { getCurrentTimeTool, getUserDataTool };