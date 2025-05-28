import { useEffect, useState } from "react";
import { auth } from "./firebase/firebaseConfig";
import { onAuthStateChanged } from "firebase/auth";
import Login from "./components/Login";
import PostForm from "./components/PostForm";
import PostList from "./components/PostList";
import HeaderMenu from "./components/HeaderMenu";
import Info from "./components/Info";
import { db } from "./firebase/firebaseConfig";
import { collection, addDoc, serverTimestamp } from "firebase/firestore";
import { agregarPuntos } from "./utils/agregarPuntos"; // ajusta la ruta según tu estructura
import { doc, getDoc, setDoc } from "firebase/firestore"; // añade esto

function App() {
  const [user, setUser] = useState(null);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (currentUser) => {
      setUser(currentUser);
      if (currentUser) {
        const userRef = doc(db, "users", currentUser.uid);

        const snap = await getDoc(userRef);

        if (!snap.exists()) {
          await setDoc(userRef, {
            nombre: currentUser.displayName || "Usuario",
            puntos: 0,
            rango: "Cobre",
          });
          console.log("Documento de usuario creado.");
        }
      }
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
    <div className="min-h-screen bg-gray-950 ">
      <div className="w-full border-b border-gray-700 p-4">
        <HeaderMenu />
      </div>

      <div className="flex min-h-screen ">
        {/* Lado izquierdo */}
        <div className="w-1/4 bg-graye-950 p-4  border-r border-gray-700">
          <div className="flex flex-col items-center mb-6">
            <Info />
          </div>
        </div>

        {/* Centro (contenido principal) */}
        <div className="w-2/4 bg-gray-950 p-4  border-r border-gray-700">
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

              await agregarPuntos(user.uid, 10);
            }}
          />

          {/* Listado de posts */}
          <div className="mt-8 ">
            <PostList user={user} />
          </div>
        </div>

        {/* Lado derecho (opcional) */}
        <div className="w-1/4 bg-gray-950 p-4">
          {/* Algún contenido adicional o decorativo */}
        </div>
      </div>
    </div>
  );
}

export default App;
