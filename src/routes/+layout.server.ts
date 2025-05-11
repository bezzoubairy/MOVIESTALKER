import type { LayoutServerLoad } from "./$types";
import { /*getWatchlist,*/ getFavorites, getRecentlyViewed } from "$lib/server/storage"; // Assuming this path is correct for storage functions

// Helper function to map posterPath to poster_path for a single movie object within an item
const mapMovieInItem = (item: any) => {
  if (item && item.movie && typeof item.movie.posterPath === 'string') {
    const updatedMovie = { ...item.movie, poster_path: item.movie.posterPath };
    return { ...item, movie: updatedMovie };
  }
  if (item && item.movie && item.movie.posterPath === null) {
    const updatedMovie = { ...item.movie, poster_path: null };
    return { ...item, movie: updatedMovie };
  }
  // If item.movie is not what we expect, or posterPath is undefined, return item as is or handle error
  // For now, let's assume if posterPath is missing, getImageUrl will use placeholder
  return item;
};

// Helper function to map an array of items containing movie objects
const mapMovieList = (movieList: any[]) => {
  if (!Array.isArray(movieList)) {
    return []; // Return empty array if not an array, preventing .map error
  }
  return movieList.map(mapMovieInItem);
};

export const load: LayoutServerLoad = async () => {
  try {
    const [/*watchlistMovies,*/ favoritesMovies, recentlyViewedMovies] = await Promise.all([
      // getWatchlist(), // Watchlist removed
      getFavorites(),
      getRecentlyViewed(),
    ]);

    return {
      // watchlist: mapMovieList(watchlistMovies), // Watchlist removed
      favorites: mapMovieList(favoritesMovies),
      recentlyViewed: mapMovieList(recentlyViewedMovies),
    };
  } catch (error) {
    console.error("Error loading initial collections in layout.server.ts:", error);
    // Return empty arrays to prevent client-side errors if possible
    return {
      // watchlist: [], // Watchlist removed
      favorites: [],
      recentlyViewed: [],
      error: "Failed to load movie collections.", // Optionally, pass error to client for display
    };
  }
};

