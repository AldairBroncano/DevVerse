import { useEffect, useState } from "react";
import { auth, db } from "../firebase/firebaseConfig";
import { onAuthStateChanged } from "firebase/auth";
import { doc, getDoc } from "firebase/firestore";

export default function Info() {
  const [user, setUser] = useState(null);
  const [datosUsuario, setDatosUsuario] = useState(null);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
      setUser(currentUser);
    });

    return () => unsubscribe();
  }, []);

  useEffect(() => {
    const cargarDatos = async () => {
      const ref = doc(db, "users", user.uid);

      const snap = await getDoc(ref);
      if (snap.exists()) {
        setDatosUsuario(snap.data());
      }
    };
    cargarDatos();
  }, [user]);

  if (!datosUsuario) return null;

  return (
    <div className="p-4 bg-gray-100 rounded-xl shadow w-full max-w-xs">
      {/* Avatar y nombre */}
      <div className="flex items-center gap-3 mb-4">
        {user && (
          <>
            <img
              src={user.photoURL}
              alt="Avatar"
              className="w-12 h-12 rounded-full object-cover"
            />
            <p className="text-gray-800 font-semibold">{user.displayName}</p>
          </>
        )}
      </div>

      {/* Progreso y rango */}
      {datosUsuario && (
        <>
          <h2 className="text-lg font-semibold mb-2">Tu progreso</h2>
          <div className="flex items-center gap-3">
            <div className="text-2xl">
              {datosUsuario.rango === "Oro" && "🥇"}
              {datosUsuario.rango === "Plata" && "🥈"}
              {datosUsuario.rango === "Cobre" && "🥉"}
              {datosUsuario.rango === "Platino" && "🔷"}
              {datosUsuario.rango === "Diamante" && "💎"}
            </div>
            <div>
              <p className="text-sm text-gray-700">
                Rango: <strong>{datosUsuario.rango}</strong>
              </p>
              <p className="text-sm text-gray-500">
                Puntos: {datosUsuario.puntos}
              </p>
            </div>
          </div>
        </>
      )}
    </div>
  );
}
