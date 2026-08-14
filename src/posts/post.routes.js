import express from "express";
import { authMiddleware, getPostMiddleware } from "../auth/auth.middleware.js";
import { success } from "zod";
import { createPost, getAllPosts, getPostById, getMyPosts } from "./post.service.js";
import { updatePost, deletePost, publishPost, archivePost } from "./post.service.js";

const router = express.Router();

router.post("/", authMiddleware, async (req, res)=> {
    try{
        const {title, slug, content, coverImageUrl} = req.body;
        
        if(!title || !slug || !content){
            return res.status(400).json({
                success: false,
                message: "Title, slug, and content are required!",
            });
        }
        
        const post = await createPost({
            authorId : req.user.userId,
            title,
            slug,
            content,
            coverImageUrl,
        });

        return res.status(201).json({
            success: true,
            message: "Post Created Successfully!!!",
            post,
        });
    }catch (err){
        console.error(err);

        return res.status(500).json({
            success: false,
            message: "Internal Server Error(createPost)",
        });
    }
});

router.get("/",getPostMiddleware, async(req, res) => {
    try{
        const viewerId = req.user?.userId ?? null;
        const posts = await getAllPosts(viewerId);

        return res.status(200).json({
            success: true,
            posts,
        });

    }catch (err){
        console.error(err);

        return res.status(500).json({
            success: false,
            message: "Internal Server Error(GetPost)",
        });
    }
});

// my all post 
router.get("/my-posts", authMiddleware, async (req, res) => {
    try{
        const posts =  await getMyPosts(req.user.userId);

        return res.status(200).json({
            success: true,
            posts,
        });
        
    } catch (err){
        console.error(err);

        return res.status(500).json({
            success: false,
            message: "Internal Server Error(my Posts) ",
        })
    }
});

// get post by ID
router.get("/:id",getPostMiddleware, async (req, res) => {
    try{
        const { id } = req.params;

        const viewerId = req.user?.userId ?? null;

        const post = await getPostById(id,viewerId);

        if (!post) {
            return res.status(404).json({
                success: false,
                message: "Post not found",
            });
        }

        return res.status(200).json({
            success: true,
            post,
        });

    }catch(err){
        console.error(err);

        return res.status(500).json({
            success: false,
            message: "Internal Server error (Get Post by ID) ",
        })
    }
})

//update
router.put("/:id", authMiddleware, async (req, res) => {
    try{
        const { id } = req.params;
        
        const { title, slug, content, coverImageUrl } = req.body;
        
        if(!title || !slug || !content){
            return res.status(400).json({
                success: false,
                message: "Title, slug and content are required",
            });
        }

        const post = await updatePost({
            postId: id,
            authorId: req.user.userId,
            title,
            slug,
            content,
            coverImageUrl,
        });

        if (!post) {
            return res.status(404).json({
                success: false,
                message: "Post not found",
            });
        }

        if (post === "FORBIDDEN") {
            return res.status(403).json({
                success: false,
                message: "You are not allowed to update this post",
            });
        }

        return res.status(200).json({
            success: true,
            message: "Post Updated Successfully.",
            post,
        })


    }catch(err){
        console.error(err);

        return res.status(500).json({
            success: false,
            message: "Internal Server error (Updation error)",
        })
    }
})

router.delete("/:id", authMiddleware, async (req, res) => {
    try{
        const { id } = req.params;

        const result = await deletePost({
            postId: id,
            authorId: req.user.userId,
        });

        if(!result){
            return res.status(404).json({
                success: false,
                message: "Post Not Found",
            });
        }

        if(result === "FORBIDDEN"){
            return res.status(403).json({
                success: false,
                message: "You are not allowed to delete this post.",
            });
        }

        return res.status(200).json({
            success: true,
            message: "Post deleted successfully",
        });

    }catch (err){
        console.error(err);

        return res.status(500).json({
            success: false,
            message: "Internal server error (Deleting error)",
        });
    }
})

router.patch("/:id/publish", authMiddleware, async(req, res) => {
    try{
        const { id } = req.params;

        const post = publishPost({
            postId: id,
            authorId: req.user.userId,
        });

        if(!post){
            return res.status(404).json({
                success: false,
                message: "Post not found",
            });
        }

        if(post === "FORBIDDEN"){
            return res.status(403).json({
                success: false,
                message: "You are not allowed to publish this post",
            });
        }

        return res.status(200).json({
            success: true,
            message: "Post published successfully",
            post,
        });

    }catch (err){
        console.error(err);

        return res.status(500).json({
            success: false,
            message: "Internal Server Error (Publishing error)",
        });
    }
});

router.patch("/:id/archive", authMiddleware, async(req, res) => {
    try{
        const { id } = req.params;

        const post = archivePost({
            postId: id,
            authorId: req.user.userId,
        });

        if(!post){
            return res.status(404).json({
                success: false,
                message: "Post not found",
            });
        }

        if(post === "FORBIDDEN"){
            return res.status(403).json({
                success: false,
                message: "You are not allowed to archive this post",
            });
        }

        return res.status(200).json({
            success: true,
            message: "Post archived successfully",
            post,
        });

    }catch (err){
        console.error(err);

        return res.status(500).json({
            success: false,
            message: "Internal Server Error (Archive post error)",
        });
    }
})

export default router;
