import { useState, useEffect } from "react"
import Comment from "./Comment";
import CommentForm from "./CommentForm";
import Cookies from 'js-cookie';
import { createComment, UpdateComment, RemoveComment } from "../services/CommentService"
import "../../assets/styles/Components/commentstyle.css"
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { getCommentsbyRecipeId } from "../services/CommentService"
import { useNavigate } from "react-router-dom";
import { getAccountById } from "../services/AccountService"
import { getRecipeById } from "../services/RecipeService"
import { createNotification } from "../services/NotificationService"
import Swal from 'sweetalert2';
import { decryptData } from "../Encrypt/encryptionUtils";

//import PropTypes from "prop-types";
import { useSocket } from "../../App"
const Comments = ({ recipeId, createById,accountIdonline, roleaccountonline }) => {
    const accountId = decryptData(Cookies.get("UserId"));
    const [backendComments, setBackendComments] = useState([]); // All comments
    const [visibleComments, setVisibleComments] = useState(3); // Number of comments to display initially
    const [activeComment, setActiveComment] = useState(null); //  Tracks active comment for editing
    const [recipe, setRecipe] = useState(null)
    const backgroundPromise = [];
    const [createbyName, setCreatebyName] = useState(null);
    const navigate = useNavigate();
    const Comments = backendComments
        .filter((comment) => comment.rootCommentId === null)
        .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
    const getReplies = (commentId) => {
        const replies = backendComments
            .filter((comment) => comment.rootCommentId === commentId)
            .sort(
                (a, b) =>
                    new Date(a.date).getTime() - new Date(b.date).getTime()
            );
        return replies;
    }

    const deleteComment = async (commentId) => {
        Swal.fire({
            text: "Bạn có thực sự muốn xóa bình luận này?",
            icon: "question",
            showCancelButton: true,
            confirmButtonColor: "#3085d6",
            cancelButtonColor: "#d33",
            confirmButtonText: "Có, xóa nó!",
            cancelButtonText: "Không"
        }).then(async (result) => {
            if (result.isConfirmed) {
                await RemoveComment(commentId);
                setBackendComments(backendComments.filter((comment) => comment.id !== commentId));
                backgroundPromise.push(backendComments);
            }
        });
    };


    const updateComment = async (text, commentId, rootcommentId) => {
        const updateCommentData = {
            rootcommentId,
            content: text,
            date: new Date().toISOString(),
            status: 1,
            bookId: null,
            ebookId: null,
            customerId: accountId,
            recipeId,
        };
        await UpdateComment(updateCommentData, commentId);
        setBackendComments(backendComments.map((comment) =>
            comment.id === commentId ? { ...comment, content: text } : comment
        ));
        backgroundPromise.push(backendComments)
        setActiveComment(null);
    }
    const handleWriteClick = (text) => {
        if (!accountId) {
            Swal.fire({
                text: "Bạn cần đăng nhập để bình luận được. Bạn có muốn đăng nhập không?",
                icon: "question",
                showCancelButton: true,
                confirmButtonColor: "#3085d6",
                cancelButtonColor: "#d33",
                confirmButtonText: "Đăng nhập",
                cancelButtonText: "Không"
            }).then(async (result) => {
                if (result.isConfirmed) {
                    navigate("/login");
                }
            });
        } else {
            addComment(text); // Call your addComment function if logged in      
        }
    };

    const { socket, accountOnline } = useSocket();
    const handleNotification = (text) => {
        socket.emit("sendNotification", {
            senderName: accountOnline,
            receiverName: createbyName,
            content: text,
        });
        if(accountIdonline!==createById){
            const addNotification = () => {
                const newNotificationData = {
                    accountId: createById,
                    content: text,
                    date: new Date().toISOString(),
                    status: 1,
                };
                createNotification(newNotificationData); // Không cần await
            };
            addNotification();
        }
       
    };

    useEffect(() => {
        const fetchComment = async () => {
            try {
                await Promise.all(backgroundPromise)
                const data = await getCommentsbyRecipeId(recipeId);
                const receiverName = await getAccountById(createById);
                const recipedata = await getRecipeById(recipeId);
                setRecipe(recipedata)
                setCreatebyName(receiverName.userName);
                setBackendComments(data);
            } catch (err) {
                console.error(err);
            }
        };
        fetchComment();
    }, [recipeId, backgroundPromise, createById]);

    const addComment = async (text, rootCommentId = null) => {
        const newCommentData = {
            rootCommentId,
            content: text,
            date: new Date().toISOString(),
            status: 1,
            bookId: null,
            ebookId: null,
            customerId: accountId,
            recipeId,
        };
        const comment = await createComment(newCommentData);
        setBackendComments([comment, ...backendComments]);
        backgroundPromise.push(backendComments)
        setActiveComment(null);

    };
    return (
        <>
            <ToastContainer />
            <div className="comments">
                <h3 className="comments-title">Bình luận</h3>
                <CommentForm
                    submitLabel="Gửi"
                    handleSubmit={handleWriteClick}
                    onClick={() => handleNotification(`${accountOnline} đã bình luận về công thức ${recipe.recipeName} của bạn`)}
                />
                <div className="comments-container">
                    {Comments.slice(0, visibleComments).map((comment) => {
                        return (
                            <Comment
                                key={comment.commentId}
                                comment={comment}
                                replies={getReplies(comment.commentId)}
                                activeComment={activeComment}
                                setActiveComment={setActiveComment}
                                addComment={addComment}
                                updateComment={updateComment}
                                deleteComment={deleteComment}
                                rootCommentId={comment.rootCommentId}
                                currentUserId={Number(accountId)}
                                createByUserId={Number(createById)}
                                roleaccountonline={Number(roleaccountonline)}
                            />
                        );
                    })}
                </div>
                {visibleComments < Comments.length && (
                    <button
                        className="see-more-button text-blue-500 underline"
                        onClick={() => setVisibleComments(visibleComments + 3)}

                    >
                        Xem thêm
                    </button>
                )}
            </div>
        </>
    );
};

// // Validate socket prop type
// Comments.propTypes = {
//     socket: PropTypes.object, // Ensures socket is passed as a required object prop
// };
export default Comments;