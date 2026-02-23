import admin from "../../lib/firebase";
import { NextResponse } from "next/server";

const db = admin.firestore();

export async function POST(req) {
  try {
    const authHeader = req.headers.get("authorization");

    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const token = authHeader.split("Bearer ")[1];
    // console.log(token)
    const decoded = await admin.auth().verifyIdToken(token);
    const userDoc = await db.collection("users").doc(decoded.uid).get();

    if (!userDoc.exists) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    const Data = userDoc.data();

    const userData = {
      uid: decoded.uid,
      name: Data.name,
      email: Data.email,
      role: Data.role,
    };

    return NextResponse.json({
      success: true,
      user: userData,
    });
  } catch (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
