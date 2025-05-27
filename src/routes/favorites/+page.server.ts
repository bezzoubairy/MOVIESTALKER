import { fail } from "@sveltejs/kit";
import type { Actions, PageServerLoad } from "./$types";
import {
  getFavorites as dbGetFavorites,
  removeFromFavorites as dbRemoveFromFavorites,
  addToFavorites as dbAddToFavorites,
  isInFavorites as dbIsInFavorites 
} from "$lib/server/storage";

import type { MovieWithPosterPath } from "$lib/types/movie";

const mapMoviePosterPath = (movie: MovieWithPosterPath) => {
  if (movie && typeof movie.posterPath === 'string') {
    return { ...movie, poster_path: movie.posterPath };
  }
  if (movie && movie.posterPath === null) {
    return { ...movie, poster_path: null };
  }
  if (movie && typeof movie.posterPath === 'undefined'){
      return { ...movie, poster_path: undefined };
  }
  return movie;
};

export const load: PageServerLoad = async ({ locals }) => {
  try {
    const userId = locals.user?.id;
    
    // If no user is logged in, return empty favorites
    if (!userId) {
      return { favorites: [], error: "You must be logged in to view favorites." };
    }
    
    const favoriteItems = await dbGetFavorites(userId); 
    
    const mappedFavoriteItems = favoriteItems.map(item => {
        return mapMoviePosterPath(item); 
    });
    
    const favoritesWithStatus = (mappedFavoriteItems || []).map(movie => {
        if (!movie || typeof movie.id === 'undefined') return null;
        
        return {
          ...movie,
          isInitiallyInFavorites: true, 
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
  toggleFavorite: async ({ request, locals }) => {
    const data = await request.formData();
    const movieId = parseInt(data.get("movieId")?.toString() || "", 10);
    const title = data.get("title")?.toString();
    const poster_path_from_form = data.get("poster_path")?.toString() || undefined;
    const release_date = data.get("release_date")?.toString() || undefined;
    const overview = data.get("overview")?.toString() || undefined;
    const userId = locals.user?.id;

    if (!userId) {
      return fail(401, { error: "You must be logged in to manage favorites." });
    }

    if (isNaN(movieId)) {
      return fail(400, { error: "Movie ID is required." });
    }

    try {
      const currentlyInFavorites = await dbIsInFavorites(movieId, userId);
      if (currentlyInFavorites) {
        await dbRemoveFromFavorites(movieId, userId);
        return { success: true, action: "removed", type: "favorite", movieId };
      } else {
        if (!title) return fail(400, { error: "Movie title is required to add to favorites." });
        const movieInput = { 
          id: movieId, 
          title, 
          posterPath: poster_path_from_form, 
          releaseDate: release_date, 
          overview 
        };
        await dbAddToFavorites(movieInput, userId);
        return { success: true, action: "added", type: "favorite", movieId };
      }
    } catch (error) {
      console.error("Failed to toggle favorites:", error);
      return fail(500, { error: "Failed to update favorites." });
    }
  }
};

