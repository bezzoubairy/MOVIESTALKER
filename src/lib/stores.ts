// Store for managing application state (Prisma-backed)

import { writable } from "svelte/store";
import type { Movie as TmdbMovie, MovieDetails } from "$lib/services/tmdb"; // TMDB type
import type { Movie as PrismaMovie } from "@prisma/client"; // Prisma's Movie type

// Define a more comprehensive Movie type for the frontend, combining TMDB and user data
export interface AppMovie extends TmdbMovie {
  userRating?: number | null;
  userNotes?: string | null;
  dateAdded?: Date | string | null; 

export interface StoredAppMovie extends PrismaMovie {
  dateAdded?: Date | string | null; 
}

// Store for search results
export const searchResults = writable<TmdbMovie[]>([]);
export const searchQuery = writable<string>("");
export const isSearching = writable<boolean>(false);

// Store for movie details
export const currentMovie = writable<MovieDetails | null>(null); // MovieDetails likely from TMDB
export const isLoadingMovie = writable<boolean>(false);
export const recommendedMovies = writable<TmdbMovie[]>([]);

// Store for user collections 

export const watchlistMovies = writable<StoredAppMovie[]>([]);
export const favoriteMovies = writable<StoredAppMovie[]>([]);
export const recentlyViewedMovies = writable<StoredAppMovie[]>([]);

// Store for popular movies 
export const popularMovies = writable<TmdbMovie[]>([]);
export const isLoadingPopular = writable<boolean>(false);

// Store for loading state of collections
export const isLoadingCollections = writable<boolean>(true); 

