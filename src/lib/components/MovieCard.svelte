<script lang="ts">
  import { getImageUrl, type Movie as TmdbMovie } from "$lib/services/tmdb";


  export let movie: TmdbMovie & { userRating?: number | null; userNotes?: string | null; dateAdded?: Date | string | null; id: number; };
  export let showControls: boolean = true;
  
  export let isInitiallyInFavorites: boolean = false;

  // Reactive updates for initial state still needed for button text/styling
  
  let isInFavoritesState: boolean = isInitiallyInFavorites;

  
  $: isInFavoritesState = isInitiallyInFavorites;

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
        <!-- Watchlist Toggle Form Removed -->

        // Favorite Toggle Form 
        <form method="POST" action="?/toggleFavorite">
          <input type="hidden" name="movieId" value={movie.id} />
          <input type="hidden" name="title" value={movie.title} />
          <input type="hidden" name="poster_path" value={movie.poster_path || ""} />
          <input type="hidden" name="release_date" value={movie.release_date || ""} />
          <input type="hidden" name="overview" value={movie.overview || ""} />
          <button
            type="submit"
            class="btn favorite"
            class:active={isInFavoritesState}
            title={isInFavoritesState
              ? "Remove from favorites"
              : "Add to favorites"}
          >
            {isInFavoritesState ? "★ Favorite" : "☆ Favorite"}
          </button>
        </form>
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
</style>

