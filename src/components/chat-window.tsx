"use client"

export function ChatWindow({email,id}: {email:string,id:number|null}) {
  return (
    <>
      <div> Email: {email}  รหัสผู้ใช้:  {id}</div>
    </>
  )
}