import admin from "../../lib/firebase";
import { NextResponse } from "next/server";

const db = admin.firestore();
const { FieldValue } = admin.firestore;

export async function POST(req) {
  try {
    const authHeader = req.headers.get("authorization");

    if (!authHeader || !authHeader.startsWith("Bearer "))
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const token = authHeader.split("Bearer ")[1];
    const decoded = await admin.auth().verifyIdToken(token);

    const userDoc = await db.collection("users").doc(decoded.uid).get();
    if (!userDoc.exists)
      return NextResponse.json({ error: "User not found" }, { status: 404 });

    const body = await req.json();

    // ✅ Validation
    if (!body.title || body.title.length < 3)
      return NextResponse.json(
        { error: "Title must be at least 3 characters" },
        { status: 400 }
      );

    if (!body.description)
      return NextResponse.json(
        { error: "Description is required" },
        { status: 400 }
      );

    if (!body.dueDate || new Date(body.dueDate) <= new Date())
      return NextResponse.json(
        { error: "Due date must be future date" },
        { status: 400 }
      );

    // ✅ If assigned user exists check
    if (body.assignedTo) {
      const assignedUser = await db
        .collection("users")
        .doc(body.assignedTo)
        .get();

      if (!assignedUser.exists)
        return NextResponse.json(
          { error: "Assigned user not found" },
          { status: 400 }
        );
    }

    const taskRef = await db.collection("tasks").add({
      title: body.title,
      description: body.description,
      status: body.status || "todo",
      dueDate: body.dueDate,
      ownerId: decoded.uid,
      assignedTo: body.assignedTo || null,
      createdAt: FieldValue.serverTimestamp(),
    });

    return NextResponse.json(
      {
        success: true,
        id: taskRef.id,
      },
      { status: 201 }
    );
  } catch (err) {
    return NextResponse.json(
      { error: err.message },
      { status: 500 }
    );
  }
}

//get

export async function GET(req) {
  try {
    const authHeader = req.headers.get("authorization");

    if (!authHeader || !authHeader.startsWith("Bearer "))
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const token = authHeader.split("Bearer ")[1];
    const decoded = await admin.auth().verifyIdToken(token);

    const userDoc = await db.collection("users").doc(decoded.uid).get();

    if (!userDoc.exists)
      return NextResponse.json({ error: "User not found" }, { status: 404 });

    const role = userDoc.data().role;

    let tasks = [];

    if (role === "admin") {
      const snapshot = await db.collection("tasks").get();

      tasks = snapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      }));
    } else {
      const ownSnapshot = await db
        .collection("tasks")
        .where("ownerId", "==", decoded.uid)
        .get();

      const assignedSnapshot = await db
        .collection("tasks")
        .where("assignedTo", "==", decoded.uid)
        .get();

      const taskMap = new Map();

      ownSnapshot.docs.forEach((doc) => {
        taskMap.set(doc.id, { id: doc.id, ...doc.data() });
      });

      assignedSnapshot.docs.forEach((doc) => {
        taskMap.set(doc.id, { id: doc.id, ...doc.data() });
      });

      tasks = Array.from(taskMap.values());
    }

    return NextResponse.json(tasks, { status: 200 });
  } catch (err) {
    return NextResponse.json(
      { error: err.message },
      { status: 500 }
    );
  }
}