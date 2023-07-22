import React, { useRef, useState } from "react";
import { IoSend } from "react-icons/io5";
import "./App.css";
import { GoogleButton } from "react-google-button";
import { initializeApp } from "firebase/app";
import {
  signInWithPopup,
  getAuth,
  GoogleAuthProvider,
  signOut,
} from "firebase/auth";
import {
  collection,
  getFirestore,
  orderBy,
  limit,
  query,
  addDoc,
  serverTimestamp,
} from "firebase/firestore";
import { useAuthState } from "react-firebase-hooks/auth";
import { useCollectionData } from "react-firebase-hooks/firestore";

const firebaseConfig = {
  //put config data here
};

initializeApp(firebaseConfig);

const auth = getAuth();

const App = () => {
  const [user] = useAuthState(auth);
  return (
    <div className="App">
      <header>
        <p>💬 SuperChat</p>
        {user ? <SignOut /> : null}
      </header>
      <section>{user ? <Chatroom /> : <SignIn />}</section>
    </div>
  );
};

function SignIn() {
  const signInWithGoogle = () => {
    const provider = new GoogleAuthProvider();
    signInWithPopup(auth, provider).catch((error) => {
      console.log(error.message);
    });
  };
  return <GoogleButton className="sign-in" onClick={signInWithGoogle} />;
}

function SignOut() {
  return (
    <button className="sign-out" onClick={() => signOut(auth)}>
      SignOut
    </button>
  );
}

function Chatroom() {
  const dummy = useRef();
  const db = getFirestore();
  const messagesRef = collection(db, "messages");
  const q = query(messagesRef, orderBy("createdAt"), limit(100));
  const [messages] = useCollectionData(q, { idField: "id" }); //returns an array of object which have document data.
  const [formValue, setFormValue] = useState("");

  const sendMessage = async (e) => {
    e.preventDefault();
    const { uid, photoURL } = auth.currentUser;
    addDoc(messagesRef, {
      text: formValue,
      createdAt: serverTimestamp(),
      uid,
      photoURL,
    });
    setFormValue("");
    dummy.current.scrollIntoView({ behavior: "smooth" });
  };

  return (
    <>
      <main>
        {messages &&
          messages.map((msg, key) => <ChatMessage key={key} message={msg} />)}
        <div ref={dummy}></div>
      </main>

      <form onSubmit={sendMessage}>
        <input
          placeholder="Type your message here..."
          value={formValue}
          onChange={(e) => setFormValue(e.target.value)}
        />
        <button className="sendButton" type="submit" disabled={!formValue}>
          <IoSend className="sendButtonIcon" />
        </button>
      </form>
    </>
  );
}

function ChatMessage(props) {
  const { text, uid, photoURL } = props.message;
  const messageClass = uid === auth.currentUser.uid ? "sent" : "received";
  return (
    <div className={`message ${messageClass}`}>
      <img src={photoURL} alt="img" />
      <p className="textMessage">{text}</p>
    </div>
  );
}

export default App;
