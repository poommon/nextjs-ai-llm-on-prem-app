
//http://192.168.1.42:3000/dashboard

import { ChatWindow } from "@/components/chat-window";
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
       <div className="text-right"><LogoutButton></LogoutButton> </div>

      <div className="text-green-600 text-center -2 mt-10"> 
        Hello dashboard</div> 
    {/* <div>email = {user?.email} ::  ID = {user?.id}</div>
    <div>{JSON.stringify(user)}</div>  */}
    <ChatWindow email={user.email} id ={user.id}></ChatWindow>
    
   
    </main>
  );
}