import { NextResponse } from "next/server";


//http://192.168.1.42:3000/api
export function GET() {
    return NextResponse.json({ message: "BackendAPI is working!" });
}