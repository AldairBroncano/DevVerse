import { doc, getDoc, updateDoc } from "firebase/firestore";
import { db } from "../firebase/firebaseConfig";

export const agregarPuntos = async (uid, puntosExtra) => {
  const userRef = doc(db, "users", uid);
  const snap = await getDoc(userRef);

  if (snap.exists()) {
    const data = snap.data();
    const nuevosPuntos = (data.puntos || 0) + puntosExtra;

    let nuevoRango = "Cobre";
    if (nuevosPuntos >= 100) nuevoRango = "Oro";
    else if (nuevosPuntos >= 50) nuevoRango = "Plata";

    await updateDoc(userRef, {
      puntos: nuevosPuntos,
      rango: nuevoRango,
    });
  }
};
