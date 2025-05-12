import { PrismaClient, FriendRequestStatus } from "@prisma/client";
import { fail, redirect } from "@sveltejs/kit";
import type { PageServerLoad, Actions } from "./$types";

const prisma = new PrismaClient();

export const load: PageServerLoad = async ({ locals }) => {
  if (!locals.user) {
    throw redirect(303, "/login");
  }

  const currentUserId = locals.user.id;

  try {
    const allUsers = await prisma.user.findMany({
      select: { id: true, username: true },
    });

    const receivedRequests = await prisma.friendRequest.findMany({
      where: {
        receiverId: currentUserId,
        status: FriendRequestStatus.PENDING,
      },
      include: {
        requester: { select: { id: true, username: true } },
      },
    });

    const sentRequests = await prisma.friendRequest.findMany({
      where: {
        requesterId: currentUserId,
        // status: FriendRequestStatus.PENDING, // Show all sent requests, not just pending
      },
      include: {
        receiver: { select: { id: true, username: true } },
      },
    });

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
      currentUser: locals.user,
      allUsers,
      receivedRequests,
      sentRequests,
      friends,
    };
  } catch (error) {
    console.error("Error loading friends page data:", error);
    return {
      currentUser: locals.user,
      allUsers: [],
      receivedRequests: [],
      sentRequests: [],
      friends: [],
      error: "Could not load friend data.",
    };
  }
};

export const actions: Actions = {
  sendRequest: async ({ request, locals }) => {
    if (!locals.user) {
      return fail(401, { error: "User not authenticated" });
    }
    const currentUserId = locals.user.id;
    const data = await request.formData();
    const receiverId = data.get("receiverId") as string;

    if (!receiverId) {
      return fail(400, { error: "Receiver ID is required" });
    }

    if (receiverId === currentUserId) {
      return fail(400, { error: "You cannot send a friend request to yourself" });
    }

    try {
      const existingRequest = await prisma.friendRequest.findFirst({
        where: {
          OR: [
            { requesterId: currentUserId, receiverId: receiverId },
            { requesterId: receiverId, receiverId: currentUserId },
          ],
        },
      });

      if (existingRequest && existingRequest.status === FriendRequestStatus.PENDING) {
        return fail(400, { error: "Friend request already pending." });
      }
      if (existingRequest && existingRequest.status === FriendRequestStatus.ACCEPTED) {
        return fail(400, { error: "You are already friends with this user." });
      }

      const existingFriendship = await prisma.friendship.findFirst({
        where: {
          OR: [
            { userOneId: currentUserId, userTwoId: receiverId },
            { userOneId: receiverId, userTwoId: currentUserId },
          ]
        }
      });

      if (existingFriendship) {
        return fail(400, { error: "You are already friends with this user." });
      }
      
     
      if (existingRequest && existingRequest.status === FriendRequestStatus.DECLINED) {
        await prisma.friendRequest.update({
          where: { id: existingRequest.id },
          data: { status: FriendRequestStatus.PENDING, requesterId: currentUserId, receiverId: receiverId }, 
        });
      } else {
        await prisma.friendRequest.create({
          data: {
            requesterId: currentUserId,
            receiverId: receiverId,
            status: FriendRequestStatus.PENDING,
          },
        });
      }
      return { successMessage: "Friend request sent!" };
    } catch (error) {
      console.error("Error sending friend request:", error);
      return fail(500, { error: "Could not send friend request. Please try again." });
    }
  },

  acceptRequest: async ({ request, locals }) => {
    if (!locals.user) {
      return fail(401, { error: "User not authenticated" });
    }
    const currentUserId = locals.user.id;
    const data = await request.formData();
    const requestId = data.get("requestId") as string;

    if (!requestId) {
      return fail(400, { error: "Request ID is required" });
    }

    try {
      const friendRequest = await prisma.friendRequest.findUnique({
        where: { id: requestId },
      });

      if (!friendRequest || friendRequest.receiverId !== currentUserId) {
        return fail(404, { error: "Friend request not found or you are not the receiver." });
      }

      if (friendRequest.status !== FriendRequestStatus.PENDING) {
        return fail(400, { error: "This request is no longer pending." });
      }

      
      await prisma.$transaction(async (tx) => {
        await tx.friendRequest.update({
          where: { id: requestId },
          data: { status: FriendRequestStatus.ACCEPTED },
        });

        
        const userOneId = friendRequest.requesterId < friendRequest.receiverId ? friendRequest.requesterId : friendRequest.receiverId;
        const userTwoId = friendRequest.requesterId < friendRequest.receiverId ? friendRequest.receiverId : friendRequest.requesterId;

        await tx.friendship.create({
          data: {
            userOneId: userOneId,
            userTwoId: userTwoId,
          },
        });
      });

      return { successMessage: "Friend request accepted!" };
    } catch (error) {
      console.error("Error accepting friend request:", error);
      return fail(500, { error: "Could not accept friend request. Please try again." });
    }
  },

  declineRequest: async ({ request, locals }) => {
    if (!locals.user) {
      return fail(401, { error: "User not authenticated" });
    }
    const currentUserId = locals.user.id;
    const data = await request.formData();
    const requestId = data.get("requestId") as string;

    if (!requestId) {
      return fail(400, { error: "Request ID is required" });
    }

    try {
      const friendRequest = await prisma.friendRequest.findUnique({
        where: { id: requestId },
      });

      if (!friendRequest || friendRequest.receiverId !== currentUserId) {
        return fail(404, { error: "Friend request not found or you are not the receiver." });
      }

      if (friendRequest.status !== FriendRequestStatus.PENDING) {
        return fail(400, { error: "This request is no longer pending." });
      }

      await prisma.friendRequest.update({
        where: { id: requestId },
        data: { status: FriendRequestStatus.DECLINED },
      });

      return { successMessage: "Friend request declined." };
    } catch (error) {
      console.error("Error declining friend request:", error);
      return fail(500, { error: "Could not decline friend request. Please try again." });
    }
  },
};

