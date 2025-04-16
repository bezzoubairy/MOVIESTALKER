<script lang="ts">
  import { getImageUrl, type MovieDetails } from '$lib/services/tmdb';
  import { addToWatchlist, removeFromWatchlist, isInWatchlist, 
           addToFavorites, removeFromFavorites, isInFavorites,
           updateMovieUserData } from '$lib/services/storage';
  
  export let movie: MovieDetails;
  
  // Reactive statements to check if movie is in watchlist/favorites
  $: inWatchlist = isInWatchlist(movie.id);
  $: inFavorites = isInFavorites(movie.id);
  
  // Format release date
  $: releaseDate = movie.release_date 
    ? new Date(movie.release_date).toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'long',
        day: 'numeric'
      }) 
    : 'Unknown';
  
  // Format runtime
  $: runtime = movie.runtime 
    ? `${Math.floor(movie.runtime / 60)}h ${movie.runtime % 60}m` 
    : 'Unknown';
  
  // User rating state
  let userRating = 0;
  let userNotes = '';
  
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
  
  // Save user rating
  function saveRating() {
    updateMovieUserData(movie.id, { 
      userRating, 
      userNotes 
    });
  }
</script>

<div class="movie-details">
  <div class="backdrop" style="background-image: url({getImageUrl(movie.backdrop_path, 'w1280')})">
    <div class="backdrop-overlay"></div>
  </div>
  
  <div class="content">
    <div class="poster-container">
      <img 
        src={getImageUrl(movie.poster_path, 'w500')} 
        alt="{movie.title} poster" 
        class="poster"
      />
    </div>
    
    <div class="info">
      <h1 class="title">{movie.title} <span class="year">({movie.release_date ? new Date(movie.release_date).getFullYear() : 'N/A'})</span></h1>
      
      {#if movie.tagline}
        <p class="tagline">{movie.tagline}</p>
      {/if}
      
      <div class="meta">
        <div class="rating">
          <span class="label">Rating:</span>
          <span class="value">{movie.vote_average.toFixed(1)}/10</span>
          <span class="votes">({movie.vote_count} votes)</span>
        </div>
        
        <div class="release">
          <span class="label">Release Date:</span>
          <span class="value">{releaseDate}</span>
        </div>
        
        <div class="runtime">
          <span class="label">Runtime:</span>
          <span class="value">{runtime}</span>
        </div>
      </div>
      
      {#if movie.genres && movie.genres.length > 0}
        <div class="genres">
          {#each movie.genres as genre}
            <span class="genre">{genre.name}</span>
          {/each}
        </div>
      {/if}
      
      <div class="overview">
        <h3>Overview</h3>
        <p>{movie.overview || 'No overview available.'}</p>
      </div>
      
      <div class="actions">
        <button 
          class="btn watchlist" 
          class:active={inWatchlist} 
          on:click={toggleWatchlist}
        >
          {inWatchlist ? '✓ In Watchlist' : '+ Add to Watchlist'}
        </button>
        
        <button 
          class="btn favorite" 
          class:active={inFavorites} 
          on:click={toggleFavorites}
        >
          {inFavorites ? '★ Favorited' : '☆ Add to Favorites'}
        </button>
      </div>
      
      <div class="user-rating">
        <h3>Your Rating</h3>
        <div class="rating-input">
          <div class="stars">
            {#each Array(10) as _, i}
              <button 
                class="star" 
                class:active={i < userRating}
                on:click={() => userRating = i + 1}
                title={`Rate ${i + 1} out of 10`}
              >
                ★
              </button>
            {/each}
          </div>
          <span class="rating-value">{userRating ? `${userRating}/10` : 'Not rated'}</span>
        </div>
        
        <div class="notes">
          <h4>Your Notes</h4>
          <textarea 
            bind:value={userNotes} 
            placeholder="Add your personal notes about this movie..."
            rows="3"
          ></textarea>
          <button class="btn save" on:click={saveRating}>Save</button>
        </div>
      </div>
    </div>
  </div>
</div>

<style>
  .movie-details {
    position: relative;
    color: #333;
  }
  
  .backdrop {
    position: absolute;
    top: 0;
    left: 0;
    width: 100%;
    height: 400px;
    background-size: cover;
    background-position: center top;
    z-index: -1;
  }
  
  .backdrop-overlay {
    position: absolute;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    background: linear-gradient(to bottom, rgba(0,0,0,0.7) 0%, rgba(0,0,0,0.4) 100%);
  }
  
  .content {
    max-width: 1200px;
    margin: 0 auto;
    padding: 20px;
    display: grid;
    grid-template-columns: 300px 1fr;
    gap: 30px;
    padding-top: 40px;
  }
  
  .poster-container {
    position: relative;
  }
  
  .poster {
    width: 100%;
    border-radius: 8px;
    box-shadow: 0 5px 15px rgba(0, 0, 0, 0.3);
  }
  
  .info {
    background-color: white;
    border-radius: 8px;
    padding: 30px;
    box-shadow: 0 5px 15px rgba(0, 0, 0, 0.1);
  }
  
  .title {
    margin: 0 0 10px 0;
    font-size: 2rem;
    color: #333;
  }
  
  .year {
    font-weight: normal;
    color: #666;
  }
  
  .tagline {
    font-style: italic;
    color: #666;
    margin-bottom: 20px;
  }
  
  .meta {
    display: grid;
    grid-template-columns: repeat(3, 1fr);
    gap: 15px;
    margin-bottom: 20px;
    padding-bottom: 20px;
    border-bottom: 1px solid #eee;
  }
  
  .label {
    font-weight: bold;
    display: block;
    margin-bottom: 5px;
    color: #666;
  }
  
  .value {
    font-size: 1.1rem;
  }
  
  .votes {
    font-size: 0.9rem;
    color: #666;
  }
  
  .genres {
    display: flex;
    flex-wrap: wrap;
    gap: 8px;
    margin-bottom: 20px;
  }
  
  .genre {
    background-color: #f0f0f0;
    padding: 5px 10px;
    border-radius: 20px;
    font-size: 0.9rem;
  }
  
  .overview {
    margin-bottom: 30px;
  }
  
  .overview h3 {
    margin-bottom: 10px;
    font-size: 1.3rem;
  }
  
  .overview p {
    line-height: 1.6;
  }
  
  .actions {
    display: flex;
    gap: 15px;
    margin-bottom: 30px;
  }
  
  .btn {
    padding: 10px 20px;
    border: none;
    border-radius: 4px;
    cursor: pointer;
    font-size: 1rem;
    transition: all 0.2s ease;
  }
  
  .watchlist {
    background-color: #f8f8f8;
    color: #333;
    border: 1px solid #ddd;
  }
  
  .watchlist:hover {
    background-color: #eee;
  }
  
  .watchlist.active {
    background-color: #0066cc;
    color: white;
    border-color: #0066cc;
  }
  
  .favorite {
    background-color: #f8f8f8;
    color: #333;
    border: 1px solid #ddd;
  }
  
  .favorite:hover {
    background-color: #eee;
  }
  
  .favorite.active {
    background-color: #ff6b6b;
    color: white;
    border-color: #ff6b6b;
  }
  
  .user-rating {
    margin-top: 20px;
    padding-top: 20px;
    border-top: 1px solid #eee;
  }
  
  .user-rating h3 {
    margin-bottom: 15px;
  }
  
  .rating-input {
    display: flex;
    align-items: center;
    margin-bottom: 20px;
  }
  
  .stars {
    display: flex;
    gap: 5px;
    margin-right: 15px;
  }
  
  .star {
    background: none;
    border: none;
    font-size: 1.5rem;
    color: #ddd;
    cursor: pointer;
    transition: color 0.2s ease;
  }
  
  .star:hover, .star.active {
    color: #ffb700;
  }
  
  .rating-value {
    font-size: 1.1rem;
  }
  
  .notes h4 {
    margin-bottom: 10px;
  }
  
  textarea {
    width: 100%;
    padding: 10px;
    border: 1px solid #ddd;
    border-radius: 4px;
    font-family: inherit;
    font-size: 1rem;
    margin-bottom: 10px;
    resize: vertical;
  }
  
  .save {
    background-color: #0066cc;
    color: white;
  }
  
  .save:hover {
    background-color: #0055aa;
  }
  
  @media (max-width: 768px) {
    .content {
      grid-template-columns: 1fr;
    }
    
    .poster-container {
      max-width: 300px;
      margin: 0 auto;
    }
    
    .meta {
      grid-template-columns: 1fr;
    }
  }
</style>
