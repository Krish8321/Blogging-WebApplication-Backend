import prisma from "../config/database.js";

export const getMyProfile = async (userId) => {
    const user = await prisma.user.findUnique({
        where: {
            id: userId,
        },
        include: {
            profile: true,
        },
    });

    return user;
};

export const getAllUsers = async () => {
    const users = await prisma.user.findMany({
        where: {
            isVerified: true,
        },
        select: {
            id: true,
            profile: {
                select: {
                    username: true,
                    displayName: true,
                    avatarUrl: true,
                    bio: true,
                    website: true,
                    isPrivate: true,
                },
            },
        },
        orderBy: {
            createdAt: "desc",
        },
    });

    return users;
};

export const updateMyProfile = async (userId, data) => {
    const updatedProfile = await prisma.profile.update({
        where: {
            userId,
        },
        data,
    });

    return updateMyProfile;
};

export const getPublicProfile = async (username) => {
    const user = await prisma.profile.findUnique({
        where: {
            username,
        },
        select: {
            userId: true,
            username: true,
            displayName: true,
            bio: true,
            avatarUrl: true,
            website: true,
            github: true,
            linkedin: true,
            isPrivate: true,
        },
    });

    return user;
};

export const followUser = async (followerId, username) => {
    const targetProfile = await prisma.profile.findUnique({
        where: {
            username,
        },
        select: {
            userId : true,
            username : true,
        },
    });

    if(!targetProfile) return {error : "USER_NOT_FOUND"};

    if(followerId === targetProfile.userId) return {error: "CANNOT_FOLLOW_SELF"};

    const existingFollow = await prisma.follow.findUnique({
        where: {
            followerId_followingId: {
                followerId,
                followingId: targetProfile.userId,
            },
        },
    });

    if(existingFollow) return {error: "ALREADY_FOLLOWING"};

    const follow = await prisma.follow.create({
        data: {
            followerId,
            followingId: targetProfile.userId,
        },
    });

    return {follow};

};

export const unfollowUser = async (followerId, username) => {
    const targetProfile = await prisma.profile.findUnique({
        where: {
            username,
        },
        select: {
            userId: true,
            username: true,
        },
    });

    if (!targetProfile) {
        return {
            error: "USER_NOT_FOUND",
        };
    }

    if (followerId === targetProfile.userId) {
        return {
            error: "CANNOT_UNFOLLOW_SELF",
        };
    }

    const existingFollow = await prisma.follow.findUnique({
        where: {
            followerId_followingId: {
                followerId,
                followingId: targetProfile.userId,
            },
        },
    });

    if (!existingFollow) {
        return {
            error: "NOT_FOLLOWING",
        };
    }

    await prisma.follow.delete({
        where: {
            followerId_followingId: {
                followerId,
                followingId: targetProfile.userId,
            },
        },
    });

    return {success : true};

};

export const getFollowers = async (username) => {
    const profile = await prisma.profile.findUnique({
        where: {
            username,
        },
        select: {userId: true},
    });

    if(!profile) return {error: "USER_NOT_FOUND"};

    const followers = await prisma.follow.findMany({
        where: {
            followingId: profile.userId,
        },
        select: {
            follower: {
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

    return {followers};
};

export const getFollowing = async (username) => {
    const profile = await prisma.profile.findUnique({
        where: {
            username,
        },
        select: {
            userId: true,
        },
    });

    if (!profile) return{error: "USER_NOT_FOUND"};

    const following = await prisma.follow.findMany({
        where: {
            followerId: profile.userId,
        },
        select: {
            following: {
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

    return {following};
};

export const searchUsersByUsername = async (username) => {
    const users = await prisma.user.findMany({
        where: {
            isVerified: true,
            profile: {
                username: {
                    contains: username,
                    mode: "insensitive",
                },
            },
        },
        select: {
            id: true,
            profile: {
                select: {
                    username: true,
                    displayName: true,
                    avatarUrl: true,
                    bio: true,
                    website: true,
                    isPrivate: true,
                },
            },
        },
        orderBy: {
            createdAt: "desc",
        },
    });

    return users;
};