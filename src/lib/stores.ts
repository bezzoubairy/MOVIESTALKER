/******************************************************************************
 * Store for managing application state (Prisma-backed)
 ******************************************************************************/
import { writable } from "svelte/store";
import type { Movie as TmdbMovie, MovieDetails } from "$lib/services/tmdb"; // Original TMDB type
import type { Movie as PrismaMovie } from "@prisma/client"; // Prisma's Movie type

// Define a more comprehensive Movie type for the frontend, combining TMDB and user data
export interface AppMovie extends TmdbMovie {
  userRating?: number | null;
  userNotes?: string | null;
  dateAdded?: Date | string | null; // For items in lists like watchlist
}

// This type represents a movie that has been processed and includes its list-specific data (like dateAdded)
// and user-specific data (userRating, userNotes) directly on the object.
// It's derived from PrismaMovie but might be structured slightly differently for frontend use after joining.
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

// Store for user collections - now they will hold StoredAppMovie[]
// These stores will be initialized by +layout.svelte using data from +layout.server.ts
export const watchlistMovies = writable<StoredAppMovie[]>([]);
export const favoriteMovies = writable<StoredAppMovie[]>([]);
export const recentlyViewedMovies = writable<StoredAppMovie[]>([]);

// Store for popular movies - typically fetched on the client or specific page load
export const popularMovies = writable<TmdbMovie[]>([]);
export const isLoadingPopular = writable<boolean>(false);

// Store for loading state of collections, can be managed by components or layout
export const isLoadingCollections = writable<boolean>(true); // Start as true until layout load completes

// Functions that used to modify stores by calling DB directly are removed.
// Components will now use SvelteKit forms and server actions to modify data.
// The stores will be updated reactively when the page data (from load functions) changes
// or by manually updating them after a successful form action if needed (though SvelteKit's
// invalidation often handles this).

// Example: If a component needs to optimistically update a store after a form submission,
// it can do so, but the source of truth comes from the server load functions.

// Note: The functions like addMovieToWatchlist, removeMovieFromWatchlist, etc.,
// that were previously in this file and called DB functions directly, have been removed.
// Their logic is now handled by server actions in the respective +page.server.ts files,
// and the Svelte stores are updated based on the data reloaded by SvelteKit's load functions
// after these actions complete, or by data passed back from the action itself.

