import { useEffect, useState } from "react";
import { supabase } from "../supabaseClient";

function Userchat() {
  const [session, setSession] = useState(null);
  const [view, setView] = useState("users");
  const [prevView, setPrevView] = useState("users");
  const [users, setUsers] = useState([]);
  const [pendingInvites, setPendingInvites] = useState([]);
  const [activeConversations, setActiveConversations] = useState([]);
  const [activeChat, setActiveChat] = useState(null);
  const [messages, setMessages] = useState([]);
  const [content, setContent] = useState("");
  const iconOptions = ["🔥", "💻", "⚽", "🌟", "🛡️", "👑"];
  const [selectedIcon, setSelectedIcon] = useState("👤");

  const navigateTo = (newView) => {
    setPrevView(view);
    setView(newView);
  };
  useEffect(() => {
    supabase.auth
      .getSession()
      .then(({ data: { session } }) => setSession(session));
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) =>
      setSession(session),
    );
    return () => subscription.unsubscribe();
  }, []);

  useEffect(() => {
    if (session) {
      fetchUsers();
      fetchPendingInvites();
      fetchActiveChats();
      Updatepresence(); // Initial call
      const interval = setInterval(Updatepresence, 60000); // counts every minutes
      return () => clearInterval(interval);

      const inviteChannel = supabase
        .channel("invite-updates")
        .on(
          "postgres_changes",
          { event: "*", schema: "public", table: "invites" },
          () => {
            fetchPendingInvites();
            fetchActiveChats();
          },
        )
        .subscribe();

      return () => supabase.removeChannel(inviteChannel);
    }
  }, [session]);

  useEffect(() => {
    if (session && activeChat) {
      const msgChannel = supabase
        .channel(`chat-${activeChat.id}`)
        .on(
          "postgres_changes",
          { event: "INSERT", schema: "public", table: "messages" },
          (payload) => {
            if (
              (payload.new.sender_id === session.user.id &&
                payload.new.receiver_id === activeChat.id) ||
              (payload.new.sender_id === activeChat.id &&
                payload.new.receiver_id === session.user.id)
            ) {
              setMessages((prev) => [...prev, payload.new]);
            }
          },
        )
        .subscribe();

      return () => supabase.removeChannel(msgChannel);
    }
  }, [session, activeChat]);

  /* database functions */

  async function fetchUsers() {
    const { data, error } = await supabase.from("profiles").select("*");
    if (error) {
      console.error("Error fetching profiles:", error.message);
      return;
    }
    const myProfile = data.find((u) => u.id === session.user.id);
    if (myProfile?.selected_icon) {
      setSelectedIcon(myProfile.selected_icon);
    }
    setUsers(data || []);
  }
  //Helper to check if a user is online (within 2 mins)
  const isUserOnline = (lastSeen) => {
    if (!lastSeen) return false;
    const lastSeenDate = new Date(lastSeen);
    const now = new Date();
    return now - lastSeenDate < 120000; // 2 minutes in ms
  };

  async function fetchPendingInvites() {
    if (!session?.user?.id) return;
    const { data, error } = await supabase
      .from("invites")
      .select(
        `
        id, sender_id, receiver_id, status, 
        sender:profiles!sender_id (email, username)
      `,
      )
      .eq("receiver_id", session.user.id)
      .eq("status", "pending");

    if (error) console.error("Invite Fetch Error:", error.message);
    else setPendingInvites(data || []);
  }

  async function fetchActiveChats() {
    const { data } = await supabase
      .from("invites")
      .select(
        "*, sender:profiles!sender_id(id, username, selected_icon), receiver:profiles!receiver_id(id, username, selected_icon)",
      )
      .eq("status", "accepted")
      .or(`sender_id.eq.${session.user.id},receiver_id.eq.${session.user.id}`);
    setActiveConversations(data || []);
  }
  // 1. Function to update your own status
  async function Updatepresence() {
    if (!session?.user?.id) return;
    await supabase
      .from("profiles")
      .update({ updated_at: new Date().toISOString() })
      .eq("id", session.user.id);
  }
  async function sendInvite(receiverId) {
    const { error } = await supabase.from("invites").insert([
      {
        sender_id: session.user.id,
        receiver_id: receiverId,
        status: "pending",
      },
    ]);
    if (error) alert("Already sent or error.");
    else alert("Invite sent!");
  }

  async function acceptInvite(inviteId) {
    const { error } = await supabase
      .from("invites")
      .update({ status: "accepted" })
      .eq("id", inviteId);

    if (!error) {
      fetchPendingInvites();
      fetchActiveChats();
      setView("users");
    }
  }

  function startChat(otherUser) {
    setActiveChat({
      id: otherUser.id,
      name: otherUser.username,
      icon: otherUser.selected_icon || "👤",
    });
    setView("chat");
    fetchPrivateMessages(otherUser.id);
  }

  async function fetchPrivateMessages(otherId) {
    const { data } = await supabase
      .from("messages")
      .select("*")
      .or(
        `and(sender_id.eq.${session.user.id},receiver_id.eq.${otherId}),and(sender_id.eq.${otherId},receiver_id.eq.${session.user.id})`,
      )
      .order("created_at", { ascending: true });
    setMessages(data || []);
  }

  async function handleSendMessage(e) {
    e.preventDefault();
    if (!content.trim() || !activeChat) return;
    const { error } = await supabase.from("messages").insert([
      {
        content: content.trim(),
        sender_id: session.user.id,
        receiver_id: activeChat.id,
      },
    ]);
    if (!error) setContent("");
  }

  async function updateProfileIcon(icon) {
    const { error } = await supabase
      .from("profiles")
      .update({ selected_icon: icon })
      .eq("id", session.user.id);

    if (!error) {
      setSelectedIcon(icon);
      fetchUsers();
      alert("Shinobi Icon Updated!");
    }
  }

  return {
    session,
    setSession,
    users,
    messages,
    setMessages,
    activeChat,
    setActiveChat,
    view,
    setView,
    pendingInvites,
    sendInvite,
    acceptInvite,
    startChat,
    prevView,
    setPrevView,
    activeConversations,
    handleSendMessage,
    content,
    setContent,
    iconOptions,
    selectedIcon,
    updateProfileIcon,
    navigateTo,
    isUserOnline,
  };
}
export { Userchat };
