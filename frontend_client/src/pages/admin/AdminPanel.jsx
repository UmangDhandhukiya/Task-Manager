import { Button, Pagination, Stack } from "@mui/material";
import React, { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { logoutUser } from "../../appStore/authSlice";
import {
  setTasks,
  deleteTask as deleteTaskRedux,
} from "../../appStore/taskSlice";
import { Link, useNavigate } from "react-router-dom";
import TaskList from "../../components/TaskList";
import SearchFilter from "../../components/SearchFilter";
import { getAuth } from "firebase/auth";
import { collection, onSnapshot } from "firebase/firestore";
import { db } from "../../firebase";
import jsonToCsvExport from "json-to-csv-export";
import AdminAnalysis from "../../components/AdminAnalysis";

const AdminPanel = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();

  const { tasks } = useSelector((state) => state.tasks);

  //filter
  const [search, setSearch] = useState("");
  const [status, setStatus] = useState("");
  const [dueDate, setDueDate] = useState("");

  const filteredTasks = tasks.filter((task) => {
    return (
      (task.title?.toLowerCase().includes(search.toLowerCase()) ||
        task.description?.toLowerCase().includes(search.toLowerCase())) &&
      (status === "" || task.status === status) &&
      (dueDate === "" || task.dueDate?.slice(0, 10) === dueDate)
    );
  });

  //pagintion
  const [page, setPage] = useState(1);

  const dataPerPage = 10;

  const totalPages = Math.ceil(filteredTasks.length / dataPerPage);

  const startIndex = (page - 1) * dataPerPage;

  const endIndex = startIndex + dataPerPage;

  const currentTasks = filteredTasks.slice(startIndex, endIndex);

  const handlePageChange = (event, value) => {
    setPage(value);
  };

  //snapshot use
  const taskData = collection(db, "tasks");

  useEffect(() => {
    const unsubscribe = onSnapshot(taskData, (snapshot) => {
      const tasks = snapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      }));

      dispatch(setTasks(tasks));
    });

    return () => unsubscribe();
  }, [dispatch]);

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

  const handleExportCsv = () => {
    const data = tasks.map((task) => ({
      title: task.title,

      description: task.description,

      status: task.status,

      assignedTo: task.assignedTo,

      dueDate: task.dueDate,
    }));

    jsonToCsvExport({
      data: data,

      filename: "tasks",

      delimiter: ",",
    });
  };

  return (
    <div>
      <nav className="bg-gray-400 flex justify-between items-center px-5 py-3">
        <h1 className="text-black text-2xl font-bold">Admin Panel</h1>

        <div className="flex gap-3 items-center">
          <Button
            variant="contained"
            sx={{
              backgroundColor: "black",

              color: "white",
            }}
            onClick={handleLogout}
          >
            Log Out
          </Button>
        </div>
      </nav>

      <main className="max-w-4xl mx-auto px-4">
        <div className="flex flex-wrap-reverse justify-between items-center mt-6">
          <h1 className="mt-3 sm:mt-0 text-3xl font-bold">All User Tasks</h1>

          <div className="flex gap-2">
            <Button variant="outlined" color="secondary">
              <Link
                to="/addTask"
                style={{
                  color: "secondary",

                  textDecoration: "none",
                }}
              >
                Add Task
              </Link>
            </Button>

            <Button
              variant="contained"
              color="secondary"
              onClick={handleExportCsv}
            >
              Download Csv
            </Button>
          </div>
        </div>

        <AdminAnalysis/>

        <SearchFilter
          search={search}
          status={status}
          dueDate={dueDate}
          onSearchChange={setSearch}
          onStatusChange={setStatus}
          onDateChange={setDueDate}
        />

        <TaskList
          tasks={currentTasks}
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

export default AdminPanel;
