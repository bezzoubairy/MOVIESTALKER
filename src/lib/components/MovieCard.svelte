<script lang="ts">
  import { getImageUrl, type Movie } from '$lib/services/tmdb';
  import { addToWatchlist, removeFromWatchlist, isInWatchlist, 
           addToFavorites, removeFromFavorites, isInFavorites } from '$lib/services/storage';
  
  export let movie: Movie;
  export let showControls: boolean = true;
  
  // Reactive statements to check if movie is in watchlist/favorites
  $: inWatchlist = isInWatchlist(movie.id);
  $: inFavorites = isInFavorites(movie.id);
  
  // Format release date
  $: releaseYear = movie.release_date ? new Date(movie.release_date).getFullYear() : 'Unknown';
  
  // Handle watchlist toggle
  function toggleWatchlist() {
    if (inWatchlist) {
      removeFromWatchlist(movie.id);
    } else {
      addToWatchlist(movie);
    }
    inWatchlist = !inWatchlist;
  }
  
  // Handle favorites toggle
  function toggleFavorites() {
    if (inFavorites) {
      removeFromFavorites(movie.id);
    } else {
      addToFavorites(movie);
    }
    inFavorites = !inFavorites;
  }
</script>

<div class="movie-card">
  <a href="/movie/{movie.id}" class="poster-link">
    <img 
      src={getImageUrl(movie.poster_path, 'w342')} 
      alt="{movie.title} poster" 
      class="poster"
    />
    <div class="rating">{movie.vote_average.toFixed(1)}</div>
  </a>
  
  <div class="info">
    <h3 class="title">
      <a href="/movie/{movie.id}">{movie.title}</a>
    </h3>
    <p class="year">{releaseYear}</p>
    
    {#if showControls}
      <div class="controls">
        <button 
          class="btn watchlist" 
          class:active={inWatchlist} 
          on:click={toggleWatchlist}
          title={inWatchlist ? "Remove from watchlist" : "Add to watchlist"}
        >
          {inWatchlist ? '✓ Watchlist' : '+ Watchlist'}
        </button>
        
        <button 
          class="btn favorite" 
          class:active={inFavorites} 
          on:click={toggleFavorites}
          title={inFavorites ? "Remove from favorites" : "Add to favorites"}
        >
          {inFavorites ? '★ Favorite' : '☆ Favorite'}
        </button>
      </div>
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
    border-radius: 4px;
    cursor: pointer;
    font-size: 0.85rem;
    transition: all 0.2s ease;
    flex: 1;
  }
  
  .btn:hover {
    background-color: #eee;
  }
  
  .btn.active {
    background-color: #0066cc;
    color: white;
    border-color: #0066cc;
  }
  
  .favorite.active {
    background-color: #ff6b6b;
    border-color: #ff6b6b;
  }
</style>
