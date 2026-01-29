import { NextRequest, NextResponse } from "next/server";
import { db } from "@/db";
import { staffTable } from "@/db/schema";
import { eq } from "drizzle-orm";

// http://localhost:3000/api/user/44
export async function GET(req: NextRequest, {params}: {params: Promise<{id: string}>}) {
    try {

        const userId = (await params).id;
        const userIdInt = parseInt(userId, 10);

        if (isNaN(userIdInt)) {
            return NextResponse.json({ message: 'รหัสผู้ใช้ไม่ถูกต้อง' }, {status: 400});
        }

        // Query staff data using Drizzle ORM
        const staff = await db
            .select()
            .from(staffTable)
            .where(eq(staffTable.userId, userIdInt))
            .limit(1);

        if (!staff || staff.length === 0) {
            return NextResponse.json({ message: 'ไม่พบข้อมูลผู้ใช้' }, {status: 404});
        }

        return NextResponse.json(staff[0]);

    } catch (error) {
        console.error('Error fetching user data:', error);
        return NextResponse.json({ message: 'เกิดข้อผิดพลาดในการดึงข้อมูล' }, {status: 500});   
    }
}