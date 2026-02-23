// appStore/taskSlice.js
import { createSlice } from "@reduxjs/toolkit";

const initialState = {
  tasks: [],
};

const taskSlice = createSlice({
  name: "tasks",
  initialState,
  reducers: {
    setTasks: (state, action) => {
      state.tasks = action.payload;
    },

    addTask: (state, action) => {
      state.tasks.push(action.payload);
    },

    updateTask: (state, action) => {
      const index = state.tasks.findIndex(
        (task) => task.id === action.payload.id
      );

      if (index !== -1) {
        state.tasks[index] = action.payload;
      }
    },

    deleteTask: (state, action) => {
      state.tasks = state.tasks.filter(
        (task) => task.id !== action.payload
      );
    },
  },
});

export const { setTasks, addTask, updateTask, deleteTask } =
  taskSlice.actions;

export default taskSlice.reducer;