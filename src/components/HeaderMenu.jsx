import { useEffect, useState } from "react";
import { Menu, X } from "lucide-react"; // iconos opcionales (lucide-react)
import { signOut } from "firebase/auth";
import { auth } from "../firebase/firebaseConfig"; // ajusta esta ruta a la correcta en tu proyecto
import { onAuthStateChanged } from "firebase/auth";

export default function HeaderMenu() {
  const [open, setOpen] = useState(false);

  const toggleMenu = () => setOpen(!open);

  const handleLogout = async () => {
    await signOut(auth);
  };

  const [user, setUser] = useState(null);
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
      setUser(currentUser);
    });

    return () => unsubscribe();
  }, []);

  return (
    <div className="relative inline-block text-left">
      <div className="flex items-center gap-4 bg-slate-900 p-2 rounded-md">
        {user && (
          <>
            <img
              src={user.photoURL}
              alt="Avatar"
              className="w-10 h-10 rounded-full object-cover"
            />
            <p className="text-white font-medium">{user.displayName}</p>
          </>
        )}

        {/* Botón hamburguesa */}
        <button
          onClick={toggleMenu}
          className="ml-auto p-2 rounded-md bg-slate-800 text-white hover:bg-slate-700 focus:outline-none"
        >
          {open ? <X size={24} /> : <Menu size={24} />}
        </button>
      </div>

      {/* Menú desplegable */}
      {open && (
        <div className="absolute right-0 mt-2 w-48 bg-white rounded-md shadow-lg z-10">
          <ul className="py-1">
            <li>
              <button className="block w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-200">
                Perfil
              </button>
            </li>
            <li>
              <button className="block w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-200">
                Configuración
              </button>
            </li>
            <li>
              <button
                onClick={handleLogout}
                className="block w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-200"
              >
                Cerrar sesión
              </button>
            </li>
          </ul>
        </div>
      )}
    </div>
  );
}
