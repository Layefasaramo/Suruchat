import { useState } from "react";
import { supabase } from "./supabaseClient";
import background from "./assets/background.png";
import Login from "./Login";
import Signup from "./Signup";

export const handleLogout = async () => {
  const { error } = await supabase.auth.signOut();
  if (error) {
    console.error("Error signing out:", error.message);
  } else {
    window.location.reload();
  }
};

export default function Auth() {
  const [isSignup, setIsSignup] = useState(false);
  const [message, setMessage] = useState("");

  const toggleMode = () => {
    setIsSignup(!isSignup);
    setMessage(""); // Clear message when switching mode
  };

  return (
    <div
      className="flex flex-col items-center justify-center min-h-screen bg-primary-900 text-white p-6"
      style={{ backgroundImage: `url(${background})` }}
    >
      {message && (
        <div className="mb-4 p-3 bg-green-900 border border-green-500 text-green-100 rounded text-sm text-center max-w-sm w-full">
          {message}
        </div>
      )}

      {isSignup ? (
        <Signup onToggleMode={toggleMode} setMessage={setMessage} />
      ) : (
        <Login onToggleMode={toggleMode} setMessage={setMessage} />
      )}
    </div>
  );
}
