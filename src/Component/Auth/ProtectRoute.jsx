import React from 'react'
import Login from '../Login/Login.jsx'
import { Outlet } from 'react-router-dom'

const ProtectRoute =()=> {
  return(<>{
    localStorage.getItem("authToken")?<Outlet/>:<Login/>
  }
  </>)
}
 

export default ProtectRoute