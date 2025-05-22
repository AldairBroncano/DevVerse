import React from "react";
import { GoogleAuthProvider, signInWithPopup } from "firebase/auth";
import { auth, db } from "../firebase/firebaseConfig";
import { doc, setDoc, getDoc } from "firebase/firestore";

function Login() {
  const handleGoogleLogin = async () => {
    try {
      const provider = new GoogleAuthProvider();
      const result = await signInWithPopup(auth, provider);
      const user = result.user;

      const userRef = doc(db, "users", user.uid);
      const docSnap = await getDoc(userRef);

      if (!docSnap.exists()) {
        await setDoc(userRef, {
          uid: user.uid,
          displayName: user.displayName,
          email: user.email,
          photoURL: user.photoURL,
          createdAt: new Date(),
        });
      }

      console.log("✅ Usuario logueado y guardado:", user);
    } catch (error) {
      console.error("❌ Error al iniciar sesión con Google:", error);
    }
  };

  return (
    <div className="flex flex-col md:flex-row h-screen bg-slate-950 md:gap-x-35">
      {/* Columna izquierda: Logo grande o imagen */}
      <div className="flex-1 flex items-center justify-center p-6">
        <div className="text-center">
          <h1 className="text-5xl font-bold text-blue-600 mb-4">DevVerse</h1>
          <p className="text-xl text-gray-400">
            Conéctate con tu comunidad de desarrolladores
          </p>
        </div>
      </div>

      {/* Columna derecha: Login */}
      <div className="w-full md:max-w-md flex items-center justify-center px-6 pb-12 md:pb-0">
        <div className="bg-white p-8 rounded shadow-md w-full">
          <h2 className="text-2xl font-bold mb-6 text-center">
            Inicia sesión en DevVerse
          </h2>
          <button
            onClick={handleGoogleLogin}
            className="w-full bg-blue-600 text-white py-2 rounded-xl hover:bg-slate-900 transition"
          >
            Iniciar sesión con Google
          </button>
        </div>
      </div>
    </div>
  );
}

export default Login;
