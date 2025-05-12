import { redirect } from '@sveltejs/kit';
import type { RequestHandler } from './$types';

// Handle POST request to /logout
export const POST: RequestHandler = async ({ cookies }) => {
  // Clear the session cookie
  cookies.delete('session_id', { path: '/' });

  // Redirect to the homepage
  throw redirect(303, '/');
};

// Optionally, handle GET request if you want a simple link for logout
// However, POST is generally preferred for actions that change state (like logging out)
export const GET: RequestHandler = async ({ cookies }) => {
  // Clear the session cookie
  cookies.delete('session_id', { path: '/' });

  // Redirect to the homepage
  throw redirect(303, '/');
};

