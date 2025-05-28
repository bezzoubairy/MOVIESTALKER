<script lang="ts">
  import { onMount } from 'svelte';
  import MovieCard from './MovieCard.svelte';
  import type { Movie } from '$lib/services/tmdb';
  import type { UserMovie } from '$lib/types/movie';
  
  export let movies: (Movie | UserMovie)[] = [];
  export let title: string = '';
  export let loading: boolean = false;
  export let emptyMessage: string = 'No movies found';
  export let showControls: boolean = true;
  
  // Grid layout 
  export let columns: number = 4;
  
  
  let movieFavoriteStatus: Record<number, boolean> = {};
  
  // Initialize favorite status from movies
  $: {
    movies.forEach(movie => {
      if ('isInitiallyInFavorites' in movie && movie.id) {
        movieFavoriteStatus[movie.id] = !!movie.isInitiallyInFavorites;
      }
    });
  }
  

  function handleFavoriteChange(movieId: number, isFavorite: boolean) {
    movieFavoriteStatus[movieId] = isFavorite;
  }
  
  // Calculate grid template based on columns prop
  $: gridTemplate = `repeat(${columns}, 1fr)`;
  
  // Animation delay 
  let visible = false;
  
  onMount(() => {
    // Trigger animation
    setTimeout(() => {
      visible = true;
    }, 100);
  });
</script>

<section class="movie-list">
  {#if title}
    <h2 class="section-title">{title}</h2>
  {/if}
  
  {#if loading}
    <div class="loading">
      <div class="spinner"></div>
      <p>Loading movies...</p>
    </div>
  {:else if movies.length === 0}
    <div class="empty">
      <p>{emptyMessage}</p>
    </div>
  {:else}
    <div class="grid" style="grid-template-columns: {gridTemplate};">
      {#each movies as movie, i (movie.id)}
        <div 
          class="movie-item" 
          class:visible
          style="transition-delay: {i * 50}ms"
        >
          <MovieCard 
            {movie} 
            {showControls} 
            isInitiallyInFavorites={movie.id ? movieFavoriteStatus[movie.id] : false}
            on:favoriteChange={(e) => handleFavoriteChange(movie.id, e.detail.isFavorite)}
          />
        </div>
      {/each}
    </div>
  {/if}
</section>

<style>
  .movie-list {
    margin-bottom: 40px;
  }
  
  .section-title {
    font-size: 1.5rem;
    margin-bottom: 20px;
    font-weight: 600;
    color: #333;
    border-bottom: 2px solid #eee;
    padding-bottom: 10px;
  }
  
  .grid {
    display: grid;
    gap: 20px;
  }
  
  .movie-item {
    opacity: 0;
    transform: translateY(20px);
    transition: opacity 0.5s ease, transform 0.5s ease;
  }
  
  .movie-item.visible {
    opacity: 1;
    transform: translateY(0);
  }
  
  .loading, .empty {
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    padding: 40px;
    color: #666;
  }
  
  .spinner {
    width: 40px;
    height: 40px;
    border: 4px solid rgba(0, 0, 0, 0.1);
    border-radius: 50%;
    border-top-color: #0066cc;
    animation: spin 1s ease-in-out infinite;
    margin-bottom: 20px;
  }
  
  @keyframes spin {
    to { transform: rotate(360deg); }
  }
  
  /* Responsive adjustments */
  @media (max-width: 1200px) {
    .grid {
      grid-template-columns: repeat(3, 1fr) !important;
    }
  }
  
  @media (max-width: 768px) {
    .grid {
      grid-template-columns: repeat(2, 1fr) !important;
    }
  }
  
  @media (max-width: 480px) {
    .grid {
      grid-template-columns: 1fr !important;
    }
  }
</style>
