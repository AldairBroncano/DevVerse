// src/components/PostList.jsx
import { useEffect, useState } from "react";
import { db } from "../firebase/firebaseConfig";
import {
  collection,
  doc,
  deleteDoc,
  updateDoc,
  serverTimestamp,
  onSnapshot,
  orderBy,
  query,
} from "firebase/firestore";
import PostForm from "./PostForm";

export default function PostList({ user }) {
  const [posts, setPosts] = useState([]);
  const [editingPostId, setEditingPostId] = useState(null);

  useEffect(() => {
    const q = query(collection(db, "posts"), orderBy("createdAt", "desc"));
    const unsubscribe = onSnapshot(q, (snapshot) => {
      const newPosts = snapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      }));
      setPosts(newPosts);
    });

    return () => unsubscribe(); // Cleanup
  }, []);

  const handleDelete = async (id) => {
    if (confirm("¿Seguro que deseas eliminar esta publicación?")) {
      await deleteDoc(doc(db, "posts", id));
    }
  };

  return (
    <div className="space-y-10 mt-4 mx-auto max-w-md">
      {posts.map((post) => (
        <div key={post.id} className="bg-gray-900 p-4 rounded-l shadow-md">
          <div className="flex items-center gap-2 mb-2">
            <img
              src={post.userPhoto}
              alt="perfil"
              className="w-8 h-8 rounded-full"
            />
            <span className="font-semibold text-white ">{post.userName}</span>
          </div>

          {editingPostId === post.id ? (
            <PostForm
              user={user}
              initialText={post.text}
              initialImage={post.imageUrl}
              isEditing={true}
              onSubmit={async ({ text, imageUrl }) => {
                const refPost = doc(db, "posts", post.id);
                await updateDoc(refPost, {
                  text,
                  imageUrl,
                  updatedAt: serverTimestamp(),
                });
                setEditingPostId(null);
              }}
            />
          ) : (
            <>
              <p className="text-gray-200  ">{post.text}</p>
              {post.imageUrl && (
                <img
                  src={post.imageUrl}
                  alt="Post"
                  className="mt-2 max-h-80 object-contain rounded text-white"
                />
              )}

              {user?.uid === post.userId && (
                <div className="flex gap-4 mt-2">
                  <button
                    onClick={() => setEditingPostId(post.id)}
                    className="text-sm text-gray-500 hover:underline"
                  >
                    Editar
                  </button>
                  <button
                    onClick={() => handleDelete(post.id)}
                    className="text-sm text-gray-500 hover:underline"
                  >
                    Eliminar
                  </button>
                </div>
              )}
            </>
          )}
        </div>
      ))}
    </div>
  );
}
