import type { PageServerLoad } from "./$types";
import { getPopularMovies as getTmdbPopularMovies } from "$lib/services/tmdb";
import {
  getRecentlyViewed as getDbRecentlyViewed,
  // isInWatchlist, // Watchlist removed
  isInFavorites,
} from "$lib/server/storage";
import { fail } from "@sveltejs/kit";
import type { Actions } from "./$types";
import {
    // addToWatchlist as dbAddToWatchlist, // Watchlist removed
    // removeFromWatchlist as dbRemoveFromWatchlist, // Watchlist removed
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

export const load: PageServerLoad = async () => {
  try {
    const popularMoviesResponse = await getTmdbPopularMovies();
    const tmdbPopularMovies = popularMoviesResponse.results || [];

    const dbRecentlyViewedItems = await getDbRecentlyViewed();
    const recentlyViewedMovies = dbRecentlyViewedItems.map(item => {
        if (item && item.movie) {
            return { ...item, movie: mapMoviePosterPath(item.movie) };
        }
        return item; 
    }).map(item => item?.movie).filter(Boolean); 

    const popularMoviesWithStatus = await Promise.all(
      tmdbPopularMovies.map(async (movie) => {
        // const inWatchlist = await isInWatchlist(movie.id); // Watchlist removed
        const inFavorites = await isInFavorites(movie.id);
        return {
          ...movie,
          // isInitiallyInWatchlist: inWatchlist, // Watchlist removed
          isInitiallyInFavorites: inFavorites,
        };
      })
    );

    const recentlyViewedWithStatus = await Promise.all(
      (recentlyViewedMovies || []).map(async (movie) => {
        if (!movie || typeof movie.id === 'undefined') return null; 
        // const inWatchlist = await isInWatchlist(movie.id); // Watchlist removed
        const inFavorites = await isInFavorites(movie.id);
        return {
          ...movie,
          // isInitiallyInWatchlist: inWatchlist, // Watchlist removed
          isInitiallyInFavorites: inFavorites,
        };
      })
    ).then(results => results.filter(movie => movie !== null)); 

    return {
      popularMovies: popularMoviesWithStatus,
      recentlyViewedMovies: recentlyViewedWithStatus,
    };
  } catch (error) {
    console.error("[+page.server.ts] Error loading data for homepage:", error);
    return {
      popularMovies: [],
      recentlyViewedMovies: [],
      error: "Failed to load homepage data.",
    };
  }
};

export const actions: Actions = {
    // toggleWatchlist action removed

    toggleFavorite: async ({ request }) => {
        console.log("[+page.server.ts] toggleFavorite action initiated.");
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
            const currentlyInFavorites = await isInFavorites(movieId);
            console.log(`[+page.server.ts] Movie ${movieId} currentlyInFavorites: ${currentlyInFavorites}`);
            if (currentlyInFavorites) {
                console.log("[+page.server.ts] Removing movie from favorites:", movieId);
                await dbRemoveFromFavorites(movieId);
                return { success: true, action: "removed", type: "favorite", movieId };
            } else {
                if (!title) {
                    console.error("[+page.server.ts] Movie title is required to add to favorites for ID:", movieId);
                    return fail(400, { error: "Movie title is required to add to favorites." });
                }
                console.log("[+page.server.ts] Adding movie to favorites:", movieInput);
                await dbAddToFavorites(movieInput);
                return { success: true, action: "added", type: "favorite", movieId };
            }
        } catch (error) {
            console.error("[+page.server.ts] Failed to toggle favorites on homepage:", error);
            return fail(500, { error: "Failed to update favorites." });
        }
    },
};

