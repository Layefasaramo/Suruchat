import { useEffect, useState } from 'react'
import { supabase } from './supabaseClient'
import background from './assets/background.png'
import Auth from './Auth'

function App() {
  const [session, setSession] = useState(null)
  const [view, setView] = useState('users') 
  const [prevView, setPrevView] = useState('users');
  const [users, setUsers] = useState([])
  const [pendingInvites, setPendingInvites] = useState([])
  const [activeConversations, setActiveConversations] = useState([])
  const [activeChat, setActiveChat] = useState(null)
  const [messages, setMessages] = useState([])
  const [content, setContent] = useState('')
  const iconOptions = ['🔥', '💻', '⚽', '🌟', '🛡️', '👑'];
  const [selectedIcon, setSelectedIcon] = useState('👤');

  const navigateTo = (newView) => {
    setPrevView(view); 
    setView(newView);  
  };

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => setSession(session))
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => setSession(session))
    return () => subscription.unsubscribe()
  }, [])

  useEffect(() => {
    if (session) {
      fetchUsers()
      fetchPendingInvites()
      fetchActiveChats()

      const inviteChannel = supabase
        .channel('invite-updates')
        .on('postgres_changes', 
          { event: '*', schema: 'public', table: 'invites' }, 
          () => {
            fetchPendingInvites()
            fetchActiveChats()
          }
        )
        .subscribe()

      return () => supabase.removeChannel(inviteChannel)
    }
  }, [session])

  useEffect(() => {
    if (session && activeChat) {
      const msgChannel = supabase
        .channel(`chat-${activeChat.id}`)
        .on('postgres_changes', 
          { event: 'INSERT', schema: 'public', table: 'messages' }, 
          (payload) => {
            if (
              (payload.new.sender_id === session.user.id && payload.new.receiver_id === activeChat.id) ||
              (payload.new.sender_id === activeChat.id && payload.new.receiver_id === session.user.id)
            ) {
              setMessages((prev) => [...prev, payload.new])
            }
          }
        )
        .subscribe()

      return () => supabase.removeChannel(msgChannel)
    }
  }, [session, activeChat])

  // --- DATABASE FUNCTIONS ---

  async function fetchUsers() {
    const { data, error } = await supabase.from('profiles').select('*');
    if (error) {
      console.error("Error fetching profiles:", error.message);
      return;
    }
    const myProfile = data.find(u => u.id === session.user.id);
    if (myProfile?.selected_icon) {
      setSelectedIcon(myProfile.selected_icon);
    }
    setUsers(data || [])
  }

  async function fetchPendingInvites() {
    if (!session?.user?.id) return;
    const { data, error } = await supabase
      .from('invites')
      .select(`
        id, sender_id, receiver_id, status, 
        sender:profiles!sender_id (email, username)
      `)
      .eq('receiver_id', session.user.id)
      .eq('status', 'pending');
      
    if (error) console.error("Invite Fetch Error:", error.message);
    else setPendingInvites(data || []);
  }

  async function fetchActiveChats() {
    const { data } = await supabase
      .from('invites')
      .select('*, sender:profiles!sender_id(id, username, selected_icon), receiver:profiles!receiver_id(id, username, selected_icon)')
      .eq('status', 'accepted')
      .or(`sender_id.eq.${session.user.id},receiver_id.eq.${session.user.id}`)
    setActiveConversations(data || [])
  }

  async function sendInvite(receiverId) {
    const { error } = await supabase.from('invites').insert([
      { sender_id: session.user.id, receiver_id: receiverId, status: 'pending' }
    ])
    if (error) alert("Already sent or error.")
    else alert("Invite sent!")
  }

  async function acceptInvite(inviteId) {
    const { error } = await supabase
      .from('invites')
      .update({ status: 'accepted' })
      .eq('id', inviteId)
    
    if (!error) {
      fetchPendingInvites()
      fetchActiveChats()
      setView('users')
    }
  }

  function startChat(otherUser) {
    setActiveChat({ id: otherUser.id, name: otherUser.username, icon: otherUser.selected_icon || '👤' })
    setView('chat')
    fetchPrivateMessages(otherUser.id)
  }

  async function fetchPrivateMessages(otherId) {
    const { data } = await supabase
      .from('messages')
      .select('*')
      .or(`and(sender_id.eq.${session.user.id},receiver_id.eq.${otherId}),and(sender_id.eq.${otherId},receiver_id.eq.${session.user.id})`)
      .order('created_at', { ascending: true })
    setMessages(data || [])
  }

  async function handleSendMessage(e) {
    e.preventDefault();
    if (!content.trim() || !activeChat) return;
    const { error } = await supabase.from('messages').insert([{ 
      content: content.trim(), 
      sender_id: session.user.id, 
      receiver_id: activeChat.id 
    }]);
    if (!error) setContent('');
  }

  async function updateProfileIcon(icon) {
    const { error } = await supabase
      .from('profiles')
      .update({ selected_icon: icon })
      .eq('id', session.user.id);

    if (!error) {
      setSelectedIcon(icon);
      fetchUsers(); 
      alert("Shinobi Icon Updated!");
    }
  }

  if (!session) return <Auth />

  return (
    <div className="flex flex-col h-screen bg-primary-900 text-white font-sans" style={{ backgroundImage: `url(${background})` }}>
      <header className="p-4 bg-secondary/80 backdrop-blur-md border-b border-accent-600/30 flex justify-between items-center z-50">
        <div className="flex items-center gap-4">
          {view !== 'users' && (
            <button onClick={() => setView(prevView)} className="text-accent-400 font-bold mr-2 pr-4 border-r border-gray-700">
              ← Back
            </button>
          )}
          <div className="flex gap-2">
            <button onClick={() => navigateTo('users')} className={`px-4 py-2 rounded-lg text-sm transition ${view === 'users' ? 'bg-accent-600 shadow-neon' : 'bg-gray-800 hover:bg-gray-700'}`}>
              Find Users
            </button>
            <button onClick={() => navigateTo('requests')} className={`px-4 py-2 rounded-lg text-sm relative transition ${view === 'requests' ? 'bg-accent-600 shadow-neon' : 'bg-gray-800'}`}>
              Requests {pendingInvites.length > 0 && <span className="absolute -top-1 -right-1 bg-red-500 text-[10px] w-5 h-5 flex items-center justify-center rounded-full animate-pulse">{pendingInvites.length}</span>}
            </button>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <button onClick={() => navigateTo('profile')} className="w-10 h-10 flex items-center justify-center rounded-full bg-primary-500 border border-accent-400/50 shadow-neon hover:scale-110 transition text-xl">
            {selectedIcon}
          </button>
          <button onClick={() => supabase.auth.signOut()} className="text-xs opacity-50 hover:opacity-100 transition hover:text-red-400">Logout</button>
        </div>
      </header>

      <main className="flex-1 overflow-hidden flex flex-col bg-cover bg-center" style={{backgroundImage: `linear-gradient(rgba(11, 26, 43, 0.9), rgba(11, 26, 43, 0.9))`}}>
        {view === 'users' && (
          <div className="flex-1 overflow-y-auto p-6 max-w-4xl mx-auto w-full space-y-8">
            <section>
              <h2 className="text-xs font-bold text-accent-400 mb-4 tracking-widest uppercase">Your Conversations</h2>
              <div className="grid gap-3">
                {activeConversations.map(conv => {
                  const otherUser = conv.sender_id === session.user.id ? conv.receiver : conv.sender;
                  return (
                    <div key={conv.id} onClick={() => startChat(otherUser)} className="flex justify-between items-center p-4 bg-secondary/60 rounded-xl cursor-pointer hover:bg-secondary border border-accent-600/20 hover:border-accent-400/50 transition group">
                      <div className="flex items-center gap-3">
                        <span className="text-2xl">{otherUser.selected_icon || '👤'}</span>
                        <span className="font-medium">{otherUser.username}</span>
                      </div>
                      <span className="text-accent-400 text-xs opacity-0 group-hover:opacity-100 transition">Open Chat →</span>
                    </div>
                  )
                })}
              </div>
            </section>
            
            <section>
              <h2 className="text-xs font-bold text-gray-500 mb-4 tracking-widest uppercase">Discover Shinobi</h2>
              <div className="grid gap-3">
                {users.filter(u => u.id !== session.user.id).map(u => (
                  <div key={u.id} className="flex justify-between items-center p-4 bg-gray-800/40 rounded-xl border border-white/5">
                    <div className="flex items-center gap-3">
                      <span className="text-2xl bg-primary-900 w-10 h-10 flex items-center justify-center rounded-full border border-gray-700">{u.selected_icon || '👤'}</span>
                      <span>{u.username}</span>
                    </div>
                    <button onClick={() => sendInvite(u.id)} className="bg-accent-600 hover:bg-accent-500 w-10 h-10 rounded-full font-bold shadow-neon transition">+</button>
                  </div>
                ))}
              </div>
            </section>
          </div>
        )}

        {view === 'requests' && (
          <div className="p-6 max-w-2xl mx-auto w-full">
            <h2 className="text-xl font-bold mb-6">Requests</h2>
            {pendingInvites.length === 0 ? <p className="text-gray-500 text-center py-10">Your mailbox is empty...</p> : (
              <div className="space-y-3">
                {pendingInvites.map((invite) => (
                  <div key={invite.id} className="flex justify-between items-center p-4 bg-secondary rounded-xl border border-accent-600/30 shadow-neon">
                    <p className="font-bold">{invite.sender?.username}</p>
                    <button onClick={() => acceptInvite(invite.id)} className="bg-green-600 hover:bg-green-500 px-6 py-2 rounded-lg font-bold transition">Accept</button>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {view === 'chat' && activeChat && (
          <div className="flex flex-col h-full bg-primary-900/40 backdrop-blur-sm" style={{ backgroundImage: `url(${background})` }}>
            <div className="flex-1 overflow-y-auto p-4 space-y-6">
              {messages.map(m => (
                <div key={m.id} className={`max-w-[80%] p-4 rounded-2xl text-sm relative shadow-lg ${m.sender_id === session.user.id ? 'bg-accent-600 ml-auto rounded-tr-none' : 'bg-secondary border border-accent-600/20 rounded-tl-none'}`}>
                  <div className="flex items-center gap-2 mb-2">
                    <span className="flex items-center justify-center w-7 h-7 text-sm bg-primary-900 rounded-full border border-accent-400/50 shadow-neon">
                      {m.sender_id === session.user.id ? selectedIcon : activeChat.icon}
                    </span>
                    <span className="text-[10px] text-white/60 uppercase font-black tracking-tighter">
                      {m.sender_id === session.user.id ? 'YOU' : activeChat.name}
                    </span>
                  </div>
                  <p className="text-white leading-relaxed">{m.content}</p>
                </div>
              ))}
            </div>
            <form onSubmit={handleSendMessage} className="p-4 bg-secondary/80 border-t border-accent-600/30 flex gap-2">
              <input value={content} onChange={e => setContent(e.target.value)} className="flex-1 bg-primary-900 p-4 rounded-xl border border-accent-600/20 outline-none focus:border-accent-400 transition" placeholder="Write a message..." />
              <button type="submit" className="bg-accent-600 hover:bg-accent-500 px-8 rounded-xl font-bold shadow-neon transition">SEND</button>
            </form>
          </div>
        )}

        {view === 'profile' && (
          <div className="p-8 max-w-md mx-auto w-full bg-secondary/90 mt-10 rounded-2xl border-fade-top shadow-neon">
            <h2 className="text-2xl font-bold mb-6 text-center text-accent-400">Shinobi Profile</h2>
            <div className="space-y-6 text-center">
              <div>
                <label className="text-gray-400 text-xs uppercase tracking-widest block mb-4">Identify Yourself</label>
                <div className="grid grid-cols-3 gap-4">
                  {iconOptions.map(icon => (
                    <button 
                      key={icon} 
                      onClick={() => updateProfileIcon(icon)}
                      className={`text-3xl p-4 rounded-2xl transition border-2 flex items-center justify-center ${selectedIcon === icon ? 'bg-accent-600/20 border-accent-400 shadow-neon scale-105' : 'bg-primary-900 border-transparent hover:border-accent-600/50'}`}
                    >
                      {icon}
                    </button>
                  ))}
                </div>
              </div>
              <div className="pt-6 border-t border-accent-600/20">
                <p className="text-gray-500 text-xs mb-1 uppercase">User Handle</p>
                <p className="text-xl font-bold text-white">{session.user.email?.split('@')[0]}</p>
              </div>
            </div>
          </div>
        )}
      </main>
    </div>
  )
}

export default App;