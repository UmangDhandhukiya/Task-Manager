import admin from "../../../lib/firebase";
import { NextResponse } from "next/server";

const db = admin.firestore();

export async function PUT(req, { params }) {
  try {
    const authHeader = req.headers.get("authorization");

    const token = authHeader.split("Bearer ")[1];

    const decoded = await admin.auth().verifyIdToken(token);

    const userDoc = await db.collection("users").doc(decoded.uid).get();

    const role = userDoc.data().role;

    const taskRef = db.collection("tasks").doc(params.id);

    const task = await taskRef.get();

    if (!task.exists) return NextResponse.json({ error: "Task not found" });

    if (role !== "admin" && task.data().ownerId !== decoded.uid) {
      return NextResponse.json({
        error: "Permission denied",
      });
    }

    const body = await req.json();

    await taskRef.update(body);

    return NextResponse.json({
      success: true,
    });
  } catch (err) {
    return NextResponse.json({
      error: err.message,
    });
  }
}


//delete
export async function DELETE(req, { params }) {
  try {
    const authHeader = req.headers.get("authorization");

    const token = authHeader.split("Bearer ")[1];

    const decoded = await admin.auth().verifyIdToken(token);

    const userDoc = await db.collection("users").doc(decoded.uid).get();

    const role = userDoc.data().role;

    const taskRef = db.collection("tasks").doc(params.id);

    const task = await taskRef.get();

    if (role !== "admin" && task.data().ownerId !== decoded.uid) {
      return NextResponse.json({
        error: "Permission denied",
      });
    }

    await taskRef.delete();

    return NextResponse.json({
      success: true,
    });
  } catch (err) {
    return NextResponse.json({
      error: err.message,
    });
  }
}
