import { fail } from "@sveltejs/kit";
import type { Actions, PageServerLoad } from "./$types";
import {
  getFavorites as dbGetFavorites,
  removeFromFavorites as dbRemoveFromFavorites,
  addToFavorites as dbAddToFavorites,
  // isInWatchlist as dbIsInWatchlist, // Watchlist removed
  // addToWatchlist as dbAddToWatchlist, // Watchlist removed
  // removeFromWatchlist as dbRemoveFromWatchlist, // Watchlist removed
  isInFavorites as dbIsInFavorites // Ensure this is imported if used directly in actions
} from "$lib/server/storage";

// Helper function to map posterPath to poster_path for a single movie object
const mapMoviePosterPath = (movie: any) => {
  if (movie && typeof movie.posterPath === 'string') {
    return { ...movie, poster_path: movie.posterPath };
  }
  if (movie && movie.posterPath === null) {
    return { ...movie, poster_path: null };
  }
  if (movie && typeof movie.posterPath === 'undefined'){
      return { ...movie, poster_path: undefined };
  }
  return movie; // Return as is if no posterPath or not a string/null
};

export const load: PageServerLoad = async () => {
  try {
    const favoriteItems = await dbGetFavorites(); // Returns array of movie objects from favorites

    // Map posterPath to poster_path for each movie in the favorites
    const mappedFavoriteItems = favoriteItems.map(item => {
        return mapMoviePosterPath(item); 
    });

    // For each favorite movie, also check if it's in the watchlist - REMOVED
    const favoritesWithStatus = (mappedFavoriteItems || []).map(movie => {
        if (!movie || typeof movie.id === 'undefined') return null;
        // const isInWatchlistStatus = await dbIsInWatchlist(movie.id); // Watchlist removed
        return {
          ...movie, // Contains all movie fields + dateAdded, userRating, userNotes
          // isInitiallyInWatchlist: isInWatchlistStatus, // Watchlist removed
          isInitiallyInFavorites: true, // Since this is the favorites page
        };
      }
    ).filter(movie => movie !== null);

    return { favorites: favoritesWithStatus };
  } catch (error) {
    console.error("Failed to load favorites:", error);
    return { favorites: [], error: "Failed to load favorites." };
  }
};

export const actions: Actions = {
  toggleFavorite: async ({ request }) => {
    const data = await request.formData();
    const movieId = parseInt(data.get("movieId")?.toString() || "", 10);
    const title = data.get("title")?.toString();
    const poster_path_from_form = data.get("poster_path")?.toString() || undefined;
    const release_date = data.get("release_date")?.toString() || undefined;
    const overview = data.get("overview")?.toString() || undefined;

    if (isNaN(movieId)) {
      return fail(400, { error: "Movie ID is required." });
    }

    try {
      const currentlyInFavorites = await dbIsInFavorites(movieId);
      if (currentlyInFavorites) {
        await dbRemoveFromFavorites(movieId);
        return { success: true, action: "removed", type: "favorite", movieId };
      } else {
        if (!title) return fail(400, { error: "Movie title is required to add to favorites." });
        const movieInput = { id: movieId, title, posterPath: poster_path_from_form, releaseDate: release_date, overview }; // Corrected releaseDate field
        await dbAddToFavorites(movieInput as any);
        return { success: true, action: "added", type: "favorite", movieId };
      }
    } catch (error) {
      console.error("Failed to toggle favorites:", error);
      return fail(500, { error: "Failed to update favorites." });
    }
  },

  // toggleWatchlist action removed
};

