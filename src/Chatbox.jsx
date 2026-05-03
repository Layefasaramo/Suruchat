import background from "./assets/background.png";

function Chatbox({
  messages,
  activeChat,
  session,
  selectedIcon,
  handleSendMessage,
  content,
  setContent,
}) {
  return (
    <div
      className="flex flex-col h-full overflow-hidden bg-primary-900/40 backdrop-blur-sm"
      style={{ backgroundImage: `url(${background})` }}
    >
      <div className="flex-1 overflow-y-auto p-4 space-y-6 scrollbar-thin scrollbar-thumb-accent-600">
        {messages.map((m) => (
          <div
            key={m.id}
            className={`max-w-[80%] p-4 rounded-2xl text-sm relative shadow-lg ${m.sender_id === session.user.id ? "bg-accent-600 ml-auto rounded-tr-none" : "bg-gray-600 border-accent-600/20  rounded-tl-xl"}`}
          >
            <div className="flex items-center gap-2 mb-2">
              <span className="flex items-center justify-center w-7 h-7 text-sm bg-primary-900 rounded-full border border-accent-400/50 shadow-neon">
                {m.sender_id === session.user.id
                  ? selectedIcon
                  : activeChat.icon}
              </span>
              <span className="text-[10px] text-white/60 uppercase font-black tracking-tighter">
                {m.sender_id === session.user.id ? "YOU" : activeChat.name}
              </span>
            </div>
            <p className="text-white leading-relaxed">{m.content}</p>
          </div>
        ))}
      </div>
      <form
        onSubmit={handleSendMessage}
        className="p-4 bg-secondary/80 border-t border-accent-600/30 flex gap-2"
      >
        <input
          value={content}
          onChange={(e) => setContent(e.target.value)}
          className="flex-1 bg-primary-900 p-4 rounded-xl border border-accent-600/20 outline-none focus:border-accent-400 transition"
          placeholder="Write a message..."
        />
        <button
          type="submit"
          className="bg-accent-600 hover:bg-accent-500 px-8 rounded-xl font-bold shadow-neon transition"
        >
          SEND
        </button>
      </form>
    </div>
  );
}
export default Chatbox;
