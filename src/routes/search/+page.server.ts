import { fail } from "@sveltejs/kit";
import type { PageServerLoad, Actions } from "./$types";
import { searchMovies as tmdbSearchMovies } from "$lib/services/tmdb";
import {
  
  isInFavorites,
  
  addToFavorites as dbAddToFavorites,
  removeFromFavorites as dbRemoveFromFavorites,
} from "$lib/server/storage";

export const load: PageServerLoad = async ({ url }) => {
  const query = url.searchParams.get("q");
  const page = parseInt(url.searchParams.get("page") || "1", 10);
  console.log(`[search/+page.server.ts] Loading search results for query: "${query}", page: ${page}`);

  if (!query) {
    return { query: null, movies: [], currentPage: 1, totalPages: 0 };
  }

  try {
    const searchResponse = await tmdbSearchMovies(query, page);
    const tmdbMovies = searchResponse.results || [];
    console.log(`[search/+page.server.ts] Found ${tmdbMovies.length} movies from TMDB for query: "${query}"`);

    const moviesWithStatus = await Promise.all(
      tmdbMovies.map(async (movie) => {
       
        const inFavorites = await isInFavorites(movie.id);
        return {
          ...movie,
          
          isInitiallyInFavorites: inFavorites,
        };
      })
    );

    return {
      query,
      movies: moviesWithStatus,
      currentPage: searchResponse.page,
      totalPages: searchResponse.total_pages,
    };
  } catch (error) {
    console.error(`[search/+page.server.ts] Error searching movies for query "${query}":`, error);
    return {
      query,
      movies: [],
      currentPage: 1,
      totalPages: 0,
      error: "Failed to search movies.",
    };
  }
};

export const actions: Actions = {
  

  toggleFavorite: async ({ request }) => {
    console.log("[search/+page.server.ts] toggleFavorite action initiated.");
    const data = await request.formData();
    const formDataEntries = Object.fromEntries(data.entries());
    console.log("[search/+page.server.ts] Received formData for favorite:", formDataEntries);

    const movieId = parseInt(data.get("movieId")?.toString() || "", 10);
    const title = data.get("title")?.toString();
    const poster_path_from_form = data.get("poster_path")?.toString() || undefined;
    const release_date_from_form = data.get("release_date")?.toString() || undefined;
    const overview = data.get("overview")?.toString() || undefined;

    if (isNaN(movieId)) {
      console.error("[search/+page.server.ts] Invalid Movie ID for favorite toggle:", data.get("movieId"));
      return fail(400, { error: "Movie ID is required." });
    }

    const movieInput = { 
        id: movieId, 
        title, 
        posterPath: poster_path_from_form, 
        releaseDate: release_date_from_form, 
        overview 
    };
    console.log("[search/+page.server.ts] Constructed movieInput for favorite storage:", movieInput);

    try {
      const currentlyInFavorites = await isInFavorites(movieId);
      console.log(`[search/+page.server.ts] Movie ${movieId} currentlyInFavorites: ${currentlyInFavorites}`);
      if (currentlyInFavorites) {
        console.log("[search/+page.server.ts] Removing movie from favorites:", movieId);
        await dbRemoveFromFavorites(movieId);
        return { success: true, action: "removed", type: "favorite", movieId };
      } else {
        if (!title) {
            console.error(`[search/+page.server.ts] Movie title missing for adding to favorites, ID: ${movieId}`);
            return fail(400, { error: "Movie title is required to add to favorites." });
        }
        console.log("[search/+page.server.ts] Adding movie to favorites:", movieInput);
        await dbAddToFavorites(movieInput);
        return { success: true, action: "added", type: "favorite", movieId };
      }
    } catch (error) {
      console.error("[search/+page.server.ts] Failed to toggle favorites on search page:", error);
      return fail(500, { error: "Failed to update favorites." });
    }
  },
};

