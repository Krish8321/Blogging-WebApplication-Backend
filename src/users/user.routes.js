import express from "express";
import { authMiddleware } from "../auth/auth.middleware.js";
import { getMyProfile, updateMyProfile, getPublicProfile } from "./user.service.js";
import { followUser, unfollowUser, getFollowers, getFollowing } from "./user.service.js";
import { updateProfileSchema } from "./user.schema.js";
import { success } from "zod";

const router = express.Router();

router.get("/me", authMiddleware, async(req, res) => {
    try{
        const user = await getMyProfile(req.user.userId);

        if(!user){
            return res.status(404).json({
                success: false,
                message: "User Not Found",
            });
        }

        return res.status(200).json({
            success: true,
            user,
        });

    }catch (err){
        console.error(err);

        return res.status(500).json({
            success: false,
            message: "Internal Server Error (while fetching profile)",
        });
    }
});

// used to update the profile like private-public toggle, etc
router.patch("/me", authMiddleware, async (req, res) => {
    try{
        const validation = updateProfileSchema.safeParse(req.body);

        if(!validation.success){
            return res.status(400).json({
                success: false,
                message: "Invalid Profile Data",
                error: validation.error.issues,
            });
        }

        const updatedProfile = await updateMyProfile(
            req.user.userId,
            validation.data
        );

        return res.status(200).json({
            success: true,
            message: "Profile updated successfully",
            profile: updatedProfile,
        });

    }catch (err){
        console.error(err);

        return res.status(500).json({
            success: false,
            message: "Internal Server Error(profile Updation)",
        })
    }
});

router.get("/:username", async (req, res) => {
    try{
        const {username} = req.params;

        const user = await getPublicProfile(username);

        if(!username){
            return res.status(404).json({
                success: false,
                message: "User not found",
            });
        }

        return res.status(200).json({
            success: true,
            user,
        });

    }catch (err){
        console.error(err);

        return res.status(500).json({
            success: false,
            message: "Internal Server Error(Get Public Profile)",
        });
    }
});

router.post("/:username/follow", authMiddleware, async(req, res) => {
    try{
        const { username } = req.params;
        
        const result = await followUser(req.user.userId, username);

        if(result.error === "USER_NOT_FOUND"){
            return res.status(404).json({
                success: false,
                message: "User not found",
            });
        }

        if(result.error === "CANNOT_FOLLOW_SELF"){
            return res.status(400).json({
                success: false,
                message: "You cannot follow yourself",
            });
        }

        if(result.error === "ALREADY_FOLLOWING"){
            return res.status(409).json({
                success: false,
                message: "You are already following this user",
            });
        }

        return res.status(201).json({
            success: true,
            message: "User followed successfully",
            follow: result.follow,
        });


    }catch (err){
        console.error(err);

        return res.status(500).json({
            success: false,
            message: "Internal Server Error(Followuser error)",
        });
    }
});

router.delete("/:username/follow", authMiddleware, async (req, res) => {
    try{
        const {username} = req.params;

        const result = await unfollowUser(req.user.userId, username);

        if (result.error === "USER_NOT_FOUND") {
            return res.status(404).json({
                success: false,
                message: "User not found",
            });
        }

        if (result.error === "CANNOT_UNFOLLOW_SELF") {
            return res.status(400).json({
                success: false,
                message: "You cannot unfollow yourself",
            });
        }

        if (result.error === "NOT_FOLLOWING") {
            return res.status(404).json({
                success: false,
                message: "You are not following this user",
            });
        }

        return res.status(200).json({
            success: true,
            message: "User Unfollow successfully",
        });

    }catch (err){
        console.error(err);

        return res.status(500).json({
            success: true,
            message: "Internal Server Error(Unfollowing)",
        });
    }
});

router.get("/:username/followers", async (req, res) => {
    try{
        const {username} = req.params;

        const result = await getFollowers(username);

        if(result.error === "USER_NOT_FOUND"){
            return res.status(404).json({
                success: false,
                message: "User not found",
            });
        }

        return res.status(200).json({
            success: true,
            followers: result.followers,
        })

    }catch (err){
        console.error(err);

        return res.status(500).json({
            success: false,
            message: "Internl server Error(Get Followers Error)",
        });
    }
});

router.get("/:username/following", async (req, res) => {
    try{
        const {username} = req.params;

        const result = await getFollowing(username);

        if(result.error === "USER_NOT_FOUND"){
            return res.status(404).json({
                success: false,
                message: "User not found",
            });
        }

        return res.status(200).json({
            success: true,
            following: result.following,
        });

    }catch (err){
        console.error(err);

        return res.status(500).json({
            success: false,
            message: "Internal Server Error (get following errror) ",
        });
    }
})

export default router;