import db from "@/app/lib/firebase"
import { NextResponse } from "next/server"

//add user like controller
export async function POST(req){
    try{
        const body = await req.json()
        const userData = await db.collection("users").add({
            email: body.email,
            password: body.password,
            role: body.role,
        })

        return NextResponse.json({
            success:true,
            id:userData.id
        })
    }catch(error){
        return NextResponse.json({
            success:false,
            error: error.message
        })
    }
}

//get user
export async function GET(){
    const allUser = await db.collection("users").get()
    const users = allUser.docs.map(user => ({
        id:user.id,
        ...user.data()
    })) 

    return NextResponse.json(users)
}