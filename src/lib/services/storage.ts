/**
 * Storage Service
 * This service handles local storage for user data like watchlist and favorites
 */

import type { Movie } from './tmdb';

// Types for storage
export interface StoredMovie extends Movie {
  dateAdded: string;
  userRating?: number;
  userNotes?: string;
}

export interface StorageData {
  watchlist: Record<number, StoredMovie>;
  favorites: Record<number, StoredMovie>;
  recentlyViewed: Record<number, StoredMovie>;
}

// Default empty storage structure
const defaultStorage: StorageData = {
  watchlist: {},
  favorites: {},
  recentlyViewed: {}
};

/**
 * Initialize storage with default values if not exists
 */
function initStorage(): void {
  if (typeof window === 'undefined') return; // Skip during SSR
  
  if (!localStorage.getItem('movieTracker')) {
    localStorage.setItem('movieTracker', JSON.stringify(defaultStorage));
  }
}

/**
 * Get all storage data
 * @returns Storage data object
 */
export function getStorageData(): StorageData {
  if (typeof window === 'undefined') return defaultStorage; // Return default during SSR
  
  initStorage();
  const data = localStorage.getItem('movieTracker');
  return data ? JSON.parse(data) : defaultStorage;
}

/**
 * Save storage data
 * @param data Storage data to save
 */
export function saveStorageData(data: StorageData): void {
  if (typeof window === 'undefined') return; // Skip during SSR
  
  localStorage.setItem('movieTracker', JSON.stringify(data));
}

/**
 * Add movie to watchlist
 * @param movie Movie to add
 */
export function addToWatchlist(movie: Movie): void {
  const data = getStorageData();
  data.watchlist[movie.id] = {
    ...movie,
    dateAdded: new Date().toISOString()
  };
  saveStorageData(data);
}

/**
 * Remove movie from watchlist
 * @param movieId ID of movie to remove
 */
export function removeFromWatchlist(movieId: number): void {
  const data = getStorageData();
  delete data.watchlist[movieId];
  saveStorageData(data);
}

/**
 * Check if movie is in watchlist
 * @param movieId Movie ID to check
 * @returns True if movie is in watchlist
 */
export function isInWatchlist(movieId: number): boolean {
  const data = getStorageData();
  return !!data.watchlist[movieId];
}

/**
 * Get all watchlist movies
 * @returns Array of stored movies
 */
export function getWatchlist(): StoredMovie[] {
  const data = getStorageData();
  return Object.values(data.watchlist).sort((a, b) => 
    new Date(b.dateAdded).getTime() - new Date(a.dateAdded).getTime()
  );
}

/**
 * Add movie to favorites
 * @param movie Movie to add
 */
export function addToFavorites(movie: Movie): void {
  const data = getStorageData();
  data.favorites[movie.id] = {
    ...movie,
    dateAdded: new Date().toISOString()
  };
  saveStorageData(data);
}

/**
 * Remove movie from favorites
 * @param movieId ID of movie to remove
 */
export function removeFromFavorites(movieId: number): void {
  const data = getStorageData();
  delete data.favorites[movieId];
  saveStorageData(data);
}

/**
 * Check if movie is in favorites
 * @param movieId Movie ID to check
 * @returns True if movie is in favorites
 */
export function isInFavorites(movieId: number): boolean {
  const data = getStorageData();
  return !!data.favorites[movieId];
}

/**
 * Get all favorite movies
 * @returns Array of stored movies
 */
export function getFavorites(): StoredMovie[] {
  const data = getStorageData();
  return Object.values(data.favorites).sort((a, b) => 
    new Date(b.dateAdded).getTime() - new Date(a.dateAdded).getTime()
  );
}

/**
 * Add movie to recently viewed
 * @param movie Movie to add
 */
export function addToRecentlyViewed(movie: Movie): void {
  const data = getStorageData();
  data.recentlyViewed[movie.id] = {
    ...movie,
    dateAdded: new Date().toISOString()
  };
  
  // Limit to 20 most recent
  const recentMovies = Object.values(data.recentlyViewed)
    .sort((a, b) => new Date(b.dateAdded).getTime() - new Date(a.dateAdded).getTime())
    .slice(0, 20);
  
  // Rebuild object with only the most recent 20
  data.recentlyViewed = {};
  recentMovies.forEach(m => {
    data.recentlyViewed[m.id] = m;
  });
  
  saveStorageData(data);
}

/**
 * Get recently viewed movies
 * @returns Array of stored movies
 */
export function getRecentlyViewed(): StoredMovie[] {
  const data = getStorageData();
  return Object.values(data.recentlyViewed).sort((a, b) => 
    new Date(b.dateAdded).getTime() - new Date(a.dateAdded).getTime()
  );
}

/**
 * Update movie user data (rating, notes)
 * @param movieId Movie ID to update
 * @param userData User data to update
 */
export function updateMovieUserData(
  movieId: number, 
  userData: { userRating?: number; userNotes?: string }
): void {
  const data = getStorageData();
  
  // Update in all collections where the movie exists
  if (data.watchlist[movieId]) {
    data.watchlist[movieId] = {
      ...data.watchlist[movieId],
      ...userData
    };
  }
  
  if (data.favorites[movieId]) {
    data.favorites[movieId] = {
      ...data.favorites[movieId],
      ...userData
    };
  }
  
  if (data.recentlyViewed[movieId]) {
    data.recentlyViewed[movieId] = {
      ...data.recentlyViewed[movieId],
      ...userData
    };
  }
  
  saveStorageData(data);
}
