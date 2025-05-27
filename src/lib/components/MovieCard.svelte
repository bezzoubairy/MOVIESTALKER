<script lang="ts">
  import { getImageUrl } from "$lib/services/tmdb";
  import { invalidateAll } from "$app/navigation";
  import type { UserMovie } from "$lib/types/movie";

  export let movie: UserMovie;
  export let showControls: boolean = true;
  
  export let isInitiallyInFavorites: boolean = false;

  // Reactive state for favorites status
  let isInFavoritesState = isInitiallyInFavorites;
  let isSubmitting = false;
  let errorMessage = '';
  
  import { createEventDispatcher } from 'svelte';
  
  // Create event dispatcher
  const dispatch = createEventDispatcher<{
    favoriteChange: { movieId: number; isFavorite: boolean };
  }>();
  
  // Handle form submission for toggling favorites
  async function handleToggleFavorite(event: Event) {
    event.preventDefault();
    
    if (isSubmitting) return;
    
    const form = event.target as HTMLFormElement;
    const formData = new FormData(form);
    
    isSubmitting = true;
    errorMessage = '';
    
    try {
      // Update UI state immediately for responsive feedback
      const newFavoriteState = !isInFavoritesState;
      isInFavoritesState = newFavoriteState;
      
      // Dispatch event to parent component
      dispatch('favoriteChange', { 
        movieId: movie.id, 
        isFavorite: newFavoriteState 
      });
      
      // Send request to server
      const response = await fetch(form.action, {
        method: 'POST',
        body: formData
      });
      
      if (response.ok) {
        const result = await response.json();
        // Update local state based on server response
        if (result.success) {
          isInFavoritesState = result.action === 'added';
          // Dispatch event again with server-confirmed state
          dispatch('favoriteChange', { 
            movieId: movie.id, 
            isFavorite: isInFavoritesState 
          });
          // Invalidate all data to ensure consistency
          await invalidateAll();
        } else if (result.error) {
          // Revert state if server returns error
          isInFavoritesState = !isInFavoritesState;
          dispatch('favoriteChange', { 
            movieId: movie.id, 
            isFavorite: isInFavoritesState 
          });
          errorMessage = result.error;
        }
      } else {
        // Revert state if server returns error
        isInFavoritesState = !isInFavoritesState;
        dispatch('favoriteChange', { 
          movieId: movie.id, 
          isFavorite: isInFavoritesState 
        });
        errorMessage = `Server error: ${response.status}`;
      }
    } catch (error) {
      console.error('Error toggling favorite:', error);
      // Revert state if there's an error
      isInFavoritesState = !isInFavoritesState;
      dispatch('favoriteChange', { 
        movieId: movie.id, 
        isFavorite: isInFavoritesState 
      });
      errorMessage = 'Failed to update favorite status. Please try again.';
    } finally {
      isSubmitting = false;
    }
  }

  $: releaseYear = movie.release_date
    ? new Date(movie.release_date).getFullYear()
    : "Unknown";
</script>

<div class="movie-card">
  <a href={`/movie/${movie.id}`} class="poster-link">
    <img
      src={getImageUrl(movie.poster_path, "w342")}
      alt={`${movie.title} poster`}
      class="poster"
    />
    {#if movie.vote_average}
      <div class="rating">{movie.vote_average.toFixed(1)}</div>
    {/if}
  </a>

  <div class="info">
    <h3 class="title">
      <a href={`/movie/${movie.id}`}>{movie.title}</a>
    </h3>
    <p class="year">{releaseYear}</p>

    {#if showControls}
      <div class="controls">
        <!-- Favorite Toggle Form -->
        <form method="POST" action="?/toggleFavorite" on:submit={handleToggleFavorite}>
          <input type="hidden" name="movieId" value={movie.id} />
          <input type="hidden" name="title" value={movie.title} />
          <input type="hidden" name="poster_path" value={movie.poster_path || ""} />
          <input type="hidden" name="release_date" value={movie.release_date || ""} />
          <input type="hidden" name="overview" value={movie.overview || ""} />
          <button
            type="submit"
            class="btn favorite"
            class:active={isInFavoritesState}
            class:loading={isSubmitting}
            disabled={isSubmitting}
            title={isInFavoritesState
              ? "Remove from favorites"
              : "Add to favorites"}
          >
            {#if isSubmitting}
              Loading...
            {:else}
              {isInFavoritesState ? "★ Favorite" : "☆ Favorite"}
            {/if}
          </button>
        </form>
      </div>
      {#if errorMessage}
        <div class="error-message">{errorMessage}</div>
      {/if}
    {/if}
  </div>
</div>

<style>
  .movie-card {
    width: 100%;
    border-radius: 8px;
    overflow: hidden;
    box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
    background-color: #fff;
    transition: transform 0.3s ease, box-shadow 0.3s ease;
    margin-bottom: 20px;
  }
  
  .movie-card:hover {
    transform: translateY(-5px);
    box-shadow: 0 8px 16px rgba(0, 0, 0, 0.2);
  }
  
  .poster-link {
    display: block;
    position: relative;
    aspect-ratio: 2/3;
    overflow: hidden;
  }
  
  .poster {
    width: 100%;
    height: 100%;
    object-fit: cover;
    transition: transform 0.3s ease;
  }
  
  .poster-link:hover .poster {
    transform: scale(1.05);
  }
  
  .rating {
    position: absolute;
    top: 10px;
    right: 10px;
    background-color: rgba(0, 0, 0, 0.7);
    color: #fff;
    border-radius: 4px;
    padding: 4px 8px;
    font-weight: bold;
  }
  
  .info {
    padding: 15px;
  }
  
  .title {
    margin: 0 0 5px 0;
    font-size: 1.1rem;
    font-weight: 600;
  }
  
  .title a {
    color: #333;
    text-decoration: none;
  }
  
  .title a:hover {
    color: #0066cc;
  }
  
  .year {
    color: #666;
    margin: 0 0 10px 0;
    font-size: 0.9rem;
  }
  
  .controls {
    display: flex;
    gap: 8px;
    margin-top: 10px;
  }
  
  .btn {
    padding: 6px 12px;
    border: 1px solid #ddd;
    background-color: #f8f8f8;
    color: #333; /* Ensure default text color is visible */
    border-radius: 4px;
    cursor: pointer;
    font-size: 0.85rem;
    transition: all 0.2s ease;
    flex: 1;
  }
  
  .btn:hover {
    background-color: #eee;
  }
  
  
  .favorite.active {
    background-color: #ff6b6b;
    border-color: #ff6b6b;
    color: white; /* Ensure text is visible on active favorite */
  }
  
  .favorite.loading {
    opacity: 0.7;
    cursor: wait;
  }
  
  .error-message {
    color: #e74c3c;
    font-size: 0.8rem;
    margin-top: 5px;
    padding: 5px;
    background-color: #fdeaea;
    border-radius: 4px;
    text-align: center;
  }
</style>
