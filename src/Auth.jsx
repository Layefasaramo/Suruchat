import { useState } from 'react'
import { supabase } from './supabaseClient'
import background from './assets/background.png'
import { User, Lock, Eye, EyeOff } from 'lucide-react';

export default function Auth() {
  const [loading, setLoading] = useState(false)
  const [email, setEmail] = useState('')
  const [username, setUsername] = useState('') // Matches your state name
  const [password, setPassword] = useState('')
  const [isSignUp, setIsSignUp] = useState(false)
  const [message, setMessage] = useState('')
  const [showpassword, setshowpassword] = useState(false)

  const handleAuth = async (e) => {
    e.preventDefault()
    setLoading(true)
    setMessage('')

    if (isSignUp) {
      // SIGN UP: Use Email + Password
      // We pass username in 'options' so it goes to the profile via a Trigger
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: { username: username } // Stores it in user_metadata
        }
      })

      if (error) {
        alert(error.message)
      } else if (data.user && data.session === null) {
        setMessage('Registration successful! Please check your email.')
      }
    } else {
      // LOGIN: Use Username
      // 1. Look up the email associated with this username
      const { data: profile, error: userError } = await supabase
        .from('profiles')
        .select('email')
        .eq('username', username)
        .single()

      if (userError || !profile) {
        alert("Username not found")
        setLoading(false)
        return
      }

      // 2. Sign in using the email we just found
      const { error: loginError } = await supabase.auth.signInWithPassword({
        email: profile.email,
        password: password,
      })

      if (loginError) alert(loginError.message)
    }
    setLoading(false)
  }

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-primary-900 text-white p-6 "
    style={{ backgroundImage: `url(${background})` }}>
    
      <div className="w-full max-w-sm bg-primary-500/75 p-8 rounded-xl shadow-neon border-fade-top" >
        <h2 className="text-2xl font-bold mb-6 text-center text-white">
          {isSignUp ? 'Create Account' : 'Welcome Back'}
        </h2>
        
        {message && (
          <div className="mb-4 p-3 bg-green-900 border border-green-500 text-green-100 rounded text-sm text-center">
            {message}
          </div>
        )}

        <form onSubmit={handleAuth} className="space-y-4">
          
          <div className="relative group">
      <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
        <User className="h-5 w-5 text-primary-400 group-focus-within:text-accent-400 transition-colors" />
      </div>
          <input
            type="text"
            placeholder="Username"
            className="w-full p-3 pl-10 rounded-[10px]  border border-gray-600 focus:border-blue-500 outline-none"
            value={username}
            
            onChange={(e) => setUsername(e.target.value)}
            required
          /></div>
          
  
          {/* Only show Email during Sign Up */}
          {isSignUp && (
            <input 
              type="email"
              placeholder="Email Address"
              className="w-full p-3 rounded-[10px] border border-gray-600 focus:border-blue-500 outline-none"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
          )}
           
<div className="relative group">
      <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
        <Lock className="h-5 w-5 text-primary-400 group-focus-within:text-accent-400 transition-colors" />
        
      </div>
          <input
            type= { showpassword ? "text":"password"}
            placeholder="Password"
            className="w-full p-3 pl-10 rounded-[10px] bg-primary-700 border border-gray-600 focus:border-blue-500 outline-none"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
          />
          <button onClick={() => setshowpassword(!showpassword)}
        type="button" className="absolute inset-y-0 right-0 pr-3 flex items-center text-primary-400 hover:text-white transition-colors" >{showpassword? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />} </button>
          
          </div>


          <button 
            disabled={loading}
            className="w-full bg-accent-600 hover:bg-accent-500 p-3 rounded font-bold transition-all"
          >
            {loading ? 'Processing...' : isSignUp ? 'Register for SuruChatto' : 'Log In'}
          </button>
        </form>

        <div className="mt-6 pt-6 border-t border-gray-700 text-center">
          <button 
            onClick={() => setIsSignUp(!isSignUp)}
            className="text-blue-400 font-bold hover:text-blue-300 transition-colors"
          >
            {isSignUp ? 'Already have an account? Log In' : 'New? Create an Account'}
          </button>
        </div>
      </div>
    </div>
  )
}