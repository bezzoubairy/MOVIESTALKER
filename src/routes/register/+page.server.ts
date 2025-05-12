import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcrypt';
import type { Actions } from './$types';
import { fail } from '@sveltejs/kit';

const prisma = new PrismaClient();
const SALT_ROUNDS = 10;

export const actions: Actions = {
  register: async ({ request }) => {
    const data = await request.formData();
    const username = data.get('username') as string;
    const email = data.get('email') as string;
    const password = data.get('password') as string;

    if (!username || !email || !password) {
      return fail(400, { error: 'All fields are required.', username, email });
    }

    // Basic email validation
    if (!/\S+@\S+\.\S+/.test(email)) {
      return fail(400, { error: 'Invalid email format.', username, email });
    }

    // Basic password length validation
    if (password.length < 8) {
      return fail(400, { error: 'Password must be at least 8 characters long.', username, email });
    }

    try {
      const existingUserByUsername = await prisma.user.findUnique({
        where: { username },
      });
      if (existingUserByUsername) {
        return fail(400, { error: 'Username already exists.', username, email });
      }

      const existingUserByEmail = await prisma.user.findUnique({
        where: { email },
      });
      if (existingUserByEmail) {
        return fail(400, { error: 'Email already registered.', username, email });
      }

      const passwordHash = await bcrypt.hash(password, SALT_ROUNDS);

      await prisma.user.create({
        data: {
          username,
          email,
          passwordHash,
        },
      });

      return { success: true };
    } catch (error) {
      console.error('Registration error:', error);
      return fail(500, { error: 'An unexpected error occurred. Please try again.', username, email });
    }
  },
};

