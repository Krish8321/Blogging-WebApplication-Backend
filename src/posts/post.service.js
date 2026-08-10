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


export const getAllPosts = async (req, res) => {
    const posts = await prisma.post.findMany({
        where: {
            status: "PUBLISHED",
        },
        include: {
            author: {
                select: {
                    id: true,
                    email: true,
                },
            },
        },
        orderBy: {
            createdAt: "desc",
        },
    });
    return posts;
};

export const getPostById = async (id) => {
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
                },
            },
        },
    });
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