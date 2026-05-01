function Profile({ selectedIcon, updateProfileIcon, iconOptions, session }) {
  return (
    <div className="p-8 max-w-md mx-auto w-full bg-secondary/90 mt-10 rounded-2xl border-fade-top shadow-neon">
      <h2 className="text-2xl font-bold mb-6 text-center text-accent-400">
        Shinobi Profile
      </h2>
      <div className="space-y-6 text-center">
        <div>
          <label className="text-gray-400 text-xs uppercase tracking-widest block mb-4">
            Identify Yourself
          </label>
          <div className="grid grid-cols-3 gap-4">
            {iconOptions.map((icon) => (
              <button
                key={icon}
                onClick={() => updateProfileIcon(icon)}
                className={`text-3xl p-4 rounded-2xl transition border-2 flex items-center justify-center ${selectedIcon === icon ? "bg-accent-600/20 border-accent-400 shadow-neon scale-105" : "bg-primary-900 border-transparent hover:border-accent-600/50"}`}
              >
                {icon}
              </button>
            ))}
          </div>
        </div>
        <div className="pt-6 border-t border-accent-600/20">
          <p className="text-gray-500 text-xs mb-1 uppercase">User Handle</p>
          <p className="text-xl font-bold text-white">
            {session.user.email?.split("@")[0]}
          </p>
        </div>
      </div>
    </div>
  );
}

export default Profile;
