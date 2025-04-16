/**
 * Store for managing application state
 */
import { writable } from 'svelte/store';
import type { Movie, MovieDetails } from '$lib/services/tmdb';
import type { StoredMovie } from '$lib/services/storage';
import { 
  getWatchlist, 
  getFavorites, 
  getRecentlyViewed,
  addToWatchlist,
  removeFromWatchlist,
  addToFavorites,
  removeFromFavorites,
  updateMovieUserData
} from '$lib/services/storage';

// Store for search results
export const searchResults = writable<Movie[]>([]);
export const searchQuery = writable<string>('');
export const isSearching = writable<boolean>(false);

// Store for movie details
export const currentMovie = writable<MovieDetails | null>(null);
export const isLoadingMovie = writable<boolean>(false);
export const recommendedMovies = writable<Movie[]>([]);

// Store for user collections
export const watchlistMovies = writable<StoredMovie[]>([]);
export const favoriteMovies = writable<StoredMovie[]>([]);
export const recentlyViewedMovies = writable<StoredMovie[]>([]);

// Store for popular movies
export const popularMovies = writable<Movie[]>([]);
export const isLoadingPopular = writable<boolean>(false);

// Load user collections from storage
export function loadUserCollections() {
  watchlistMovies.set(getWatchlist());
  favoriteMovies.set(getFavorites());
  recentlyViewedMovies.set(getRecentlyViewed());
}

// Add movie to watchlist and update store
export function addMovieToWatchlist(movie: Movie) {
  addToWatchlist(movie);
  watchlistMovies.set(getWatchlist());
}

// Remove movie from watchlist and update store
export function removeMovieFromWatchlist(movieId: number) {
  removeFromWatchlist(movieId);
  watchlistMovies.set(getWatchlist());
}

// Add movie to favorites and update store
export function addMovieToFavorites(movie: Movie) {
  addToFavorites(movie);
  favoriteMovies.set(getFavorites());
}

// Remove movie from favorites and update store
export function removeMovieFromFavorites(movieId: number) {
  removeFromFavorites(movieId);
  favoriteMovies.set(getFavorites());
}

// Update movie user data and refresh stores
export function updateMovieData(
  movieId: number, 
  userData: { userRating?: number; userNotes?: string }
) {
  updateMovieUserData(movieId, userData);
  
  // Refresh all collections to reflect changes
  watchlistMovies.set(getWatchlist());
  favoriteMovies.set(getFavorites());
  recentlyViewedMovies.set(getRecentlyViewed());
}
