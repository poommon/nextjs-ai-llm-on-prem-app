import { tool } from "langchain";
import * as z from "zod";

const getCurrentTime = tool(
    (_) => {
        const now = new Date();
        return now.toDateString() + now.toLocaleTimeString('th-TH'); 
    },
    {
        name: 'get_current_time',
        description: 'ดูวันที่ และเวลาปัจจุบัน',
        schema: z.object({})
    }
);

export { getCurrentTime };