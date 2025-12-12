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
  getDoc,
  arrayUnion,
  arrayRemove,
} from "firebase/firestore";
import PostForm from "./PostForm";
import { EllipsisHorizontalIcon } from "@heroicons/react/24/outline";

export default function PostList({ user }) {
  const [posts, setPosts] = useState([]);
  const [editingPostId, setEditingPostId] = useState(null);
  const [commentText, setCommentText] = useState({});
  const [showComments, setShowComments] = useState({});
  const [openMenu, setOpenMenu] = useState({});

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

  const toggleLike = async (postId, likes) => {
    if (!user) return;

    const postRef = doc(db, "posts", postId);

    if (likes.includes(user.uid)) {
      await updateDoc(postRef, {
        likes: arrayRemove(user.uid),
      });
    } else {
      await updateDoc(postRef, {
        likes: arrayUnion(user.uid),
      });
    }
  };

  const handleAddComment = async (e, postId) => {
    e.preventDefault();
    if (!user) return alert("Debes iniciar sesión para comentar");

    const text = commentText[postId];
    if (!text.trim()) return;

    const postRef = doc(db, "posts", postId);

    await updateDoc(postRef, {
      comments: arrayUnion({
        uid: user.uid,
        name: user.displayName,
        photo: user.photoURL,
        text,
        createdAt: new Date(),
      }),
    });

    setCommentText({ ...commentText, [postId]: "" });
  };

  const toggleComments = (postId) => {
    setShowComments((prev) => ({
      ...prev,
      [postId]: !prev[postId],
    }));
  };

  const toggleMenu = (postId) => {
    setOpenMenu((prev) => ({
      ...prev,
      [postId]: !prev[postId],
    }));
  };

  return (
    <div className="space-y-10 mt-4 mx-auto max-w-md">
      {posts.map((post) => (
        <div key={post.id} className="bg-gray-900 p-4 rounded-xl shadow-md">
          <div className="flex items-center justify-between mb-2">
            <div className="flex items-center gap-2">
              <img
                src={post.userPhoto}
                alt="perfil"
                className="w-8 h-8 rounded-full"
              />
              <span className="font-semibold text-white  text-sm ">
                {post.userName}
              </span>
            </div>

            {/* 3 PUNTITOS SOLO SI ES EL DUEÑO */}
            {user?.uid === post.userId && (
              <div className="relative">
                <button
                  onClick={() => toggleMenu(post.id)}
                  className="w-6 h-6 text-gray-400 hover:text-white"
                >
                  <EllipsisHorizontalIcon />
                </button>

                {/* MENU */}
                {openMenu[post.id] && (
                  <div className="absolute right-0 mt-2 bg-gray-800 p-2 rounded shadow-lg w-28 space-y-2 text-sm">
                    <button
                      onClick={() => {
                        setEditingPostId(post.id);
                        toggleMenu(post.id);
                      }}
                      className="block w-full text-left text-gray-300 hover:text-white"
                    >
                      Editar
                    </button>

                    <button
                      onClick={() => {
                        handleDelete(post.id);
                        toggleMenu(post.id);
                      }}
                      className="block w-full text-left text-red-400 hover:text-red-300"
                    >
                      Eliminar
                    </button>
                  </div>
                )}
              </div>
            )}
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

              <div className="flex items-center gap-6 mt-4">
                <button
                  onClick={() => toggleLike(post.id, post.likes || [])}
                  className="flex items-center gap-1 text-gray-400 hover:text-red-400 transition text-sm"
                >
                  {post.likes?.includes(user?.uid) ? "❤️" : "🤍"}
                  <span>{post.likes?.length || 0}</span>
                </button>

                <button
                  onClick={() => toggleComments(post.id)}
                  className="text-gray-400 hover:text-gray-200 text-sm"
                >
                  💬 {post.comments?.length || 0}
                </button>
              </div>

              {showComments[post.id] && (
                <>
                  {/* FORMULARIO DE COMENTAR PARA CUALQUIER USUARIO LOGUEADO */}
                  {user && (
                    <form
                      onSubmit={(e) => handleAddComment(e, post.id)}
                      className="mt-2 flex gap-2"
                    >
                      <input
                        type="text"
                        placeholder="Escribe un comentario..."
                        className="flex-1 p-1 rounded bg-gray-800 text-gray-200 text-sm"
                        value={commentText[post.id] || ""}
                        onChange={(e) =>
                          setCommentText({
                            ...commentText,
                            [post.id]: e.target.value,
                          })
                        }
                      />
                      <button className="text-sm text-gray-300">Enviar</button>
                    </form>
                  )}

                  {/* LISTA DE COMENTARIOS */}
                  {post.comments && post.comments.length > 0 && (
                    <div className="mt-2 space-y-1 text-gray-300 text-sm">
                      {post.comments.map((c, index) => (
                        <div key={index} className="flex items-center gap-2">
                          <img src={c.photo} className="w-6 h-6 rounded-full" />
                          <p>
                            <strong>{c.name}</strong>: {c.text}
                          </p>
                        </div>
                      ))}
                    </div>
                  )}
                </>
              )}
            </>
          )}
        </div>
      ))}
    </div>
  );
}
