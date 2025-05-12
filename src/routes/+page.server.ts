import type { PageServerLoad } from "./$types";
import { getPopularMovies as getTmdbPopularMovies } from "$lib/services/tmdb";
import {
  getRecentlyViewed as getDbRecentlyViewed,
  isInFavorites,
} from "$lib/server/storage";
import { fail } from "@sveltejs/kit";
import type { Actions } from "./$types";
import {
    addToFavorites as dbAddToFavorites,
    removeFromFavorites as dbRemoveFromFavorites
} from "$lib/server/storage";

// Helper function to map posterPath to poster_path for a single movie object
const mapMoviePosterPath = (movie: any) => {
  if (movie && typeof movie.posterPath === 'string') {
    return { ...movie, poster_path: movie.posterPath };
  }
  if (movie && movie.posterPath === null) {
    return { ...movie, poster_path: null };
  }
  return movie; // Return as is if no posterPath or not a string/null
};

export const load: PageServerLoad = async ({ locals }) => {
  const currentUser = locals.user;
  try {
    const popularMoviesResponse = await getTmdbPopularMovies();
    const tmdbPopularMovies = popularMoviesResponse.results || [];

    // Fetch recently viewed movies (these are global in the current storage logic for recently viewed)
    // If recently viewed were user-specific, we would pass currentUser.id here.
    const dbRecentlyViewedItems = await getDbRecentlyViewed(); 
    const recentlyViewedMovies = dbRecentlyViewedItems.map(item => {
        if (item && item.movie) {
            return { ...item, movie: mapMoviePosterPath(item.movie) };
        }
        return item; 
    }).map(item => item?.movie).filter(Boolean);

    const popularMoviesWithStatus = await Promise.all(
      tmdbPopularMovies.map(async (movie) => {
        let inFavorites = false;
        if (currentUser) {
          inFavorites = await isInFavorites(movie.id, currentUser.id);
        }
        return {
          ...movie,
          isInitiallyInFavorites: inFavorites,
        };
      })
    );

    const recentlyViewedWithStatus = await Promise.all(
      (recentlyViewedMovies || []).map(async (movie) => {
        if (!movie || typeof movie.id === 'undefined') return null; 
        let inFavorites = false;
        if (currentUser) {
          inFavorites = await isInFavorites(movie.id, currentUser.id);
        }
        return {
          ...movie,
          isInitiallyInFavorites: inFavorites,
        };
      })
    ).then(results => results.filter(movie => movie !== null)); 

    return {
      popularMovies: popularMoviesWithStatus,
      recentlyViewedMovies: recentlyViewedWithStatus,
      currentUser: currentUser // Pass current user to the page
    };
  } catch (error) {
    console.error("[+page.server.ts] Error loading data for homepage:", error);
    return {
      popularMovies: [],
      recentlyViewedMovies: [],
      currentUser: currentUser,
      error: "Failed to load homepage data.",
    };
  }
};

export const actions: Actions = {
    toggleFavorite: async ({ request, locals }) => {
        if (!locals.user) {
            return fail(401, { error: "You must be logged in to manage favorites." });
        }
        const userId = locals.user.id;
        console.log(`[+page.server.ts] toggleFavorite action initiated for user: ${userId}`);
        
        const data = await request.formData();
        const formDataEntries = Object.fromEntries(data.entries());
        console.log("[+page.server.ts] Received formData for favorite:", formDataEntries);

        const movieId = parseInt(data.get("movieId")?.toString() || "", 10);
        const title = data.get("title")?.toString();
        const poster_path_from_form = data.get("poster_path")?.toString() || undefined;
        const release_date_from_form = data.get("release_date")?.toString() || undefined;
        const overview = data.get("overview")?.toString() || undefined;

        if (isNaN(movieId)) {
            console.error("[+page.server.ts] Invalid Movie ID for favorite:", data.get("movieId"));
            return fail(400, { error: "Movie ID is required." });
        }

        const movieInput = { 
            id: movieId, 
            title, 
            posterPath: poster_path_from_form, 
            releaseDate: release_date_from_form, 
            overview 
        };
        console.log("[+page.server.ts] Constructed movieInput for favorite storage:", movieInput);

        try {
            const currentlyInFavorites = await isInFavorites(movieId, userId);
            console.log(`[+page.server.ts] Movie ${movieId} currentlyInFavorites for user ${userId}: ${currentlyInFavorites}`);
            if (currentlyInFavorites) {
                console.log(`[+page.server.ts] Removing movie ${movieId} from favorites for user ${userId}`);
                await dbRemoveFromFavorites(movieId, userId);
                return { success: true, action: "removed", type: "favorite", movieId };
            } else {
                if (!title) {
                    console.error("[+page.server.ts] Movie title is required to add to favorites for ID:", movieId);
                    return fail(400, { error: "Movie title is required to add to favorites." });
                }
                console.log(`[+page.server.ts] Adding movie to favorites for user ${userId}:`, movieInput);
                await dbAddToFavorites(movieInput, userId);
                return { success: true, action: "added", type: "favorite", movieId };
            }
        } catch (error) {
            console.error(`[+page.server.ts] Failed to toggle favorites on homepage for user ${userId}:`, error);
            return fail(500, { error: "Failed to update favorites." });
        }
    },
};

