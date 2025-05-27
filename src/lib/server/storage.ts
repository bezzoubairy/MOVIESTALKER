import prisma from "$lib/server/prisma";
import type { MovieInput } from "$lib/types/movie";

export type { Movie, FavoriteItem, RecentlyViewedItem, User, FriendRequest, Friendship, UserMovieRating, Comment } from "@prisma/client";
export { FriendRequestStatus } from "@prisma/client";

// Comment-related functions
export async function addComment(movieId: number, userId: string, content: string): Promise<void> {
  if (!content || content.trim() === '') {
    throw new Error("Comment content cannot be empty");
  }

  try {
    await prisma.comment.create({
      data: {
        content: content.trim(),
        movieId,
        userId
      }
    });
  } catch (error) {
    console.error(`Error adding comment for movie ${movieId} by user ${userId}:`, error);
    throw error;
  }
}

export async function getCommentsByMovie(movieId: number) {
  try {
    const comments = await prisma.comment.findMany({
      where: { movieId },
      include: { 
        user: {
          select: {
            id: true,
            username: true
          }
        }
      },
      orderBy: { createdAt: 'desc' }
    });
    
    return comments;
  } catch (error) {
    console.error(`Error fetching comments for movie ${movieId}:`, error);
    throw error;
  }
}

export async function deleteComment(commentId: string, userId: string): Promise<void> {
  try {
    // First check if the comment belongs to the user
    const comment = await prisma.comment.findUnique({
      where: { id: commentId }
    });
    
    if (!comment) {
      throw new Error("Comment not found");
    }
    
    if (comment.userId !== userId) {
      throw new Error("You can only delete your own comments");
    }
    
    await prisma.comment.delete({
      where: { id: commentId }
    });
  } catch (error) {
    console.error(`Error deleting comment ${commentId}:`, error);
    throw error;
  }
}

// Existing functions below
async function ensureMovieInDb(movieData: MovieInput) {
  if (!movieData || typeof movieData.id !== 'number') {
    throw new Error("Invalid movie data or missing ID provided to ensureMovieInDb.");
  }

  if (typeof movieData.title !== 'string' || movieData.title.trim() === '') {
    throw new Error(`Cannot process movie ID ${movieData.id} without a valid title.`);
  }

  let movie = await prisma.movie.findUnique({
    where: { id: movieData.id },
  });

  if (!movie) {
    try {
      movie = await prisma.movie.create({
        data: {
          id: movieData.id,
          title: movieData.title,
          posterPath: movieData.posterPath,
          releaseDate: movieData.releaseDate,
          overview: movieData.overview,
        },
      });
    } catch (error) {
      throw error;
    }
  }
  return movie;
}

export async function addToFavorites(movieData: MovieInput, userId: string): Promise<void> {
  await ensureMovieInDb(movieData);
  try {
    await prisma.favoriteItem.upsert({
      where: { movieId_userId: { movieId: movieData.id, userId: userId } },
      update: { dateAdded: new Date() },
      create: {
        movieId: movieData.id,
        userId: userId,
        dateAdded: new Date(),
      },
    });
  } catch (error) {
    throw error;
  }
}

export async function removeFromFavorites(movieId: number, userId: string): Promise<void> {
  try {
    await prisma.favoriteItem.delete({ 
      where: { movieId_userId: { movieId: movieId, userId: userId } } 
    });
  } catch (error) {
    const prismaError = error as { code?: string };
    if (prismaError.code !== 'P2025') { 
      throw error;
    }
  }
}

export async function isInFavorites(movieId: number, userId: string): Promise<boolean> {
  const item = await prisma.favoriteItem.findUnique({ 
    where: { movieId_userId: { movieId: movieId, userId: userId } } 
  });
  return !!item;
}

export async function getFavorites(userId: string) {
  const favoriteItems = await prisma.favoriteItem.findMany({
    where: { userId: userId },
    include: { movie: true },
    orderBy: { dateAdded: "desc" },
  });
  // Now, for each favorited movie, fetch the user-specific rating/notes if available
  const favoritesWithUserMovieData = await Promise.all(favoriteItems.map(async (favItem) => {
    const userMovieRating = await getUserMovieRating(favItem.movieId, userId);
    return {
      ...favItem.movie,
      dateAdded: favItem.dateAdded,
      userRating: userMovieRating?.rating,
      userNotes: userMovieRating?.notes
    };
  }));
  return favoritesWithUserMovieData;
}

export async function addToRecentlyViewed(movieData: MovieInput, userId: string): Promise<void> {
  await ensureMovieInDb(movieData);
  try {
    await prisma.recentlyViewedItem.upsert({
      where: { movieId_userId: { movieId: movieData.id, userId: userId } },
      update: { dateAdded: new Date() },
      create: {
        movieId: movieData.id,
        userId: userId,
        dateAdded: new Date(),
      },
    });

    const count = await prisma.recentlyViewedItem.count({ where: { userId: userId } });
    if (count > 20) {
      const oldestItems = await prisma.recentlyViewedItem.findMany({
        where: { userId: userId },
        orderBy: { dateAdded: "asc" },
        take: count - 20,
      });
      await prisma.recentlyViewedItem.deleteMany({
        where: { id: { in: oldestItems.map(item => item.id) } },
      });
    }
  } catch (error) {
    throw error;
  }
}

export async function getRecentlyViewed(userId: string) {
  const recentlyViewedItems = await prisma.recentlyViewedItem.findMany({
    where: { userId: userId },
    include: { movie: true },
    orderBy: { dateAdded: "desc" },
    take: 20,
  });
   // for each recently viewed movie, fetch the user-specific rating/notes if available
   const recentlyViewedWithUserMovieData = await Promise.all(recentlyViewedItems.map(async (recentItem) => {
    const userMovieRating = await getUserMovieRating(recentItem.movieId, userId);
    return {
      ...recentItem.movie,
      dateAdded: recentItem.dateAdded,
      userRating: userMovieRating?.rating,
      userNotes: userMovieRating?.notes
    };
  }));
  return recentlyViewedWithUserMovieData;
}

// Get user-specific rating/notes for a movie
export async function getUserMovieRating(movieId: number, userId: string) {
  return prisma.userMovieRating.findUnique({
    where: { userId_movieId: { userId, movieId } },
  });
}

// Add or update user-specific rating/notes for a movie
export async function upsertUserMovieRating(
  movieId: number,
  userId: string,
  ratingData: { rating?: number | null; notes?: string | null },
  movieDetails: MovieInput // Pass full movie details to ensure movie exists
): Promise<void> {
  await ensureMovieInDb(movieDetails); // Ensure the movie exists in the Movie table first
  
  const dataToUpsert: Record<string, number | string | null> = {};
  if (ratingData.rating !== undefined) dataToUpsert.rating = ratingData.rating;
  if (ratingData.notes !== undefined) dataToUpsert.notes = ratingData.notes;

  if (Object.keys(dataToUpsert).length === 0) {
    return; // Nothing to update
  }

  try {
    await prisma.userMovieRating.upsert({
      where: { userId_movieId: { userId, movieId } },
      update: {
        ...dataToUpsert,
        updatedAt: new Date(),
      },
      create: {
        userId,
        movieId,
        ...dataToUpsert,
      },
    });
  } catch (error) {
    throw error;
  }
}

// gets the basic movie details
export async function getMovieById(movieId: number) {
    return prisma.movie.findUnique({
        where: { id: movieId }
    });
}
