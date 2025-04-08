import React from 'react'
import {ToastContainer} from 'react-toastify';
import {createBrowserRouter,RouterProvider} from 'react-router-dom'
import AddUser from './Component/AddUser/AddUser.jsx';
import ListUser from './Component/ListUser/ListUser.jsx';
import PageNotFound from './Component/PageNotFound/PageNotFound.jsx';
import Navbar from './Component/Navbar/Navbar.jsx';
import Login from './Component/Login/Login.jsx';
import ProtectRoute from './Component/Auth/ProtectRoute.jsx';
import Signup from './Component/Signup/Signup.jsx';
import EditUser from './Component/EditUser/EditUser.jsx';

const App = () => {

  const route = createBrowserRouter([
    {
      path:"/login",
      element:<Login/>
    },
    {
      path:'/signup',
      element:<Signup/>
    },

    {
      path:'*',
      element:<PageNotFound/>
    },
    {
      path:"/",
      element:<ProtectRoute/>,
      children:[
        {
          path:'/',
          element:<Navbar/>
          ,
          children:[
            {
              path:'/',
              element:<AddUser/>
            },
            {
              path:'/listuser',
              element:<ListUser/>
            },
            {
              path:'/edituser/:id',
              element:<EditUser/>
            }
          ]
        }
       
      ]
    }

    
  ])
  return (

    <>
    <ToastContainer/>
    <RouterProvider router={route}/>
    </>
  )
}

export default App