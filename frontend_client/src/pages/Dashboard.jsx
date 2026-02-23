import { Button, Pagination, Stack } from "@mui/material";
import React, { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { logoutUser } from "../appStore/authSlice";
import { setTasks, deleteTask as deleteTaskRedux } from "../appStore/taskSlice";
import { Link, useNavigate } from "react-router-dom";
import TaskList from "../components/TaskList";
import { auth, db } from "../firebase";
import { getAuth, onAuthStateChanged } from "firebase/auth";
import SearchFilter from "../components/SearchFilter";
import { collection, onSnapshot } from "firebase/firestore";

const Dashboard = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { user } = useSelector((state) => state.auth);
  const { tasks } = useSelector((state) => state.tasks);

  const [search, setSearch] = useState("");
  const [status, setStatus] = useState("");
  const [dueDate, setDueDate] = useState("");

  const filteredTasks = tasks.filter((task) => {
    return (
      (task.title.toLowerCase().includes(search.toLowerCase()) ||
        task.description.toLowerCase().includes(search.toLowerCase())) &&
      (status === "" || task.status === status) &&
      (dueDate === "" || task.dueDate?.slice(0, 10) === dueDate)
    );
  });

  const [page, setpage] = useState(1);
  const dataPerPage = 10;
  const totalPages = Math.ceil(tasks.length / dataPerPage);
  const startIndex = (page - 1) * dataPerPage;
  const endIndex = startIndex + dataPerPage;
  const currentTasks = filteredTasks.slice(startIndex, endIndex);

  const handlePageChange = (event, value) => {
    setpage(value);
  };

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      if (!user) return;
      try {
        const token = await user.getIdToken();
        const res = await fetch("http://localhost:3000/api/tasks", {
          method: "GET",
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });
        const data = await res.json();
        if (!res.ok) {
          throw new Error(data.error);
        }
        dispatch(setTasks(data.tasks));
      } catch (error) {
        console.log("Error fetching tasks:", error.message);
      }
    });
    return () => unsubscribe();
  }, [dispatch]);

  //delete task
  const handleDelete = async (id) => {
    try {
      const token = await getAuth().currentUser.getIdToken();

      const res = await fetch(`http://localhost:3000/api/tasks/${id}`, {
        method: "DELETE",
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error);
      }

      dispatch(deleteTaskRedux(id));
    } catch (error) {
      console.log("Error deleting task:", error.message);
    }
  };

  const handleLogout = () => {
    dispatch(logoutUser());
    navigate("/", { replace: true });
  };

  return (
    <div>
      <nav className="bg-gray-400 flex justify-between items-center px-5 py-3">
        <h1 className="text-white text-2xl font-bold">Task Manager</h1>

        <div className="flex gap-3 items-center">
          <Button variant="contained" color="error" onClick={handleLogout}>
            Log Out
          </Button>
        </div>
      </nav>

      <main className="max-w-4xl mx-auto px-4">
        <div className="flex justify-between items-center mt-6">
          <div>
            <h1 className="text-xl">
              Welcome, {user?.user?.name || user?.name}
            </h1>
            <h1 className="text-3xl font-bold">Your Tasks</h1>
          </div>

          <Button variant="contained" color="secondary">
            <Link
              to="/addTask"
              style={{ color: "white", textDecoration: "none" }}
            >
              Add Task
            </Link>
          </Button>
        </div>

        <SearchFilter
          search={search}
          status={status}
          dueDate={dueDate}
          onSearchChange={setSearch}
          onStatusChange={setStatus}
          onDateChange={setDueDate}
        />

        <TaskList
          tasks={filteredTasks}
          onDelete={handleDelete}
          onEdit={(task) => navigate(`/editTask/${task.id}`)}
        />

        <Stack spacing={2} alignItems="center" mt={3}>
          <Pagination
            count={totalPages}
            page={page}
            onChange={handlePageChange}
          />
        </Stack>
      </main>
    </div>
  );
};

export default Dashboard;
