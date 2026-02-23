import React, { useState } from 'react'
import { assets } from '../assets/assets'
import { data, useNavigate } from 'react-router-dom'
import { useContext } from 'react'
import { AppContext } from '../context/AppContext'
import axios from 'axios'
import { toast } from 'react-toastify'

const ResetPassword = () => {
  const { backendUrl } = useContext(AppContext)
  axios.defaults.withCredentials = true




  const navigate = useNavigate()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [isEmailSent, setIsEmailSent] = useState('')
  const [otp, setOtp] = useState('')
  const [isOtpSubmited, setIsOtpSubmited] = useState(false)
  const inputRefs = React.useRef([])
  const handelInput = (e, index) => {
    if (e.target.value.length > 0 && index < inputRefs.current.length - 1) {
      inputRefs.current[index + 1].focus();
    }
  }

  const handelKeyDown = (e, index) => {
    if (e.key === 'Backspace' && e.target.value === '' && index > 0) {
      inputRefs.current[index - 1].focus();
    }
  }
  const handelPaste = (e) => {
    const paste = e.clipboardData.getData('text')
    const pasteArray = paste.split('');
    pasteArray.forEach((char, index) => {
      if (inputRefs.current[index]) {
        inputRefs.current[index].value = char
      }

    })
  }


  const onSubmitEmail = async (e) => {
    e.preventDefault();
    try {

      const { data } = await axios.post(backendUrl + '/api/auth/send-password-reset-otp', { email })
      data.success ? toast.success(data.message) : toast.error(data.message)
      data.success && setIsEmailSent(true)
    } catch (error) {
      toast.error(error.message)
    }
  }

  const onSubmitOtp = async (e) => {
    e.preventDefault()

    const otpArray = inputRefs.current.map(e => e.value)
    setOtp(otpArray.join(''))
    setIsOtpSubmited(true)

  }

  const onSubmitNewPassword = async (e) => {
    e.preventDefault()
    try {
      const { data } = await axios.post(backendUrl + '/api/auth/reset-password', { email, otp, newPassword: password })
      data.success ? toast.success(data.message) : toast.error(data.message)
      data.success && navigate('/login')
    } catch (error) {
      toast.error(error.message)
    }
  }
  return (
    <div className='flex items-center justify-center min-h-screen px-6 sm:px-0 bg-linear-to-br from-blue-200 to-purple-400'>
      <img onClick={() => navigate('/')} src={assets.logo} alt="logo" className="absolute left-5 sm:left-20 top-5 w-28 sm:w-32 cursor-pointer" />
      {/* form for enter email */}
      {!isEmailSent &&
        <form onSubmit={onSubmitEmail} className='bg-slate-900 p-8 rounded-lg shadow-lg w-96 text-sm'>
          <h1 className='text-2xl font-semibold text-center text-white mb-4'>Reset Password</h1>
          <p className='text-center text-indigo-300 mb-6'>Enter your registered email address </p>
          <div className='mb-4 flex item-center gap-3 w-full px-5 py-3 rounded-full bg-[#333A5C]'>
            <img src={assets.mail_icon} alt="" />
            <input type="email" placeholder='Enter your email' className='bg-transparent border-none outline-none text-white w-full' required
              value={email} onChange={(e) => setEmail(e.target.value)} />

          </div>
          <button type='submit' className='w-full py-3 bg-linear-to-r mt-3 from-indigo-500 to-indigo-900 text-white
        rounded-full cursor-pointer'>Submit</button>
        </form>
      }
      {/* //form for enter password reset otp */}
      {!isOtpSubmited && isEmailSent &&

        <form onSubmit={onSubmitOtp} className='bg-slate-900 p-8 rounded-lg shadow-lg w-96 text-sm' >
          <h1 className='text-2xl font-semibold text-center text-white mb-4'>Reset Password OTP</h1>
          <p className='text-center text-indigo-300 mb-6'>Enter the 6-digit code sent to your email address </p>
          <div className='flex justify-between mb-8' onPaste={handelPaste}>
            {Array(6).fill(0).map((_, index) => (
              <input type="text" maxLength='1' key={index} required className='w-12 h-12 bg-[#333A5C]
            text-white text-center text-xl rounded-md'
                ref={e => inputRefs.current[index] = e}
                onInput={(e) => handelInput(e, index)}
                onKeyDown={(e) => handelKeyDown(e, index)}
              />

            ))}

          </div>
          <button className='w-full py-2.5 bg-linear-to-r from-indigo-500 to-indigo-900 text-white
        rounded-full cursor-pointer'>Verify OTP</button>
        </form>
      }
      {/* enter new password */}
      {isOtpSubmited && isEmailSent &&
        <form onSubmit={onSubmitNewPassword} className='bg-slate-900 p-8 rounded-lg shadow-lg w-96 text-sm'>
          <h1 className='text-2xl font-semibold text-center text-white mb-4'>Enter Your New Password</h1>
          <p className='text-center text-indigo-300 mb-6'>Password must be at least 6 characters long </p>
          <div className='mb-4 flex item-center gap-3 w-full px-5 py-3 rounded-full bg-[#333A5C]'>
            <img src={assets.lock_icon} alt="" />
            <input type="password" placeholder='Enter your new password' className='bg-transparent border-none outline-none text-white w-full' required
              value={password} onChange={(e) => setPassword(e.target.value)} />

          </div>
          <button type='submit' className='w-full py-3 bg-linear-to-r mt-3 from-indigo-500 to-indigo-900 text-white
        rounded-full cursor-pointer'>Submit</button>
        </form>
      }
    </div>
  )
}

export default ResetPassword