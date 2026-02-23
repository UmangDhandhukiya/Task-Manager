import admin from "../../../lib/firebase";
import { NextResponse } from "next/server";

const db = admin.firestore();

//update
export async function PUT(req, { params }) {
  try {
    const taskId = (await params).id
    const authHeader = req.headers.get("authorization");

    const token = authHeader.split("Bearer ")[1];

    const decoded = await admin.auth().verifyIdToken(token);

    const userDoc = await db.collection("users").doc(decoded.uid).get();

    const role = userDoc.data().role;

    const taskRef = db.collection("tasks").doc(taskId);

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

//get single task

export async function GET(req, {params}) {
  try {
    const taskId = (await params).id

    const authHeader = req.headers.get("authorization");

    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const token = authHeader.split("Bearer ")[1];

    const decoded = await admin.auth().verifyIdToken(token);

    const taskRef = db.collection("tasks").doc(taskId);

    const task = await taskRef.get();

    if (!task.exists) {
      return NextResponse.json({ error: "Task not found" }, { status: 404 });
    }

    return NextResponse.json({
      id: task.id,

      ...task.data(),
    });
  } catch (err) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}

//delete
export async function DELETE(req, { params }) {
  try {
    const taskId = (await params).id;
    const authHeader = req.headers.get("authorization");

    const token = authHeader.split("Bearer ")[1];

    const decoded = await admin.auth().verifyIdToken(token);

    const userDoc = await db.collection("users").doc(decoded.uid).get();

    const role = userDoc.data().role;

    const taskRef = db.collection("tasks").doc(taskId);

    const task = await taskRef.get();

    console.log(role, task.data().ownerId, decoded.uid);
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
