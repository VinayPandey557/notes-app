import React from 'react'
import { useState } from 'react'
import Navbar from '../../components/Navbar'
import { PasswordInput } from '../../components/Input/PasswordInput'
import { Link } from 'react-router-dom'
import { validateEmail } from '../../utils/helper'
import { useNavigate } from 'react-router-dom'
import axios from "axios";
import axiosInstance from '../../utils/axiosInstance'


export const Signup = () => {
   const [password , setPassword] = useState("");
   const [email, setEmail] = useState("");
   const [name , setName] = useState("");
   const [error, setError] = useState(null);
   const navigate = useNavigate();

  const handleSignup = async(e) => {
     e.preventDefault();
     if(!name) {
      setError("Please enter your name");
      return;
     }

     if(!validateEmail(email)) {
      setError("Please enter a valid email address.");
      return;
     }

     if(!password) {
      setError("Please enter a password");
      return
     }
    setError("")
    try {
        const response = await axiosInstance.post("/create-account", {
         name,
         email,
         password
        });
        if(response.data.error){
          setError(response.data.message);
          return;
        }
        localStorage.setItem("token", response.data.token)
        alert("SignUp sucessfull");
        navigate("/dashboard")
    } catch(err){
      setError("Invalid credentials")
    }
  }
  return (
    <>
    <Navbar/>
    <div>
      <div className='flex items-center justify-center mt-28'>
        <div className='w-96 border rounded bg-white px-7 py-10'>
         <form onSubmit={handleSignup}>
          <h4 className='text-2xl mb-7'>Signup</h4>

              <input 
                type='text'
                placeholder='name' 
                className='w-full text-sm bg-transparent border-[1.5px] px-5 py-3 rounded mb-4 outline-none'
                value={name}
                onChange={(e) => setName(e.target.value)}
              
              />
              <input 
                 type='text'
                 placeholder='Email' 
                 className='w-full text-sm bg-transparent border-[1.5px] px-5 py-3 rounded mb-4 outline-none'
                 value={email}
                 onChange={(e) => setEmail(e.target.value)}
               
               />
                   
               <PasswordInput 
                 value={password}
                 onChange={(e) => setPassword(e.target.value)}
                />

               {error && <p className='text-red-500 text-xs'>{error}</p>}
                <button className='w-full bg-blue-500 text-sm text-white p-2 rounded my-1 hover:bg-blue-600'>
                  Create account 
                </button>

                <p className='text-sm text-center mt-4'>
                  Already have an account?{" "}
                  <Link to="/login" className='font-medium text-blue-500 underline hover:text-blue-600'>Login</Link> 
                </p>
         </form>
        </div>
      </div>
    </div>
    </>
  )
}
