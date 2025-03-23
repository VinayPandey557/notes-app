import React from 'react'
import { BrowserRouter as Router,Routes,Route } from 'react-router-dom'
import  Home from './Pages/Home/Home'
import { Login } from './Pages/Login/Login'
import { Signup } from "./Pages/Signup/Signup"




const App = () => {
  return (
    <Router>
     <Routes>
      <Route path='/dashboard' exact element={<Home/>} />
      <Route path='/login' exact element={<Login/>} />
      <Route path='/signup' exact element={<Signup/>} />
    </Routes>
  </Router>
  )
}



export default App

