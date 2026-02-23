import admin from "../../lib/firebase";
import { NextResponse } from "next/server";

const db = admin.firestore();

export async function POST(req) {
  try {
    const authHeader = req.headers.get("authorization");

    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      return NextResponse.json(
        { success: false, error: "Unauthorized" },
        { status: 401 },
      );
    }

    const token = authHeader.split("Bearer ")[1];

    const decoded = await admin.auth().verifyIdToken(token);

    const body = await req.json();

    await db.collection("users").doc(decoded.uid).set({
      uid: decoded.uid,

      email: decoded.email,

      name: body.name,

      role: "user",

      createdAt: new Date(),
    });

    return NextResponse.json({
      success: true,

      uid: decoded.uid,
    });
  } catch (error) {
    return NextResponse.json(
      {
        success: false,

        error: error.message,
      },

      { status: 500 },
    );
  }
}

export async function GET(req) {
  try {
    const authHeader = req.headers.get("authorization");

    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const token = authHeader.split("Bearer ")[1];

    await admin.auth().verifyIdToken(token);

    const snapshot = await db.collection("users").get();

    const users = snapshot.docs.map((doc) => ({
      id: doc.id,

      ...doc.data(),
    }));

    return NextResponse.json(users);
  } catch (error) {
    return NextResponse.json(
      { error: error.message },

      { status: 500 },
    );
  }
}
