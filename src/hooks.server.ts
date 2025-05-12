import { PrismaClient } from '@prisma/client';
import type { Handle } from '@sveltejs/kit';

const prisma = new PrismaClient();

export const handle: Handle = async ({ event, resolve }) => {
  const sessionId = event.cookies.get('session_id');

  if (sessionId) {
    
    const user = await prisma.user.findUnique({
      where: { id: sessionId }, // Assuming sessionId is the user ID for simplicity
    });

    if (user) {
      event.locals.user = {
        id: user.id,
        username: user.username,
        email: user.email,
      };
    }
  }

  const response = await resolve(event);
  return response;
};

