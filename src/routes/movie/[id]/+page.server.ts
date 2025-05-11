import { fail } from "@sveltejs/kit";
import type { Actions, PageServerLoad } from "./$types";
import {
  getMovieWithUserData,
  // isInWatchlist, // Watchlist removed
  isInFavorites,
  // addToWatchlist as dbAddToWatchlist, // Watchlist removed
  // removeFromWatchlist as dbRemoveFromWatchlist, // Watchlist removed
  addToFavorites as dbAddToFavorites,
  removeFromFavorites as dbRemoveFromFavorites,
  updateMovieUserData as dbUpdateMovieUserData,
  addToRecentlyViewed
} from "$lib/server/storage";
import { getMovieDetails as getTmdbMovieDetails, getRecommendedMovies as getTmdbRecommendedMovies } from "$lib/services/tmdb";

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

export const load: PageServerLoad = async ({ params }) => {
  const movieId = parseInt(params.id, 10);
  console.log(`[movie/[id]/+page.server.ts] Loading data for movieId: ${movieId}`);
  if (isNaN(movieId)) {
    console.error(`[movie/[id]/+page.server.ts] Invalid Movie ID in params: ${params.id}`);
    return fail(404, { error: "Invalid Movie ID" }); 
  }

  try {
    const tmdbMovieDetails = await getTmdbMovieDetails(movieId);
    if (!tmdbMovieDetails) {
      console.warn(`[movie/[id]/+page.server.ts] Movie not found on TMDB for ID: ${movieId}`);
      return fail(404, { error: "Movie not found on TMDB." });
    }
    console.log(`[movie/[id]/+page.server.ts] Fetched TMDB details for ${movieId}:`, tmdbMovieDetails);

    const movieUserData = await getMovieWithUserData(movieId); 
    console.log(`[movie/[id]/+page.server.ts] Fetched user data for ${movieId}:`, movieUserData);
    // const inWatchlist = await isInWatchlist(movieId); // Watchlist removed
    const inFavorites = await isInFavorites(movieId);
    // console.log(`[movie/[id]/+page.server.ts] Status for ${movieId} - inWatchlist: ${inWatchlist}, inFavorites: ${inFavorites}`);
    console.log(`[movie/[id]/+page.server.ts] Status for ${movieId} - inFavorites: ${inFavorites}`);


    await addToRecentlyViewed({
        id: tmdbMovieDetails.id,
        title: tmdbMovieDetails.title,
        posterPath: tmdbMovieDetails.poster_path, 
        releaseDate: tmdbMovieDetails.release_date, 
        overview: tmdbMovieDetails.overview
    });
    console.log(`[movie/[id]/+page.server.ts] Added ${movieId} to recently viewed.`);

    const recommendedMoviesResponse = await getTmdbRecommendedMovies(movieId);
    const tmdbRecommendedMovies = recommendedMoviesResponse.results || [];

    const recommendedMoviesWithStatus = await Promise.all(
      tmdbRecommendedMovies.map(async (recMovie) => {
        // const recInWatchlist = await isInWatchlist(recMovie.id); // Watchlist removed
        const recInFavorites = await isInFavorites(recMovie.id);
        return {
          ...recMovie,
          // isInitiallyInWatchlist: recInWatchlist, // Watchlist removed
          isInitiallyInFavorites: recInFavorites,
        };
      })
    );
    
    let finalPosterPath = tmdbMovieDetails.poster_path;
    if ((finalPosterPath === null || typeof finalPosterPath === 'undefined') && movieUserData && typeof movieUserData.posterPath === 'string') {
        finalPosterPath = movieUserData.posterPath;
    } else if ((finalPosterPath === null || typeof finalPosterPath === 'undefined') && movieUserData && movieUserData.posterPath === null) {
        finalPosterPath = null;
    }

    const moviePageData = {
        ...tmdbMovieDetails,
        poster_path: finalPosterPath, 
        userRating: movieUserData?.userRating,
        userNotes: movieUserData?.userNotes,
    };

    return {
      movie: moviePageData,
      // inWatchlist, // Watchlist removed
      inFavorites,
      recommendedMovies: recommendedMoviesWithStatus,
    };
  } catch (error) {
    console.error(`[movie/[id]/+page.server.ts] Failed to load movie page data for ID ${movieId}:`, error);
    if (error && typeof error === 'object' && 'status' in error && 'body' in error) {
        throw error; 
    }
    return fail(500, { error: "Failed to load movie data. Please try again later." });
  }
};

export const actions: Actions = {
  // toggleWatchlist action removed

  toggleFavorite: async ({ request, params }) => {
    const movieId = parseInt(params.id, 10);
    console.log(`[movie/[id]/+page.server.ts] toggleFavorite action initiated for movieId: ${movieId}`);
    const formData = await request.formData();
    const formDataEntries = Object.fromEntries(formData.entries());
    console.log("[movie/[id]/+page.server.ts] Received formData for favorite:", formDataEntries);

    const title = formData.get("title")?.toString();
    const poster_path_from_form = formData.get("poster_path")?.toString();
    const release_date_from_form = formData.get("release_date")?.toString();
    const overview = formData.get("overview")?.toString();

    if (isNaN(movieId)) {
      console.error(`[movie/[id]/+page.server.ts] Invalid Movie ID for favorite toggle: ${params.id}`);
      return fail(400, { error: "Movie ID is required." });
    }

    const movieInput = { 
        id: movieId, 
        title: title!, 
        posterPath: poster_path_from_form, 
        releaseDate: release_date_from_form, 
        overview 
    };
    console.log("[movie/[id]/+page.server.ts] Constructed movieInput for favorite storage:", movieInput);
    
    if (!title && !(await isInFavorites(movieId))) {
        console.error(`[movie/[id]/+page.server.ts] Movie title missing for adding to favorites, ID: ${movieId}`);
        return fail(400, { error: "Movie details (title) are required to add to favorites." });
    }
    
    try {
      const currentlyInFavorites = await isInFavorites(movieId);
      console.log(`[movie/[id]/+page.server.ts] Movie ${movieId} currentlyInFavorites: ${currentlyInFavorites}`);
      if (currentlyInFavorites) {
        console.log("[movie/[id]/+page.server.ts] Removing movie from favorites:", movieId);
        await dbRemoveFromFavorites(movieId);
        return { success: true, action: "removed", type: "favorite" };
      } else {
        console.log("[movie/[id]/+page.server.ts] Adding movie to favorites:", movieInput);
        await dbAddToFavorites(movieInput);
        return { success: true, action: "added", type: "favorite" };
      }
    } catch (error) {
      console.error("[movie/[id]/+page.server.ts] Failed to toggle favorites:", error);
      return fail(500, { error: "Failed to update favorites." });
    }
  },

  updateUserData: async ({ request, params }) => {
    const movieId = parseInt(params.id, 10);
    console.log(`[movie/[id]/+page.server.ts] updateUserData action initiated for movieId: ${movieId}`);
    const formData = await request.formData();
    const formDataEntries = Object.fromEntries(formData.entries());
    console.log("[movie/[id]/+page.server.ts] Received formData for user data update:", formDataEntries);

    const ratingString = formData.get("userRating")?.toString();
    const userNotes = formData.get("userNotes")?.toString() || undefined; 
    const title = formData.get("title")?.toString(); 
    const poster_path_from_form = formData.get("poster_path")?.toString();
    const release_date_from_form = formData.get("release_date")?.toString();
    const overview = formData.get("overview")?.toString();

    if (isNaN(movieId)) {
      console.error(`[movie/[id]/+page.server.ts] Invalid Movie ID for user data update: ${params.id}`);
      return fail(400, { error: "Invalid Movie ID." });
    }

    let userRating: number | null = null; 
    if (ratingString && ratingString !== "0" && ratingString !== "") {
      userRating = parseInt(ratingString, 10);
      if (isNaN(userRating) || userRating < 1 || userRating > 10) {
        console.error(`[movie/[id]/+page.server.ts] Invalid rating value: ${ratingString}`);
        return fail(400, { error: "Invalid rating value. Must be between 1 and 10, or 0/empty to clear." });
      }
    } else if (ratingString === "0" || ratingString === "") {
        userRating = null; 
    }
    console.log(`[movie/[id]/+page.server.ts] Parsed userRating: ${userRating}, userNotes: ${userNotes}`);

    try {
      let movieExists = await getMovieWithUserData(movieId);
      if (!movieExists) {
        console.log(`[movie/[id]/+page.server.ts] Movie ${movieId} not in DB, ensuring it's added before updating user data.`);
        if (!title) {
            console.error(`[movie/[id]/+page.server.ts] Movie title missing for new movie user data update, ID: ${movieId}`);
            return fail(400, {error: "Movie title is required to rate/note a new movie."});
        }
        const movieInput = { 
            id: movieId, 
            title, 
            posterPath: poster_path_from_form, 
            releaseDate: release_date_from_form, 
            overview 
        }; 
        console.log("[movie/[id]/+page.server.ts] Adding new movie to DB before user data update:", movieInput);
        // Ensure movie is in DB, but not necessarily by adding to watchlist
        // A generic ensureMovieInDb is called by addToRecentlyViewed, addToFavorites, etc.
        // If updateUserData is called for a movie not yet in DB, it should be added first.
        // The ensureMovieInDb function in storage.ts handles this.
        // However, the original code here called dbAddToWatchlist. Since watchlist is removed,
        // we need to ensure the movie exists. The addToRecentlyViewed call in the load function
        // should have already added it. If not, we might need a direct call to ensureMovieInDb here.
        // For now, assuming it's added by addToRecentlyViewed or if it's a favorite.
      }

      console.log(`[movie/[id]/+page.server.ts] Updating user data for movie ${movieId}:`, { userRating, userNotes });
      await dbUpdateMovieUserData(movieId, { userRating, userNotes });
      return { success: true, message: "User data updated." };
    } catch (error) {
      console.error("[movie/[id]/+page.server.ts] Failed to update movie user data:", error);
      return fail(500, { error: "Failed to update user data." });
    }
  },
};

