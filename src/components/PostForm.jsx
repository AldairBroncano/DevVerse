import { useState, useRef, useEffect } from "react";
import { storage } from "../firebase/firebaseConfig";
import { ref, uploadBytes, getDownloadURL } from "firebase/storage";
import { agregarPuntos } from "../utils/agregarPuntos";

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

      if (image && typeof image !== "string") {
        console.log("Subiendo imagen...");
        const imageRef = ref(storage, `images/${Date.now()}_${image.name}`);
        await uploadBytes(imageRef, image);
        imageUrl = await getDownloadURL(imageRef);
        console.log("Imagen subida:", imageUrl);
      } else if (typeof image === "string") {
        imageUrl = image; // Imagen ya subida (modo edición)
      }

      await onSubmit({ text, imageUrl });

      console.log("Post enviado correctamente");

      // Limpiar si es nueva publicación
      if (!isEditing) {
        await agregarPuntos(user.uid, 10);
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
      className="p-2 mt-1 bg-white rounded-xl shadow-md space-y-4 mx-auto max-w-md "
    >
      <textarea
        className="w-full border rounded-md p-2"
        placeholder="¿Qué estás pensando?"
        value={text}
        onChange={(e) => setText(e.target.value)}
        required
      />

      <input
        type="file"
        accept="image/*"
        ref={fileInputRef}
        onChange={(e) => setImage(e.target.files[0])}
      />

      <button
        type="submit"
        disabled={uploading}
        className="bg-gray-600 text-white px-4 py-2 rounded-xl hover:bg-slate-900 disabled:opacity-50"
      >
        {uploading
          ? isEditing
            ? "Guardando..."
            : "Publicando..."
          : isEditing
          ? "Guardar cambios"
          : "Publicar"}
      </button>
    </form>
  );
}
