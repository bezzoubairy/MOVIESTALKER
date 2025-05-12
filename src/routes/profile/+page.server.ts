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

    return {
      currentUser: user,
      friends,
    };
  } catch (error) {
    console.error(`[profile/+page.server.ts] Error loading profile page data for user ${currentUserId}:`, error);
    return {
      currentUser: locals.user, // Fallback to locals.user
      friends: [],
      error: "Could not load all profile data.",
    };
  }
};

