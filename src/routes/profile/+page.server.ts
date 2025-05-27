import { redirect } from "@sveltejs/kit";
import type { PageServerLoad } from "./$types";
import prisma from "$lib/server/prisma";

export const load: PageServerLoad = async ({ locals }) => {
  if (!locals.user) {
    throw redirect(303, "/login");
  }

  const currentUserId = locals.user.id;

  try {
    const user = await prisma.user.findUnique({
      where: { id: currentUserId },
      select: {
        id: true,
        username: true,
        email: true,
        createdAt: true,
      },
    });

    if (!user) {
      throw redirect(303, "/login");
    }

    // Fetch friends
    const friendships = await prisma.friendship.findMany({
      where: {
        OR: [
          { userOneId: currentUserId },
          { userTwoId: currentUserId },
        ],
      },
      include: {
        userOne: { select: { id: true, username: true } },
        userTwo: { select: { id: true, username: true } },
      },
    });

    const friends = friendships.map(f => {
      return f.userOneId === currentUserId ? f.userTwo : f.userOne;
    });

    // Get user stats
    const favoriteCount = await prisma.favoriteItem.count({
      where: { userId: currentUserId }
    });

    const recentlyViewedCount = await prisma.recentlyViewedItem.count({
      where: { userId: currentUserId }
    });

    const commentCount = await prisma.comment.count({
      where: { userId: currentUserId }
    });

    const ratingCount = await prisma.userMovieRating.count({
      where: { userId: currentUserId }
    });

    // Get recent activity
    const recentFavorites = await prisma.favoriteItem.findMany({
      where: { userId: currentUserId },
      orderBy: { dateAdded: 'desc' },
      take: 5,
      include: { movie: true }
    });

    const recentComments = await prisma.comment.findMany({
      where: { userId: currentUserId },
      orderBy: { createdAt: 'desc' },
      take: 5,
      include: { movie: true }
    });

    return {
      currentUser: user,
      friends,
      stats: {
        favoriteCount,
        recentlyViewedCount,
        commentCount,
        ratingCount
      },
      activity: {
        recentFavorites,
        recentComments
      }
    };
  } catch (error) {
    console.error(`[profile/+page.server.ts] Error loading profile page data for user ${currentUserId}:`, error);
    return {
      currentUser: locals.user, 
      friends: [],
      stats: {
        favoriteCount: 0,
        recentlyViewedCount: 0,
        commentCount: 0,
        ratingCount: 0
      },
      activity: {
        recentFavorites: [],
        recentComments: []
      },
      error: "Could not load all profile data."
    };
  }
};

