import { useState, useRef, useEffect } from "react";
import { storage, db } from "../firebase/firebaseConfig";
import { ref, uploadBytes, getDownloadURL } from "firebase/storage";
import { agregarPuntos } from "../utils/agregarPuntos";
import { PhotoIcon } from "@heroicons/react/24/solid";
import { collection, addDoc, serverTimestamp } from "firebase/firestore";

// ajusta la ruta según tu proyecto

export default function PostForm({
  onSubmit, // Función para crear o editar
  initialText = "", // Texto inicial (edición)
  initialImage = null, // Imagen inicial (edición)
  isEditing = false, // ¿Estamos editando?
  user,
}) {
  const [text, setText] = useState(initialText);
  const [image, setImage] = useState(initialImage);
  const [uploading, setUploading] = useState(false);
  const fileInputRef = useRef();

  useEffect(() => {
    setText(initialText);
    setImage(initialImage);
  }, [initialText, initialImage]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setUploading(true);

    try {
      console.log("Publicando post...");
      let imageUrl = "";

      if (!text.trim() && !image) {
        alert("Escribe algo o selecciona una imagen antes de publicar.");
        setUploading(false);
        return;
      }

      if (image && typeof image !== "string") {
        const imageRef = ref(storage, `images/${Date.now()}_${image.name}`);
        await uploadBytes(imageRef, image);
        imageUrl = await getDownloadURL(imageRef);
      } else if (typeof image === "string") {
        imageUrl = image;
      }

      await addDoc(collection(db, "posts"), {
        text,
        imageUrl,
        userId: user.uid,
        userName: user.displayName,
        userPhoto: user.photoURL,
        createdAt: serverTimestamp(),
        likes: [],
      });

      console.log("Post enviado correctamente a Firestore");

      if (!isEditing) {
        await agregarPuntos(user.uid, 1);
        setText("");
        setImage(null);
        if (fileInputRef.current) fileInputRef.current.value = "";
      }
    } catch (error) {
      console.error("Error:", error);
      alert("Ocurrió un error. Revisa la consola.");
    } finally {
      setUploading(false);
    }
  };

  return (
    <form
      onSubmit={handleSubmit}
      className="p-2 mt-1 bg-gray-900 rounded-l shadow-md space-y-4 mx-auto max-w-md "
    >
      <textarea
        className="w-full rounded-md p-2 text-gray-50 "
        placeholder="¿Qué estás pensando?"
        value={text}
        onChange={(e) => setText(e.target.value)}
      />

      {/* Input oculto */}
      <input
        type="file"
        accept="image/*"
        ref={fileInputRef}
        onChange={(e) => setImage(e.target.files[0])}
        className="hidden"
      />

      {/* Contenedor para los botones */}
      <div className="flex justify-between items-center w-full">
        {/* Botón con icono */}
        <button
          type="button"
          className="p-1 rounded-2xl hover:bg-blue-950 transition"
          onClick={() => fileInputRef.current.click()}
        >
          <PhotoIcon className="h-6 w-6 text-blue-600" />
        </button>

        {/* Botón publicar */}
        <button
          type="submit"
          disabled={uploading}
          className="bg-gray-600 text-gray-950 font-semibold px-3 py-2 rounded-3xl disabled:opacity-50 hover:bg-gray-500"
        >
          {uploading
            ? isEditing
              ? "Guardando..."
              : "Publicando..."
            : isEditing
            ? "Guardar cambios"
            : "Publicar"}
        </button>
      </div>

      {/* Preview cuando hay imagen */}
      {image && typeof image !== "string" && (
        <div className="mt-2">
          <img
            src={URL.createObjectURL(image)}
            alt="preview"
            className="max-h-52 rounded-lg object-cover mx-auto"
          />
        </div>
      )}
    </form>
  );
}
