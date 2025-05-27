import { fail, redirect } from "@sveltejs/kit";
import type { Actions, PageServerLoad } from "./$types";
import {
  isInFavorites,
  addToFavorites as dbAddToFavorites,
  removeFromFavorites as dbRemoveFromFavorites,
  addToRecentlyViewed,
  getUserMovieRating, 
  upsertUserMovieRating, 
  getMovieById,
  addComment,
  getCommentsByMovie,
  deleteComment
} from "$lib/server/storage";
import { getMovieDetails as getTmdbMovieDetails, getRecommendedMovies as getTmdbRecommendedMovies } from "$lib/services/tmdb";

export const load: PageServerLoad = async ({ params, locals }) => {
  const movieId = parseInt(params.id, 10);
  const currentUser = locals.user;

  if (isNaN(movieId)) {
    return fail(404, { error: "Invalid Movie ID" }); 
  }

  try {
    const tmdbMovieDetails = await getTmdbMovieDetails(movieId);
    if (!tmdbMovieDetails) {
      return fail(404, { error: "Movie not found on TMDB." });
    }

    let inFavorites = false;
    let userMovieRatingData = null;
    
    // Fetch comments for the movie
    const comments = await getCommentsByMovie(movieId);

    if (currentUser) {
      inFavorites = await isInFavorites(movieId, currentUser.id);
      userMovieRatingData = await getUserMovieRating(movieId, currentUser.id);
      
      if (tmdbMovieDetails.title) {
        await addToRecentlyViewed({
            id: tmdbMovieDetails.id,
            title: tmdbMovieDetails.title,
            posterPath: tmdbMovieDetails.poster_path, 
            releaseDate: tmdbMovieDetails.release_date, 
            overview: tmdbMovieDetails.overview
        }, currentUser.id);
      } else {
        console.warn(`[movie/[id]/+page.server.ts] Movie title missing for TMDB ID ${movieId}, cannot add to recently viewed.`);
      }
    } 

    const recommendedMoviesResponse = await getTmdbRecommendedMovies(movieId);
    const tmdbRecommendedMovies = recommendedMoviesResponse.results || [];

    const recommendedMoviesWithStatus = await Promise.all(
      tmdbRecommendedMovies.map(async (recMovie) => {
        let recInFavorites = false;
        if (currentUser) {
          recInFavorites = await isInFavorites(recMovie.id, currentUser.id);
        }
        return {
          ...recMovie,
          isInitiallyInFavorites: recInFavorites,
        };
      })
    );
    
 
    let finalPosterPath = tmdbMovieDetails.poster_path;
    if (finalPosterPath === null || typeof finalPosterPath === 'undefined') {
        const dbMovie = await getMovieById(movieId);
        if (dbMovie && typeof dbMovie.posterPath === 'string') {
            finalPosterPath = dbMovie.posterPath;
        }
    }

    const moviePageData = {
        ...tmdbMovieDetails,
        poster_path: finalPosterPath, 
        userRating: userMovieRatingData?.rating, // User-specific rating
        userNotes: userMovieRatingData?.notes,   // User-specific notes
    };

    return {
      movie: moviePageData,
      inFavorites,
      recommendedMovies: recommendedMoviesWithStatus,
      currentUser: currentUser,
      comments: comments
    };
  } catch (error: any) {
    console.error(`[movie/[id]/+page.server.ts] Failed to load movie page data for ID ${movieId}:`, error);
    if (error.message && error.message.includes("without a valid title")) {
        return fail(500, { error: `Failed to process movie data: ${error.message}` });
    }
    return fail(500, { error: "Failed to load movie data. Please try again later." });
  }
};

export const actions: Actions = {
  toggleFavorite: async ({ request, params, locals }) => {
    if (!locals.user) {
      return fail(401, { error: "You must be logged in to manage favorites." });
    }
    const userId = locals.user.id;
    const movieId = parseInt(params.id, 10);
    
    const formData = await request.formData();
    const title = formData.get("title")?.toString();
    const poster_path_from_form = formData.get("poster_path")?.toString();
    const release_date_from_form = formData.get("release_date")?.toString();
    const overview = formData.get("overview")?.toString();

    if (isNaN(movieId)) {
      return fail(400, { error: "Movie ID is required." });
    }
    if (!title) { 
        return fail(400, { error: "Movie details (title) are required to manage favorites." });
    }

    const movieInput = { 
        id: movieId, 
        title: title,
        posterPath: poster_path_from_form, 
        releaseDate: release_date_from_form, 
        overview 
    };
    
    try {
      const currentlyInFavorites = await isInFavorites(movieId, userId);
      if (currentlyInFavorites) {
        await dbRemoveFromFavorites(movieId, userId);
        return { success: true, action: "removed", type: "favorite" };
      } else {
        await dbAddToFavorites(movieInput, userId);
        return { success: true, action: "added", type: "favorite" };
      }
    } catch (error: any) {
      console.error("[movie/[id]/+page.server.ts] Failed to toggle favorites:", error);
      if (error.message && error.message.includes("without a valid title")) {
        return fail(500, { error: `Failed to update favorites: ${error.message}` });
      }
      return fail(500, { error: "Failed to update favorites." });
    }
  },

  updateUserData: async ({ request, params, locals }) => {
    if (!locals.user) {
      return fail(401, { error: "You must be logged in to update movie data." });
    }
    const userId = locals.user.id;
    const movieId = parseInt(params.id, 10);
    const formData = await request.formData();
    const ratingString = formData.get("userRating")?.toString();
    const userNotes = formData.get("userNotes")?.toString() || undefined; 
    
    // For ensureMovieInDb
    const title = formData.get("title")?.toString(); 
    const poster_path_from_form = formData.get("poster_path")?.toString();
    const release_date_from_form = formData.get("release_date")?.toString();
    const overview_from_form = formData.get("overview")?.toString();

    if (isNaN(movieId)) {
      return fail(400, { error: "Invalid Movie ID." });
    }
    if (!title) {
        return fail(400, { error: "Movie title is required to save rating/notes." });
    }

    const movieDetailsForDb = {
        id: movieId,
        title: title,
        posterPath: poster_path_from_form,
        releaseDate: release_date_from_form,
        overview: overview_from_form
    };

    let userRating: number | null = null; 
    if (ratingString && ratingString !== "0" && ratingString !== "") {
      userRating = parseInt(ratingString, 10);
      if (isNaN(userRating) || userRating < 1 || userRating > 10) {
        return fail(400, { error: "Invalid rating value. Must be between 1 and 10, or 0/empty to clear." });
      }
    } else if (ratingString === "0" || ratingString === "") {
        userRating = null; 
    }

    try {
      await upsertUserMovieRating(movieId, userId, { rating: userRating, notes: userNotes }, movieDetailsForDb);
      return { success: true, message: "Your rating and notes have been saved." };
    } catch (error: any) {
      console.error("[movie/[id]/+page.server.ts] Failed to update user-specific movie data:", error);
      if (error.message && error.message.includes("without a valid title")) {
        return fail(500, { error: `Failed to save rating/notes: ${error.message}` });
      }
      return fail(500, { error: "Failed to save your rating and notes." });
    }
  },
  
  addComment: async ({ request, params, locals }) => {
    if (!locals.user) {
      return fail(401, { error: "You must be logged in to add comments." });
    }
    
    const userId = locals.user.id;
    const movieId = parseInt(params.id, 10);
    
    if (isNaN(movieId)) {
      return fail(400, { error: "Invalid Movie ID." });
    }
    
    const formData = await request.formData();
    const content = formData.get("content")?.toString();
    
    if (!content || content.trim() === '') {
      return fail(400, { error: "Comment content cannot be empty." });
    }
    
    try {
      await addComment(movieId, userId, content);
      return { 
        success: true, 
        message: "Your comment has been added.",
        type: "comment",
        action: "added"
      };
    } catch (error: any) {
      console.error("[movie/[id]/+page.server.ts] Failed to add comment:", error);
      return fail(500, { error: "Failed to add your comment. Please try again." });
    }
  },
  
  deleteComment: async ({ request, params, locals }) => {
    if (!locals.user) {
      return fail(401, { error: "You must be logged in to delete comments." });
    }
    
    const userId = locals.user.id;
    const formData = await request.formData();
    const commentId = formData.get("commentId")?.toString();
    
    if (!commentId) {
      return fail(400, { error: "Comment ID is required." });
    }
    
    try {
      await deleteComment(commentId, userId);
      return { 
        success: true, 
        message: "Your comment has been deleted.",
        type: "comment",
        action: "deleted"
      };
    } catch (error: any) {
      console.error("[movie/[id]/+page.server.ts] Failed to delete comment:", error);
      if (error.message === "You can only delete your own comments") {
        return fail(403, { error: error.message });
      }
      return fail(500, { error: "Failed to delete comment. Please try again." });
    }
  }
};

