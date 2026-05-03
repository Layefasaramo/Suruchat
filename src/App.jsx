import { useEffect, useState } from "react";
import { Userchat } from "./hooks/Userchat.js";
import Header from "./Header";
import Chatbox from "./Chatbox";
import Profile from "./Profile";
import Auth from "./Auth";
import background from "./assets/background.png";
import { Toaster } from "react-hot-toast";

function App() {
  const {
    session,
    view,
    setView,
    users,
    messages,
    activeChat,
    sendInvite,
    pendingInvites,
    selectedIcon,
    prevView,
    setPreView,
    activeConversations,
    startChat,
    acceptInvite,
    navigateTo,
    handleSendMessage,
    content,
    setContent,
    updateProfileIcon,
    iconOptions,
    isUserOnline,
  } = Userchat();

  if (!session) return <Auth />;

  return (
    <div
      className="flex flex-col h-dvh  bg-primary-900 text-white font-sans"
      style={{ backgroundImage: `url(${background})` }}
    >
      <Toaster
        toastOptions={{
          style: {
            background: "#1a1a2e", // Match your primary-900
            color: "#fff",
            border: "1px solid #4ecca3", // Match your accent color
          },
          success: {
            iconTheme: {
              primary: "#4ecca3",
              secondary: "#1a1a2e",
            },
          },
        }}
      />
      {/* The start  */}
      <Header
        view={view}
        setView={setView}
        prevView={prevView}
        pendingInvites={pendingInvites}
        selectedIcon={selectedIcon}
        navigateTo={navigateTo}
      />

      <main
        className="flex-1 overflow-hidden flex flex-col bg-cover bg-center"
        style={{
          backgroundImage: `linear-gradient(rgba(11, 26, 43, 0.9), rgba(11, 26, 43, 0.9))`,
        }}
      >
        {/* user sections */}
        {view === "users" && (
          <div className="flex-1 overflow-y-auto p-6 max-w-4xl mx-auto w-full space-y-8">
            <section>
              <h2 className="text-xs font-bold text-accent-400 mb-4 tracking-widest uppercase">
                Your Conversations
              </h2>
              <div className="grid gap-3">
                {activeConversations.map((conv) => {
                  const otherUser =
                    conv.sender_id === session.user.id
                      ? conv.receiver
                      : conv.sender;
                  return (
                    <div
                      key={conv.id}
                      onClick={() => startChat(otherUser)}
                      className="flex justify-between items-center p-4 bg-secondary/60 rounded-xl cursor-pointer hover:bg-secondary border border-accent-600/20 hover:border-accent-400/50 transition group"
                    >
                      <div className="flex items-center gap-3">
                        <span className="text-2xl">
                          {otherUser.selected_icon || "👤"}
                        </span>
                        <span className="font-medium">
                          {otherUser.username}
                        </span>
                      </div>
                    </div>
                  );
                })}
              </div>
            </section>
            {/* discover shinobi sections */}
            <section>
              <h2 className="text-xs font-bold text-gray-500 mb-4 tracking-widest uppercase">
                Discover Shinobi
              </h2>
              <div className="grid gap-3">
                {users
                  .filter((u) => u.id !== session.user.id)
                  .map((u) => (
                    <div
                      key={u.id}
                      className="flex justify-between items-center p-4 bg-gray-800/40 rounded-xl border border-white/5"
                    >
                      <div className="flex items-center gap-3">
                        {/* Icon with Green Dot */}
                        <div className="relative">
                          <span className="text-2xl bg-primary-900 w-10 h-10 flex items-center justify-center rounded-full border border-gray-700">
                            {u.selected_icon || "👤"}
                          </span>
                          {isUserOnline(u.updated_at) && (
                            <span className="absolute -bottom-0.5 -right-0.5 w-3 h-3 bg-green-500 border-2 border-primary-900 rounded-full shadow-[0_0_8px_rgba(34,197,94,0.8)]"></span>
                          )}
                        </div>

                        {/* Name and Status Text */}
                        <div className="flex flex-col">
                          <span className="font-medium">{u.username}</span>
                          <span className="text-[10px] text-gray-500">
                            {isUserOnline(u.updated_at) ? (
                              <span className="text-green-400">Online Now</span>
                            ) : u.updated_at ? (
                              `Last seen ${new Date(u.updated_at).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}`
                            ) : (
                              "Offline"
                            )}
                          </span>
                        </div>
                      </div>

                      <button
                        onClick={() => sendInvite(u.id)}
                        className="bg-accent-600 hover:bg-accent-500 w-10 h-10 rounded-full font-bold shadow-neon transition"
                      >
                        +
                      </button>
                    </div>
                  ))}
              </div>
            </section>
          </div>
        )}

        {view === "requests" && (
          <div className="p-6 max-w-2xl mx-auto w-full">
            <h2 className="text-xl font-bold mb-6">Requests</h2>
            {pendingInvites.length === 0 ? (
              <p className="text-gray-500 text-center py-10">
                Your mailbox is empty...
              </p>
            ) : (
              <div className="space-y-3">
                {pendingInvites.map((invite) => (
                  <div
                    key={invite.id}
                    className="flex justify-between items-center p-4 bg-secondary rounded-xl border border-accent-600/30 shadow-neon"
                  >
                    <p className="font-bold">{invite.sender?.username}</p>
                    <button
                      onClick={() => acceptInvite(invite.id)}
                      className="bg-green-600 hover:bg-green-500 px-6 py-2 rounded-lg font-bold transition"
                    >
                      Accept
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
        {/* active chat section*/}
        {view === "chat" && activeChat && (
          <Chatbox
            messages={messages}
            activeChat={activeChat}
            session={session}
            selectedIcon={selectedIcon}
            handleSendMessage={handleSendMessage}
            content={content}
            setContent={setContent}
          />
        )}

        {/* Profile section*/}
        {view === "profile" && (
          <Profile
            selectedIcon={selectedIcon}
            updateProfileIcon={updateProfileIcon}
            iconOptions={iconOptions}
            session={session}
          />
        )}
      </main>
    </div>
  );
}

export default App;
