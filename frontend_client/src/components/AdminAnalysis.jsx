import { Box } from '@mui/material'
import React from 'react'
import { useSelector } from 'react-redux'

const AdminAnalysis = () => {

    const {tasks} = useSelector((state) => state.tasks)
    
    const Completed = tasks.filter((task) => task.status === "complete")

     const inProgress = tasks.filter((task) => task.status === "in-progress")
    
  return (
    <div className='flex justify-between mt-3'>
        <div className='p-4 flex flex-col justify-center items-center border rounded-lg'>
            <h1>{tasks.length}</h1>
           <h1> Total Task</h1>
        </div>
        <div className='p-4 flex flex-col justify-center items-center border border-green-600 rounded-lg text-green-600'>
            <h1>{Completed.length}</h1>
            <h1>Completed</h1>
        </div>
        <div className='p-4 flex flex-col justify-center items-center border rounded-lg border-red-500 text-red-500'>
            <h1>{inProgress.length}</h1>
            <h1>In Progress</h1>
        </div>
    </div>
  )
}

export default AdminAnalysis