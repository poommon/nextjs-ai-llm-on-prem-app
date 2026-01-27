import { NextResponse } from "next/server";


//http://localhost:3000/api
export function GET() {
    return NextResponse.json({ message: "BackendAPI is working!" });
}