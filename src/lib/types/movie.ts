// Standardized movie type definitions for the application

// Base Movie type from TMDB API
export interface Movie {
  id: number;
  title: string;
  overview: string;
  poster_path: string | null;
  backdrop_path: string | null;
  release_date: string;
  vote_average: number;
  vote_count: number;
  genre_ids?: number[];
  popularity: number;
  adult: boolean;
  original_language: string;
  original_title: string;
  video: boolean;
}

// Extended Movie Details from TMDB API
export interface MovieDetails extends Movie {
  budget: number;
  genres: { id: number; name: string }[];
  homepage: string | null;
  imdb_id: string | null;
  production_companies: { id: number; name: string; logo_path: string | null; origin_country: string }[];
  production_countries: { iso_3166_1: string; name: string }[];
  revenue: number;
  runtime: number | null;
  spoken_languages: { iso_639_1: string; name: string }[];
  status: string;
  tagline: string | null;
}

// Extended Movie type with user-specific data
export interface UserMovie extends Movie {
  userRating?: number | null;
  userNotes?: string | null;
  dateAdded?: Date | string | null;
  isInitiallyInFavorites?: boolean;
  isInWatchlist?: boolean;
}

// Movie input for database operations
export interface MovieInput {
  id: number;
  title: string;
  posterPath?: string | null;
  releaseDate?: string | null;
  overview?: string | null;
}

// Movie with both naming conventions for transition period
export interface MovieWithPosterPath {
  id: number;
  title: string;
  posterPath?: string | null;
  poster_path?: string | null;
  releaseDate?: string | null;
  release_date?: string;
  overview?: string | null;
  [key: string]: unknown; // Allow other properties during transition but with unknown type
}

// API response types
export interface MovieSearchResponse {
  page: number;
  results: Movie[];
  total_results: number;
  total_pages: number;
}

// Comment type for movie comments
export interface CommentData {
  id: string;
  content: string;
  createdAt: Date | string;
  updatedAt: Date | string;
  movieId: number;
  userId: string;
  user: {
    id: string;
    username: string;
  };
}
