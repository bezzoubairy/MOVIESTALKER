<script lang="ts">
  import { onMount } from 'svelte';
  import { page } from '$app/stores';
  import MovieDetails from '$lib/components/MovieDetails.svelte';
  import MovieList from '$lib/components/MovieList.svelte';
  import { getMovieDetails, getRecommendedMovies } from '$lib/services/tmdb';
  import { currentMovie, isLoadingMovie, recommendedMovies } from '$lib/stores';
  import { addToRecentlyViewed } from '$lib/services/storage';
  
  let loading = true;
  let error = '';
  
  onMount(async () => {
    const movieId = parseInt($page.params.id);
    if (isNaN(movieId)) {
      error = 'Invalid movie ID';
      loading = false;
      return;
    }
    
    try {
      isLoadingMovie.set(true);
      
      // Fetch movie details
      const movieData = await getMovieDetails(movieId);
      currentMovie.set(movieData);
      
      // Add to recently viewed
      addToRecentlyViewed(movieData);
      
      // Fetch recommended movies
      const recommendations = await getRecommendedMovies(movieId);
      recommendedMovies.set(recommendations.results);
      
    } catch (err) {
      console.error('Error fetching movie details:', err);
      error = 'Failed to load movie details. Please try again later.';
    } finally {
      loading = false;
      isLoadingMovie.set(false);
    }
  });
</script>

<svelte:head>
  <title>{$currentMovie ? $currentMovie.title + ' - Movie Tracker' : 'Movie Details - Movie Tracker'}</title>
</svelte:head>

<div class="movie-page">
  {#if loading}
    <div class="loading">
      <div class="spinner"></div>
      <p>Loading movie details...</p>
    </div>
  {:else if error}
    <div class="error">
      <h2>Error</h2>
      <p>{error}</p>
      <a href="/" class="btn">Back to Home</a>
    </div>
  {:else if $currentMovie}
    <MovieDetails movie={$currentMovie} />
    
    {#if $recommendedMovies.length > 0}
      <div class="recommendations">
        <h2>You Might Also Like</h2>
        <MovieList 
          movies={$recommendedMovies} 
          columns={4}
          showControls={true}
        />
      </div>
    {/if}
  {/if}
</div>

<style>
  .movie-page {
    padding-top: 20px;
  }
  
  .loading, .error {
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    padding: 60px 20px;
    text-align: center;
  }
  
  .spinner {
    width: 50px;
    height: 50px;
    border: 5px solid rgba(0, 0, 0, 0.1);
    border-radius: 50%;
    border-top-color: #0066cc;
    animation: spin 1s ease-in-out infinite;
    margin-bottom: 20px;
  }
  
  @keyframes spin {
    to { transform: rotate(360deg); }
  }
  
  .error h2 {
    color: #e74c3c;
    margin-bottom: 10px;
  }
  
  .btn {
    display: inline-block;
    padding: 10px 20px;
    background-color: #0066cc;
    color: white;
    text-decoration: none;
    border-radius: 4px;
    margin-top: 20px;
    transition: background-color 0.2s ease;
  }
  
  .btn:hover {
    background-color: #0055aa;
  }
  
  .recommendations {
    margin-top: 40px;
  }
  
  .recommendations h2 {
    font-size: 1.5rem;
    margin-bottom: 20px;
    font-weight: 600;
    color: #333;
    border-bottom: 2px solid #eee;
    padding-bottom: 10px;
  }
</style>
