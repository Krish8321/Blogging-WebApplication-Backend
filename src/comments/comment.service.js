import prisma from "../config/database.js";

export const createComment = async (postId, authorId, content) => {
    const post = await prisma.post.findUnique({
        where: {
            id: postId,
        },
        include: {
            author: {
                select: {
                    id: true,
                    profile: {
                        select: {
                            isPrivate: true,
                        },
                    },
                },
            },
        },
    });

    if(!post) return {
        error: "Post not found",
        statusCode: 404,
    };

    if(post.status !== "PUBLISHED") return {
        error: "Comments are allowed only on published post",
        statusCode: 403,
    };

    if(post.author.profile?.isPrivate && post.authorId !== authorId){
        const follow = await prisma.follow.findUnique({
            where: {
                followerId_followingId: {
                    followerId: authorId,
                    followingId: post.author.id,
                },
            },
        });

        if (!follow) return {
            error: "You are not allowed to comment on this post",
            statusCode: 403,
        };
    }

    const comment = await prisma.comment.create({
        data: {
            content,
            authorId,
            postId,
        },
        include: {
            author: {
                select: {
                    id: true,
                    profile: {
                        select: {
                            username: true,
                            displayName: true,
                            avatarUrl: true,
                        },
                    },
                },
            },
        },
    });
    return comment;
};

export const getComments = async (postId, viewerId = null) => {

    const post = await prisma.post.findUnique({
        where: {
            id: postId,
        },
        include: {
            author: {
                select: {
                    id: true,
                    profile: {
                        select: {
                            isPrivate: true,
                        },
                    },
                },
            },
        },
    });

    if(!post) return {
        error: "Post not found",
        statusCode: 404,
    };

    if(post.status !== "PUBLISHED") return {
        error: "Comments are not available for this post",
        statusCode: 403,
    };

    if (post.author.profile?.isPrivate && post.author.id !== viewerId) {

        if (!viewerId) {
            return {
                error: "You are not allowed to view comments on this post",
                statusCode: 403,
            };
        }

        const follow = await prisma.follow.findUnique({
            where: {
                followerId_followingId: {
                    followerId: viewerId,
                    followingId: post.author.id,
                },
            },
        });

        if (!follow) {
            return {
                error: "You are not allowed to view comments on this post",
                statusCode: 403,
            };
        }
    }

    const comments = await prisma.comment.findMany({
        where: {
            postId,
        },
        include: {
            author: {
                select: {
                    id: true,
                    profile: {
                        select: {
                            username: true,
                            displayName: true,
                            avatarUrl: true,
                        },
                    },
                },
            },
        },
        orderBy: {
            createdAt: "desc",
        },
    });

    return comments;
};

export const updateComment = async (commentId, authorId, content) => {
    const comment = await prisma.comment.findUnique({
        where: {
            id: commentId,
        },
    });

    if (!comment) {
        return {
            error: "Comment not found",
            statusCode: 404,
        };
    }

    if (comment.authorId !== authorId) {
        return {
            error: "You are not allowed to update this comment",
            statusCode: 403,
        };
    }

    const updatedComment = await prisma.comment.update({
        where: {
            id: commentId,
        },
        data: {
            content,
        },
        include: {
            author: {
                select: {
                    id: true,
                    profile: {
                        select: {
                            username: true,
                            displayName: true,
                            avatarUrl: true,
                        },
                    },
                },
            },
        },
    });

    return updatedComment;
};

export const deleteComment = async (commentId, authorId) => {
    const comment = await prisma.comment.findUnique({
        where:{
            id: commentId,
        },
    });

    if(!comment) return {
        error: "Comment Not Found",
        statusCode : 404,
    };

    if (comment.authorId !== authorId) return {
        error: "You are not allowed to delete this comment",
        statusCode: 403,
    };

    await prisma.comment.delete({
        where: {
            id: commentId,
        },
    });

    return {
        success: true,
        message: "Comment deleted successfully",
    };
}