import prisma from "../config/database.js";

export const createPost = async ({authorId, title, slug, content, coverImageUrl }) => {
    const post = await prisma.post.create({
        data: {
            authorId,
            title,
            slug,
            content,
            coverImageUrl,
        },
    });

    return post;
};

export const getAllPosts = async (viewerId = null) => {
    const posts = await prisma.post.findMany({
        where: {
            status: "PUBLISHED",
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
                            isPrivate: true,
                        },
                    },
                },
            },
        },
        orderBy: {
            createdAt: "desc",
        },
    });

    const visiblePosts = [];

    for(const post of posts){
        const authorId = post.author.id;
        const isPrivate = post.author.profile?.isPrivate ?? false;

        if (!isPrivate) {
            visiblePosts.push(post);
            continue;
        }

        if (viewerId === authorId) {
            visiblePosts.push(post);
            continue;
        }

        if (!viewerId) {
            continue;
        }

        // console.log("Checking follow:",viewerId,"→",authorId);

        const follow = await prisma.follow.findUnique({
            where: {
                followerId_followingId: {
                    followerId: viewerId,
                    followingId: authorId,
                },
            },
        });

        // console.log("FOLLOW RESULT:", follow);
        if (follow) {
            visiblePosts.push(post);
        }
    }

    return visiblePosts;
};

// with updated private posts
export const getPostById = async (id, viewerId = null) => {
    const post = await prisma.post.findFirst({
        where: {
            id,
            status: "PUBLISHED",
        },
        include: {
            author: {
                select: {
                    id: true,
                    email: true,
                    profile: {
                        select: {
                            username: true,
                            displayName: true,
                            avatarUrl: true,
                            isPrivate: true,
                        },
                    },
                },
            },
        },
    });

    if(!post) return null;

    const authorId = post.author.id;
    const isPrivate = post.author.profile?.isPrivate ?? false;

    if (!isPrivate) {
        return post;
    }

    if (viewerId === authorId) {
        return post;
    }

    if (!viewerId) {
        return null;
    }

    const follow = await prisma.follow.findUnique({
        where: {
            followerId_followingId: {
                followerId: viewerId,
                followingId: authorId,
            },
        },
    });

    if (!follow) {
        return null;
    }

    return post;
};

export const getMyPosts = async(authorId) => {
    const posts = await prisma.post.findMany({
        where: {
            authorId,
        },
        orderBy: {
            createdAt: "desc",
        },
    });

    return posts;
}

export const updatePost = async ({
    postId,
    authorId,
    title,
    slug,
    content,
    coverImageUrl,
}) => {
    const post = await prisma.post.findUnique({
        where: {
            id: postId,
        },
    });

    if(!post){
        return null;
    }

    if(post.authorId !== authorId){
        return "FORBIDDEN";
    }
    
    const updatePost = await prisma.post.update({
        where:{
            id: postId,
        },
        data: {
            title,
            slug,
            content,
            coverImageUrl,
        },
    });

    return updatePost;
}

export const deletePost = async ({postId, authorId}) => {
    const post = await prisma.post.findUnique({
        where: {
            id: postId,
        },
    });

    if(!post){
        return null;
    }

    if(post.authorId !== authorId){
        return "FORBIDDEN";
    }

    await prisma.post.delete({
        where: {
            id: postId,
        },
    });

    return true;
}

// Post lifecycle, like Published or not , archived posts 

export const publishPost = async ({postId, authorId}) => {
    const post = await prisma.post.findUnique({
        where: {
            id: postId,
        },
    });

    if(!post){
        return null;
    }

    if(post.authorId !== authorId){
        return "FORBIDDEN";
    }

    const publishedPost = await prisma.post.update({
        where: {
            id: postId,
        },
        data: {
            status: "PUBLISHED",
            publishedAt: new Date(),
        },
    });

    return publishedPost;

}


export const archivePost = async ({postId, authorId}) => {
    const post = await prisma.post.findUnique({
        where: {
            id: postId,
        },
    });

    if(!post){
        return null;
    }

    if(post.authorId !== authorId){
        return "FORBIDDEN";
    }

    const archivedPost = await prisma.post.update({
        where: {
            id: postId,
        },
        data: {
            status: "ARCHIVED",
        },
    });

    return archivedPost;

}