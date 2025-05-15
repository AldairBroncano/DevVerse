import { useEffect, useState } from "react";
import { auth } from "./firebase/firebaseConfig";
import { onAuthStateChanged, signOut } from "firebase/auth";
import Login from "./components/Login";
import PostForm from "./components/PostForm";
import PostList from "./components/PostList";
import { deleteDoc, doc } from "firebase/firestore";
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

  const handleLogout = async () => {
    await signOut(auth);
  };

  if (!user) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-100">
        <Login />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-100 p-6">
      <div className="flex flex-col items-center mb-6">
        <img
          src={user.photoURL}
          alt="Avatar"
          className="w-20 h-20 rounded-full mb-4"
        />

        <p className="text-xl font-semibold">Bienvenido, {user.displayName}</p>
        <p className="text-sm text-gray-600">{user.email}</p>

        <button
          onClick={handleLogout}
          className="mt-4 px-4 py-2 bg-red-500 text-white rounded hover:bg-red-600"
        >
          Cerrar sesión
        </button>
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
