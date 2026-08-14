import express from "express";
import { authMiddleware, getPostMiddleware } from "../auth/auth.middleware.js";
import { createComment,getComments, updateComment, deleteComment } from "./comment.service.js";
import { success } from "zod";

const router = express.Router();

router.post("/:postId", authMiddleware, async(req, res) => {
    try{
        const { postId } = req.params;
        const { content } = req.body;

        if (!content || !content.trim()) {
            return res.status(400).json({
                success: false,
                message: "Comment content is required",
            });
        }

        const result = await createComment(
            postId,
            req.user.userId,
            content.trim()
        );

        if (result?.error) {
            return res.status(result.statusCode).json({
                success: false,
                message: result.error,
            });
        }

        return res.status(201).json({
            success: true,
            comment: result,
        });

    }catch (err){
        console.error(err);

        return res.status(500).json({
            success: false,
            message: "Internal Server Error(CreateComment)",
        });
    }
});

router.get("/:postId", getPostMiddleware, async (req, res) => {
    try{
        const {postId} = req.params;
        const viewerId = req.user?.userId ?? null;

        const result = await getComments(postId, viewerId);

        if (result?.error) {
            return res.status(result.statusCode).json({
                success: false,
                message: result.error,
            });
        }

        return res.status(200).json({
            success: true,
            comments: result,
        });

    }catch (err){
        console.error(err);

        return res.status(500).json({
            success: false,
            message: "Internal Server Error (get comments error)",
        })
    }
});

router.patch("/:commentId", authMiddleware, async (req, res) => {
    try{
        const { commentId } = req.params;
        const { content } = req.body;

        if (!content || !content.trim()) {
            return res.status(400).json({
                success: false,
                message: "Comment content is required",
            });
        }

        const result = await updateComment(commentId, req.user.userId, content.trim());

        // console.log("Updated Result: ", result);

        if (result?.error) {
            return res.status(result.statusCode).json({
                success: false,
                message: result.error,
            });
        }

        return res.status(200).json({
            success: true,
            comment: result,
        });

    }catch (err){
        console.error(err);

        return res.status(500).json({
            success: false,
            message: "Internal Server Error (UpdateCommentError)",
        })
    }
});

router.delete("/:commentId", authMiddleware, async (req, res) => {
    try{
        const {commentId} = req.params;

        const result = await deleteComment(commentId, req.user.userId);

        if (result?.error) {
            return res.status(result.statusCode).json({
                success: false,
                message: result.error,
            });
        }

        return res.status(200).json(result);

    }catch (err){
        console.error(err);

        return res.status(500).json({
            success: false,
            message: "Internal Server Error (deleteCommentError)",
        })
    }
});

export default router;