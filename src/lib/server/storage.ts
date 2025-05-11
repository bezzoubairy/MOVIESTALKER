import prisma from "$lib/server/prisma";

export type { Movie, FavoriteItem, RecentlyViewedItem } from "@prisma/client"; // Removed WatchlistItem

interface MovieInputData {
  id: number; 
  title: string;
  posterPath?: string | null;
  releaseDate?: string | null; 
  overview?: string | null;
}

async function ensureMovieInDb(movieData: MovieInputData) {
  console.log("[storage.ts] ensureMovieInDb called with:", movieData);
  let movie = await prisma.movie.findUnique({
    where: { id: movieData.id },
  });

  if (!movie) {
    console.log(`[storage.ts] Movie ${movieData.id} not found in DB, creating new entry.`);
    if (!movieData.title) {
        console.error(`[storage.ts] Attempted to create movie with ID ${movieData.id} but no title was provided.`);
        // Optionally throw an error or handle as appropriate
    }
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
      console.log(`[storage.ts] Successfully created movie ${movieData.id} in DB.`);
    } catch (error) {
      console.error(`[storage.ts] Error creating movie ${movieData.id} in DB:`, error);
      throw error;
    }
  } else {
    console.log(`[storage.ts] Movie ${movieData.id} already exists in DB.`);
  }
  return movie;
}

// Watchlist functions removed
// export async function addToWatchlist(movieData: MovieInputData): Promise<void> { ... }
// export async function removeFromWatchlist(movieId: number): Promise<void> { ... }
// export async function isInWatchlist(movieId: number): Promise<boolean> { ... }
// export async function getWatchlist() { ... }

export async function addToFavorites(movieData: MovieInputData): Promise<void> {
  console.log("[storage.ts] addToFavorites called with:", movieData);
  await ensureMovieInDb(movieData);
  try {
    await prisma.favoriteItem.upsert({
      where: { movieId: movieData.id },
      update: { dateAdded: new Date() },
      create: {
        movieId: movieData.id,
        dateAdded: new Date(),
      },
    });
    console.log(`[storage.ts] Successfully upserted movie ${movieData.id} to favorites.`);
  } catch (error) {
    console.error(`[storage.ts] Error upserting movie ${movieData.id} to favorites:`, error);
    throw error;
  }
}

export async function removeFromFavorites(movieId: number): Promise<void> {
  console.log(`[storage.ts] removeFromFavorites called for movieId: ${movieId}`);
  try {
    await prisma.favoriteItem.delete({ where: { movieId } });
    console.log(`[storage.ts] Successfully removed movie ${movieId} from favorites.`);
  } catch (error: any) {
    if (error.code !== 'P2025') { // P2025 is Prisma's code for "Record to delete does not exist."
      console.error(`[storage.ts] Error removing movie ${movieId} from favorites:`, error);
      throw error;
    }
    console.log(`[storage.ts] Movie ${movieId} was not in favorites (P2025), no action taken.`);
  }
}

export async function isInFavorites(movieId: number): Promise<boolean> {
  // console.log(`[storage.ts] isInFavorites called for movieId: ${movieId}`); // Can be too noisy
  const item = await prisma.favoriteItem.findUnique({ where: { movieId } });
  return !!item;
}

export async function getFavorites() {
  console.log("[storage.ts] getFavorites called.");
  const favoriteItems = await prisma.favoriteItem.findMany({
    include: { movie: true },
    orderBy: { dateAdded: "desc" },
  });
  return favoriteItems.map(item => ({ ...item.movie, dateAdded: item.dateAdded, userRating: item.movie.userRating, userNotes: item.movie.userNotes }));
}

export async function addToRecentlyViewed(movieData: MovieInputData): Promise<void> {
  console.log("[storage.ts] addToRecentlyViewed called with:", movieData);
  await ensureMovieInDb(movieData);
  try {
    await prisma.recentlyViewedItem.upsert({
      where: { movieId: movieData.id },
      update: { dateAdded: new Date() }, 
      create: {
        movieId: movieData.id,
        dateAdded: new Date(),
      },
    });
    console.log(`[storage.ts] Successfully upserted movie ${movieData.id} to recently viewed.`);

    // Keep only the latest 20 recently viewed items
    const count = await prisma.recentlyViewedItem.count();
    if (count > 20) {
      const oldestItems = await prisma.recentlyViewedItem.findMany({
        orderBy: { dateAdded: "asc" },
        take: count - 20,
      });
      await prisma.recentlyViewedItem.deleteMany({
        where: { id: { in: oldestItems.map(item => item.id) } },
      });
      console.log(`[storage.ts] Trimmed recently viewed list to 20 items.`);
    }
  } catch (error) {
    console.error(`[storage.ts] Error upserting movie ${movieData.id} to recently viewed:`, error);
    throw error;
  }
}

export async function getRecentlyViewed() {
  console.log("[storage.ts] getRecentlyViewed called.");
  const recentlyViewedItems = await prisma.recentlyViewedItem.findMany({
    include: { movie: true },
    orderBy: { dateAdded: "desc" },
    take: 20,
  });
  // Ensure movie data is correctly mapped, especially posterPath
  return recentlyViewedItems.map(item => ({ ...item.movie, dateAdded: item.dateAdded, userRating: item.movie.userRating, userNotes: item.movie.userNotes }));
}

export async function updateMovieUserData(
  movieId: number,
  userData: { userRating?: number | null; userNotes?: string | null }
): Promise<void> {
  console.log(`[storage.ts] updateMovieUserData called for movieId: ${movieId} with data:`, userData);
  try {
    await prisma.movie.update({
      where: { id: movieId },
      data: {
        userRating: userData.userRating,
        userNotes: userData.userNotes,
      },
    });
    console.log(`[storage.ts] Successfully updated user data for movie ${movieId}.`);
  } catch (error) {
    console.error(`[storage.ts] Error updating user data for movie ${movieId}:`, error);
    throw error;
  }
}

export async function getMovieWithUserData(movieId: number) {
    // console.log(`[storage.ts] getMovieWithUserData called for movieId: ${movieId}`); // Can be noisy
    return prisma.movie.findUnique({
        where: { id: movieId }
    });
}

