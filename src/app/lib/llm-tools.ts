import { tool } from "langchain";
import * as z from "zod";

export const getCurrentTime = tool(
    ()=>{
        const now = new Date();
        return `วันที่ ${now.toLocaleDateString('th-TH')} เวลา ${now.toLocaleTimeString('th-TH')}`;
    },{
        name : 'get_current_time',
        description : 'ดูวันที่ และเวลาปัจจุบัน',
        schema : z.object({})
    } 

)