import { PrismaClient } from "@prisma/client";
import bcrypt from "bcrypt";
import type { Actions } from "./$types";
import { fail, redirect, isRedirect } from "@sveltejs/kit"; // Import isRedirect

const prisma = new PrismaClient();

export const actions: Actions = {
  login: async ({ request, cookies }) => {
    const data = await request.formData();
    const usernameOrEmail = data.get("username") as string;
    const password = data.get("password") as string;

    if (!usernameOrEmail || !password) {
      return fail(400, { error: "Username/Email and password are required.", username: usernameOrEmail });
    }

    try {
      let user = await prisma.user.findUnique({
        where: { username: usernameOrEmail },
      });

      if (!user) {
        user = await prisma.user.findUnique({
          where: { email: usernameOrEmail },
        });
      }

      if (!user) {
        return fail(400, { error: "Invalid username/email or password.", username: usernameOrEmail });
      }

      const passwordMatch = await bcrypt.compare(password, user.passwordHash);

      if (!passwordMatch) {
        return fail(400, { error: "Invalid username/email or password.", username: usernameOrEmail });
      }

      cookies.set("session_id", user.id, { 
        path: "/",
        httpOnly: true,
        sameSite: "strict",
        secure: process.env.NODE_ENV === "production",
        maxAge: 60 * 60 * 24 * 7, // 1 week
      });

      throw redirect(303, "/"); 

    } catch (error) {
      if (isRedirect(error)) { // Check if it's a redirect and re-throw
        throw error;
      }
      console.error("Login error:", error);
      return fail(500, { error: "An unexpected error occurred. Please try again.", username: usernameOrEmail });
    }
  },
};

