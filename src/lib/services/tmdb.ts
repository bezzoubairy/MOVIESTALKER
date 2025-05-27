/** TMDB API Service
 This service handles all interactions with The Movie Database API
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

// Import standardized types from central type definitions
import type { Movie, MovieDetails, MovieSearchResponse } from '$lib/types/movie';


export async function getPopularMovies(page = 1): Promise<MovieSearchResponse> {
  const url = `${BASE_URL}/movie/popular?api_key=${API_KEY}&language=en-US&page=${page}`;
  const response = await fetch(url);
  
  if (!response.ok) {
    throw new Error(`Error fetching popular movies: ${response.status}`);
  }
  
  return await response.json();
}


export async function searchMovies(query: string, page = 1): Promise<MovieSearchResponse> {
  const url = `${BASE_URL}/search/movie?api_key=${API_KEY}&language=en-US&query=${encodeURIComponent(query)}&page=${page}&include_adult=false`;
  const response = await fetch(url);
  
  if (!response.ok) {
    throw new Error(`Error searching movies: ${response.status}`);
  }
  
  return await response.json();
}

export async function getMovieDetails(movieId: number): Promise<MovieDetails> {
  const url = `${BASE_URL}/movie/${movieId}?api_key=${API_KEY}&language=en-US`;
  const response = await fetch(url);
  
  if (!response.ok) {
    throw new Error(`Error fetching movie details: ${response.status}`);
  }
  
  return await response.json();
}

export async function getRecommendedMovies(movieId: number, page = 1): Promise<MovieSearchResponse> {
  const url = `${BASE_URL}/movie/${movieId}/recommendations?api_key=${API_KEY}&language=en-US&page=${page}`;
  const response = await fetch(url);
  
  if (!response.ok) {
    throw new Error(`Error fetching recommended movies: ${response.status}`);
  }
  
  return await response.json();
}


export function getImageUrl(path: string | null, size: string): string {
  if (!path) return '/placeholder-image.jpg';
  return `${IMAGE_BASE_URL}/${size}${path}`;
}
