import { useState } from "react";
import { supabase } from "./supabaseClient";
import { User, Lock, Eye, EyeOff } from "lucide-react";
import toast from "react-hot-toast";

function Login({ onToggleMode, setMessage }) {
  const [loading, setLoading] = useState(false);
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);

  const handleLogin = async (e) => {
    e.preventDefault();
    setLoading(true);
    setMessage("");

    // 1. Look up the email associated with this username
    const { data: profile, error: userError } = await supabase
      .from("profiles")
      .select("email")
      .eq("username", username)
      .single();

    if (userError || !profile) {
      toast.error("Username not found");
      setLoading(false);
      return;
    }

    // 2. Sign in using the email we just found
    const { error: loginError } = await supabase.auth.signInWithPassword({
      email: profile.email,
      password: password,
    });

    if (loginError) toast.error(loginError.message);
    setLoading(false);
  };

  return (
    <div className="w-full max-w-sm bg-primary-500/75 p-8 rounded-xl shadow-neon border-fade-top">
      <h2 className="text-2xl font-bold mb-6 text-center text-white">
        Welcome Back
      </h2>

      <form onSubmit={handleLogin} className="space-y-4">
        <div className="relative group">
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
            <User className="h-5 w-5 text-primary-400 group-focus-within:text-accent-400 transition-colors" />
          </div>
          <input
            type="text"
            placeholder="Username"
            className="w-full p-3 pl-10 rounded-[10px] border border-gray-600 focus:border-blue-500 outline-none text-white bg-primary-700"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            required
          />
        </div>

        <div className="relative group">
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
            <Lock className="h-5 w-5 text-primary-400 group-focus-within:text-accent-400 transition-colors" />
          </div>
          <input
            type={showPassword ? "text" : "password"}
            placeholder="Password"
            className="w-full p-3 pl-10 rounded-[10px] bg-primary-700 border border-gray-600 focus:border-blue-500 outline-none text-white"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
          />
          <button
            onClick={() => setShowPassword(!showPassword)}
            type="button"
            className="absolute inset-y-0 right-0 pr-3 flex items-center text-primary-400 hover:text-white transition-colors"
          >
            {showPassword ? (
              <EyeOff className="h-5 w-5" />
            ) : (
              <Eye className="h-5 w-5" />
            )}
          </button>
        </div>

        <button
          disabled={loading}
          className="w-full bg-accent-600 hover:bg-accent-500 p-3 rounded font-bold transition-all text-white"
        >
          {loading ? "Processing..." : "Log In"}
        </button>
      </form>

      <div className="mt-6 pt-6 border-t border-gray-700 text-center">
        <button
          onClick={onToggleMode}
          className="text-blue-400 font-bold hover:text-blue-300 transition-colors"
        >
          New? Create an Account
        </button>
      </div>
    </div>
  );
}
export default Login;
