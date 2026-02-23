import { Button } from "@mui/material";
import React, { useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { logoutUser } from "../appStore/authSlice";
import {
  setTasks,
  deleteTask as deleteTaskRedux,
} from "../appStore/taskSlice";
import { Link, useNavigate } from "react-router-dom";
import TaskList from "../components/TaskList";

import {
  collection,
  getDocs,
  deleteDoc,
  doc,
  query,
  where,
} from "firebase/firestore";
import { db } from "../firebase";

const Dashboard = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { user, role } = useSelector((state) => state.auth);
  const { tasks } = useSelector((state) => state.tasks);

  //fetch task
  useEffect(() => {
    const fetchTasks = async () => {
      try {
        let q;

        if (role === "admin") {
          q = collection(db, "tasks");
        } else {
          q = query(
            collection(db, "tasks"),
            where("assignedToUid", "==", user.uid)
          );
        }

        const snapshot = await getDocs(q);
        const taskData = snapshot.docs.map((doc) => ({
          id: doc.id,
          ...doc.data(),
        }));

        dispatch(setTasks(taskData));
      } catch (error) {
        console.log("Error fetching tasks:", error);
      }
    };

    if (user?.uid) {
      fetchTasks();
    }
  }, [dispatch, user, role]);

  //delete task
  const handleDelete = async (id) => {
    try {
      await deleteDoc(doc(db, "tasks", id));
      dispatch(deleteTaskRedux(id));
    } catch (error) {
      console.log("Error deleting task:", error);
    }
  };

  const handleLogout = () => {
    dispatch(logoutUser());
    navigate("/", { replace: true });
  };

  return (
    <div>
      <nav className="bg-gray-400 flex justify-between items-center px-5 py-3">
        <h1 className="text-white text-2xl font-bold">
          Task Manager
        </h1>

        <div className="flex gap-3 items-center">
          <h1 className="text-white text-xl">
            Welcome, {user?.name}
          </h1>

          <Button
            variant="contained"
            color="error"
            onClick={handleLogout}
          >
            Log Out
          </Button>
        </div>
      </nav>

      <main className="max-w-4xl mx-auto px-4">
        <div className="flex justify-between items-center mt-6">
          <h2 className="text-3xl font-bold">
            Your Tasks
          </h2>

          <Button variant="contained" color="secondary">
            <Link
              to="/addTask"
              style={{ color: "white", textDecoration: "none" }}
            >
              Add Task
            </Link>
          </Button>
        </div>

        <TaskList
          tasks={tasks}
          onDelete={handleDelete}
          onEdit={(task) => navigate(`/editTask/${task.id}`)}
        />
      </main>
    </div>
  );
};

export default Dashboard;