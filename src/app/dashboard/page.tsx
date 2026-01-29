
//http://192.168.1.42:3000/dashboard

import ChatWindowV19 from "@/components/chat-window";
// import { ChatWindowV2 } from "@/components/chat-window-v2";
import LogoutButton from "@/components/logout-button";
import { getServerUser } from "@/lib/auth"; 
import { redirect } from "next/navigation";

export default async function Dashboard() { 

  const user  = await getServerUser();

  if(!user){
    redirect("/login"); 
  }

 
  return (
    <main>  
    {/* <ChatWindowV2 email={user.email} id ={user.id}></ChatWindowV2> */}
     <ChatWindowV19 email={user.email} id ={user.id}></ChatWindowV19> 
    </main>
  );
}