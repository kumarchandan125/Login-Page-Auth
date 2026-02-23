import React, { useContext, useState } from 'react'
import { assets } from '../assets/assets'
import { useNavigate } from 'react-router-dom'
import { AppContext } from '../context/AppContext'
import axios from 'axios'
import { toast } from 'react-toastify'

const Login = () => {
    const navigate = useNavigate()
    const { backendUrl, setIsLoggedIn,getUserData } = useContext(AppContext)
    const [state, setState] = useState('Sign Up')
    const [name, setName] = useState('')
    const [email, setEmail] = useState('')
    const [password, setPassword] = useState('')

    const onSubmitHandler = async (e) => {
        try {
            e.preventDefault()
            axios.defaults.withCredentials = true
            if (state === 'Sign Up') {
                const {data} = await axios.post(backendUrl + '/api/auth/register', {
                    name,
                    email,
                    password
                })
                if (data.success) {
                    setIsLoggedIn(true)
                    getUserData()
                    navigate('/')
                }else{
                    toast.error(data.message)
                }

            } else {
                const {data} = await axios.post(backendUrl + '/api/auth/login', {
                    email,
                    password
                })
                if (data.success) {
                    setIsLoggedIn(true)
                    getUserData()
                    navigate('/')
                }else{
                    toast.error(data.message)
                }
            }
        } catch (error) {
            toast.error(error.message)
        }
    }
    return (
        // Login Form
        <div className='flex items-center justify-center min-h-screen px-6 sm:px-0 bg-linear-to-br from-blue-200 to-purple-400'>
            <img onClick={() => navigate('/')} src={assets.logo} alt="logo" className="absolute left-5 sm:left-20 top-5 w-28 sm:w-32 cursor-pointer" />
            <div className='bg-slate-900 p-10 rounded-lg shadow-lg w-full sm:w-96'>
                <h2 className='text-3xl font-semibold text-center text-white mb-3'>{state === 'Sign Up' ? 'Create Account' : 'Login'}</h2>
                <p className='text-center text-gray-300 text-sm mb-6'>{state === 'Sign Up' ? 'Create Your Account' : 'Login to your account!'}</p>
                <form onSubmit={onSubmitHandler}>
                    {state === 'Sign Up' && (<div className='mb-4 flex items-center gap-3 w-full px-5 py-2.5 rounded-full bg-[#3b4370]'>
                        <img src={assets.person_icon} alt="person icon" />
                        <input onChange={e => setName(e.target.value)} value={name} className='outline-none text-white' type="text" placeholder='Enter Your Full Name' required />
                    </div>)}
                    <div className='mb-4 flex items-center gap-3 w-full px-5 py-2.5 rounded-full bg-[#3b4370]'>
                        <img src={assets.mail_icon} alt="mail icon" />
                        <input onChange={e => setEmail(e.target.value)} value={email} className='outline-none text-white' type="email" placeholder='Enter Your Email' required />
                    </div>
                    <div className='mb-4 flex items-center gap-3 w-full px-5 py-2.5 rounded-full bg-[#3b4370]'>
                        <img src={assets.lock_icon} alt="lock icon" />
                        <input onChange={e => setPassword(e.target.value)} value={password} className='outline-none text-white' type="password" placeholder='Enter Your Password' required />
                    </div>
                    <p onClick={() => navigate('/reset-password')} className='text-sm mb-4 text-blue-400 cursor-pointer'>Forgot Password?</p>
                    <button className='w-full py-2.5 rounded-full bg-linear-to-r from-indigo-500 to-indigo-900 text-white font-medium cursor-pointer'>{state}</button>
                </form>
                {state === 'Sign Up' ? (
                    <p className='text-gray-400 text-center text-xs mt-4'>Already have
                        an account? {''}
                        <span onClick={() => setState('Login')} className='text-blue-400 underline font-medium 
                        cursor-pointer'>Login Here</span>
                    </p>
                ) : (
                    <p className='text-gray-400 text-center text-xs mt-4'>Don't have an account? {''}
                        <span onClick={() => setState('Sign Up')} className='text-blue-400 underline font-medium cursor-pointer'>Sign Up Here</span>
                    </p>
                )}


            </div>
        </div>
    )
}
export default Login