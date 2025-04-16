/**
 * TMDB API Service
 * This service handles all interactions with The Movie Database API
 */

const API_KEY = '4db5e9eecfc7615908cc6321af7bacaf';
const BASE_URL = 'https://api.themoviedb.org/3';
const IMAGE_BASE_URL = 'https://image.tmdb.org/t/p';

// Image sizes available from TMDB
export const IMAGE_SIZES = {
  poster: {
    small: 'w185',
    medium: 'w342',
    large: 'w500',
    original: 'original'
  },
  backdrop: {
    small: 'w300',
    medium: 'w780',
    large: 'w1280',
    original: 'original'
  },
  profile: {
    small: 'w45',
    medium: 'w185',
    large: 'h632',
    original: 'original'
  }
};

// Types for API responses
export interface Movie {
  id: number;
  title: string;
  overview: string;
  poster_path: string | null;
  backdrop_path: string | null;
  release_date: string;
  vote_average: number;
  vote_count: number;
  genre_ids: number[];
  popularity: number;
  adult: boolean;
  original_language: string;
  original_title: string;
  video: boolean;
}

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

export interface MovieSearchResponse {
  page: number;
  results: Movie[];
  total_results: number;
  total_pages: number;
}

/**
 * Fetch popular movies from TMDB
 * @param page Page number for pagination
 * @returns Promise with movie search response
 */
export async function getPopularMovies(page = 1): Promise<MovieSearchResponse> {
  const url = `${BASE_URL}/movie/popular?api_key=${API_KEY}&language=en-US&page=${page}`;
  const response = await fetch(url);
  
  if (!response.ok) {
    throw new Error(`Error fetching popular movies: ${response.status}`);
  }
  
  return await response.json();
}

/**
 * Search for movies by title
 * @param query Search query (movie title)
 * @param page Page number for pagination
 * @returns Promise with movie search response
 */
export async function searchMovies(query: string, page = 1): Promise<MovieSearchResponse> {
  const url = `${BASE_URL}/search/movie?api_key=${API_KEY}&language=en-US&query=${encodeURIComponent(query)}&page=${page}&include_adult=false`;
  const response = await fetch(url);
  
  if (!response.ok) {
    throw new Error(`Error searching movies: ${response.status}`);
  }
  
  return await response.json();
}

/**
 * Get detailed information for a specific movie
 * @param movieId TMDB movie ID
 * @returns Promise with movie details
 */
export async function getMovieDetails(movieId: number): Promise<MovieDetails> {
  const url = `${BASE_URL}/movie/${movieId}?api_key=${API_KEY}&language=en-US`;
  const response = await fetch(url);
  
  if (!response.ok) {
    throw new Error(`Error fetching movie details: ${response.status}`);
  }
  
  return await response.json();
}

/**
 * Get recommended movies based on a movie
 * @param movieId TMDB movie ID
 * @param page Page number for pagination
 * @returns Promise with movie search response
 */
export async function getRecommendedMovies(movieId: number, page = 1): Promise<MovieSearchResponse> {
  const url = `${BASE_URL}/movie/${movieId}/recommendations?api_key=${API_KEY}&language=en-US&page=${page}`;
  const response = await fetch(url);
  
  if (!response.ok) {
    throw new Error(`Error fetching recommended movies: ${response.status}`);
  }
  
  return await response.json();
}

/**
 * Get full image URL from TMDB
 * @param path Image path from API
 * @param size Size of image (from IMAGE_SIZES)
 * @returns Full image URL
 */
export function getImageUrl(path: string | null, size: string): string {
  if (!path) return '/placeholder-image.jpg';
  return `${IMAGE_BASE_URL}/${size}${path}`;
}
