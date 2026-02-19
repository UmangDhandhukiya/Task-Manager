import React from 'react'

const Login = () => {
  return (
    <div className='flex justify-center items-center min-h-screen'>
     <form action="" method='POST' className='w-72 lg:w-2xl border border-black rounded-2xl p-4  mx-auto my-0'>
        <div>
          <label htmlFor="email" className='pb-1'>Email</label><br/>
          <input type="email" name="email" id="email" className='border border-black rounded-sm px-4 py-1 w-full'/> 
        </div> 
        <div>
          <label htmlFor="password" className='pb-1'>Password</label><br/>  
          <input type="password" name="password" id="password" className='border border-black rounded-sm px-4 py-1 w-full'/> 
        </div> 
        <button type='submit' className='w-1/2 bg-gray-700 text-gray-200 rounded-md'>Login</button>
     </form>
    </div>
  )
}

export default Login