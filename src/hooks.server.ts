import { PrismaClient } from '@prisma/client';
import type { Handle } from '@sveltejs/kit';

const prisma = new PrismaClient();

export const handle: Handle = async ({ event, resolve }) => {
  const sessionId = event.cookies.get('session_id');

  if (sessionId) {
    // In a real app, you would look up the session in a session store
    // or validate a JWT. For this example, we'll assume the sessionId is the user's ID.
    // This is NOT secure for a production application.
    // A more secure approach would involve a session table or JWTs.
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

