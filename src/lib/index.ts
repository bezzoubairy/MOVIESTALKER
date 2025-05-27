// Reexport components for easier imports
export { default as CommentSection } from './components/CommentSection.svelte';
export { default as FilterComponent } from './components/FilterComponent.svelte';
export { default as MovieCard } from './components/MovieCard.svelte';
export { default as MovieDetails } from './components/MovieDetails.svelte';
export { default as MovieList } from './components/MovieList.svelte';
export { default as Navigation } from './components/Navigation.svelte';
export { default as RatingComponent } from './components/RatingComponent.svelte';
export { default as SearchBar } from './components/SearchBar.svelte';
export { default as WatchlistItem } from './components/WatchlistItem.svelte';

// Reexport services
export * from './services/tmdb';

// Reexport types
export * from './types/movie';
