import { useEffect, useState } from "react";
import { auth } from "./firebase/firebaseConfig";
import { onAuthStateChanged } from "firebase/auth";
import Login from "./components/Login";
import PostForm from "./components/PostForm";
import PostList from "./components/PostList";
import HeaderMenu from "./components/HeaderMenu";
import { db } from "./firebase/firebaseConfig";
import { collection, addDoc, serverTimestamp } from "firebase/firestore";

function App() {
  const [user, setUser] = useState(null);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
      setUser(currentUser);
    });

    return () => unsubscribe();
  }, []);

  if (!user) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-950">
        <Login />
      </div>
    );
  }

  return (
    <div className=" min-h-screen bg-slate-900 p-6">
      <div className="flex flex-col  items-end mb-6">
        <HeaderMenu></HeaderMenu>
      </div>
      <div className="flex flex-col mb-6 ml-auto">
        <img
          src={user.photoURL}
          alt="Avatar"
          className="w-20 h-20 rounded-full mb-4"
        />

        <p className="text-xl text-white font-semibold">{user.displayName}</p>
        <p className="text-sm text-white">{user.email}</p>
      </div>

      <PostForm
        user={user}
        onSubmit={async ({ text, imageUrl }) => {
          await addDoc(collection(db, "posts"), {
            text,
            imageUrl,
            createdAt: serverTimestamp(),
            userId: user.uid,
            userName: user.displayName,
            userPhoto: user.photoURL,
          });
        }}
      />

      {/* Listado de posts */}
      <div className="mt-8">
        <PostList user={user} />
      </div>
    </div>
  );
}

export default App;
