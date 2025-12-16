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
  const [commentToDelete, setCommentToDelete] = useState(null);
  const [showMessage, setShowMessage] = useState(false);

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

  const handleComingSoon = () => {
    setShowMessage(true);
  };

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

  const handleDeleteComment = async (postId, comment) => {
    const postRef = doc(db, "posts", postId);

    await updateDoc(postRef, {
      comments: arrayRemove(comment),
    });
  };

  const toggleMenu = (postId) => {
    setOpenMenu((prev) => ({
      ...prev,
      [postId]: !prev[postId],
    }));
  };

  return (
    //space-y-8 mt-4 mx-auto px-2 sm:px-0 max-w-xl lg:max-w-2xl

    <div className="space-y-8 mt-4 mx-auto px-2 sm:px-0 max-w-xl lg:max-w-2xl">
      {posts.map((post) => (
        <div
          key={post.id}
          className="bg-gray-900 p-3 sm:p-4 rounded-xl shadow-md"
        >
          {/* HEADER */}
          <div className="flex items-center justify-between mb-2">
            <div className="flex items-center gap-2">
              <img
                src={post.userPhoto}
                alt="perfil"
                className="w-7 h-7 sm:h-8 sm:w-8 rounded-full"
              />
              <span className="font-semibold text-white text-xs sm:text-sm">
                {post.userName}
              </span>
            </div>

            {/* MENU POST */}
            {user?.uid === post.userId && (
              <div className="relative">
                <button
                  onClick={() => toggleMenu(post.id)}
                  className="w-6 h-6 text-gray-400 hover:text-white"
                >
                  <EllipsisHorizontalIcon />
                </button>

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

          {/* CONTENIDO */}
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
              <p className="text-gray-200 text-sm sm:text-base break-words">
                {post.text}
              </p>

              {post.imageUrl && (
                <img
                  src={post.imageUrl}
                  alt="Post"
                  className="mt-2 w-full max-h-64 sm:max-h-80 object-contain rounded"
                />
              )}

              {/* LIKES Y COMENTARIOS */}
              <div className="flex items-center gap-6 mt-4 text-xs sm:text-sm">
                <button
                  onClick={() => toggleLike(post.id, post.likes || [])}
                  className="flex items-center gap-1 text-gray-400 hover:text-red-400"
                >
                  {post.likes?.includes(user?.uid) ? "❤️" : "🤍"}
                  <span>{post.likes?.length || 0}</span>
                </button>

                <button
                  onClick={() => toggleComments(post.id)}
                  className="flex items-center gap-1 text-gray-400 hover:text-gray-200"
                >
                  💬 {post.comments?.length || 0}
                </button>
              </div>

              {/* COMENTARIOS */}
              {showComments[post.id] && (
                <>
                  {user && (
                    <form
                      onSubmit={(e) => handleAddComment(e, post.id)}
                      className="mt-3 flex flex-col sm:flex-row gap-2"
                    >
                      <input
                        type="text"
                        placeholder="Escribe un comentario..."
                        className="flex-1 p-2 rounded bg-gray-800 text-gray-200 text-xs sm:text-sm"
                        value={commentText[post.id] || ""}
                        onChange={(e) =>
                          setCommentText({
                            ...commentText,
                            [post.id]: e.target.value,
                          })
                        }
                      />
                      <button className="text-xs sm:text-sm text-gray-300 ">
                        Enviar
                      </button>
                    </form>
                  )}

                  {post.comments?.map((c, index) => (
                    <div
                      key={index}
                      className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 bg-gray-900 p-3 rounded-md"
                    >
                      <div className="flex items-center gap-2">
                        <img src={c.photo} className="w-6 h-6 rounded-full" />
                        <p className="flex-1 text-xs sm:text-sm text-gray-300 break-words">
                          <strong>{c.name}</strong>: {c.text}
                        </p>
                      </div>

                      {user?.uid === c.uid && (
                        <button
                          onClick={() =>
                            setCommentToDelete({
                              postId: post.id,
                              comment: c,
                            })
                          }
                          className="self-end sm:self-auto text-gray-400 hover:text-white text-xs"
                        >
                          •••
                        </button>
                      )}
                    </div>
                  ))}
                </>
              )}
            </>
          )}
        </div>
      ))}

      {/* MODAL ELIMINAR COMENTARIO */}
      {commentToDelete && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm">
          <div className="bg-gray-900 rounded-xl shadow-xl p-6 max-w-sm w-full text-center">
            <p className="text-gray-100 text-xs sm:text-sm font-medium mb-4">
              ¿Eliminar este comentario?
            </p>

            <div className="flex justify-center gap-6">
              <button
                onClick={async () => {
                  await handleDeleteComment(
                    commentToDelete.postId,
                    commentToDelete.comment
                  );
                  setCommentToDelete(null);
                }}
                className="text-red-400 hover:text-red-300 text-xs "
              >
                Eliminar
              </button>

              <button
                onClick={() => setCommentToDelete(null)}
                className="text-gray-400 hover:text-gray-300 text-xs"
              >
                Cancelar
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
