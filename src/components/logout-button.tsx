'use client'

import { logout } from "@/lib/auth/client"
import { Button } from "./ui/button";

   
export default function LogoutButton() {
    const handleLogOut = () => {
        logout();
    }
    return (
        <Button className="bg-red-500 text-white px-4 py-2 rounded" onClick={handleLogOut}>
            ออกจากระบบ
        </Button>
    )
}