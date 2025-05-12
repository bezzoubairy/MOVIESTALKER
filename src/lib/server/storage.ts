import prisma from "$lib/server/prisma";

export type { Movie, FavoriteItem, RecentlyViewedItem, User, FriendRequest, Friendship, UserMovieRating } from "@prisma/client";
export { FriendRequestStatus } from "@prisma/client";

interface MovieInputData {
  id: number;
  title: string;
  posterPath?: string | null;
  releaseDate?: string | null;
  overview?: string | null;
}

async function ensureMovieInDb(movieData: MovieInputData) {
  // console.log("[storage.ts] ensureMovieInDb called with:", movieData);

  if (!movieData || typeof movieData.id !== 'number') {
    // console.error("[storage.ts] ensureMovieInDb called with invalid movieData or missing ID:", movieData);
    throw new Error("Invalid movie data or missing ID provided to ensureMovieInDb.");
  }

  if (typeof movieData.title !== 'string' || movieData.title.trim() === '') {
    // console.error(`[storage.ts] Attempted to ensure movie with ID ${movieData.id} but title is missing or invalid: '${movieData.title}'`);
    throw new Error(`Cannot process movie ID ${movieData.id} without a valid title.`);
  }

  let movie = await prisma.movie.findUnique({
    where: { id: movieData.id },
  });

  if (!movie) {
    // console.log(`[storage.ts] Movie ${movieData.id} not found in DB, creating new entry.`);
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
      // console.log(`[storage.ts] Successfully created movie ${movieData.id} in DB.`);
    } catch (error) {
      // console.error(`[storage.ts] Error creating movie ${movieData.id} in DB:`, error);
      throw error;
    }
  } else {
    // console.log(`[storage.ts] Movie ${movieData.id} already exists in DB.`);
  }
  return movie;
}

export async function addToFavorites(movieData: MovieInputData, userId: string): Promise<void> {
  // console.log("[storage.ts] addToFavorites called with:", movieData, "for userId:", userId);
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
    // console.log(`[storage.ts] Successfully upserted movie ${movieData.id} to favorites for user ${userId}.`);
  } catch (error) {
    // console.error(`[storage.ts] Error upserting movie ${movieData.id} to favorites for user ${userId}:`, error);
    throw error;
  }
}

export async function removeFromFavorites(movieId: number, userId: string): Promise<void> {
  // console.log(`[storage.ts] removeFromFavorites called for movieId: ${movieId}, userId: ${userId}`);
  try {
    await prisma.favoriteItem.delete({ 
      where: { movieId_userId: { movieId: movieId, userId: userId } } 
    });
    // console.log(`[storage.ts] Successfully removed movie ${movieId} from favorites for user ${userId}.`);
  } catch (error: any) {
    if (error.code !== 'P2025') { 
      // console.error(`[storage.ts] Error removing movie ${movieId} from favorites for user ${userId}:`, error);
      throw error;
    }
    // console.log(`[storage.ts] Movie ${movieId} was not in favorites for user ${userId} (P2025), no action taken.`);
  }
}

export async function isInFavorites(movieId: number, userId: string): Promise<boolean> {
  const item = await prisma.favoriteItem.findUnique({ 
    where: { movieId_userId: { movieId: movieId, userId: userId } } 
  });
  return !!item;
}

export async function getFavorites(userId: string) {
  // console.log("[storage.ts] getFavorites called for userId:", userId);
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

export async function addToRecentlyViewed(movieData: MovieInputData, userId: string): Promise<void> {
  // console.log("[storage.ts] addToRecentlyViewed --- ENTERING FUNCTION ---");
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
    // console.log(`[storage.ts] Successfully upserted movie ${movieData.id} to recently viewed for user ${userId}.`);

    const count = await prisma.recentlyViewedItem.count({ where: { userId: userId } });
    // console.log(`[storage.ts] Recently viewed count for user ${userId} is ${count}.`);
    if (count > 20) {
      // console.log("[storage.ts] addToRecentlyViewed --- COUNT > 20, ABOUT TO TRIM RECENTLY VIEWED ---");
      const oldestItems = await prisma.recentlyViewedItem.findMany({
        where: { userId: userId },
        orderBy: { dateAdded: "asc" },
        take: count - 20,
      });
      // console.log(`[storage.ts] Found ${oldestItems.length} oldest items to delete.`);
      await prisma.recentlyViewedItem.deleteMany({
        where: { id: { in: oldestItems.map(item => item.id) } },
      });
      // console.log("[storage.ts] addToRecentlyViewed --- USING ID-BASED DELETION - TRIMMED RECENTLY VIEWED ---");
    }
  } catch (error) {
    // console.error("[storage.ts] Error in addToRecentlyViewed ---", error);
    throw error;
  }
}

export async function getRecentlyViewed(userId: string) {
  // console.log("[storage.ts] getRecentlyViewed --- ENTERING FUNCTION ---");
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
  // console.log(`[storage.ts] getUserMovieRating called for movieId: ${movieId}, userId: ${userId}`);
  return prisma.userMovieRating.findUnique({
    where: { userId_movieId: { userId, movieId } },
  });
}

// Add or update user-specific rating/notes for a movie
export async function upsertUserMovieRating(
  movieId: number,
  userId: string,
  ratingData: { rating?: number | null; notes?: string | null },
  movieDetails: MovieInputData // Pass full movie details to ensure movie exists
): Promise<void> {
  // console.log(`[storage.ts] upsertUserMovieRating called for movieId: ${movieId}, userId: ${userId}, data:`, ratingData);
  await ensureMovieInDb(movieDetails); // Ensure the movie exists in the Movie table first
  
  const dataToUpsert: any = {};
  if (ratingData.rating !== undefined) dataToUpsert.rating = ratingData.rating;
  if (ratingData.notes !== undefined) dataToUpsert.notes = ratingData.notes;

  if (Object.keys(dataToUpsert).length === 0) {
    // console.log("[storage.ts] No rating or notes data provided to upsertUserMovieRating, skipping.");
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
    // console.log(`[storage.ts] Successfully upserted rating/notes for movie ${movieId} by user ${userId}.`);
  } catch (error) {
    // console.error(`[storage.ts] Error upserting rating/notes for movie ${movieId} by user ${userId}:`, error);
    throw error;
  }
}



// gets the basic movie details
export async function getMovieById(movieId: number) {
    // console.log(`[storage.ts] getMovieById called for movieId: ${movieId}`);
    return prisma.movie.findUnique({
        where: { id: movieId }
    });
}


