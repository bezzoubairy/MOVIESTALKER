<script lang="ts">
  import type { StoredMovie } from '$lib/services/storage';
  import { removeFromWatchlist, removeFromFavorites, updateMovieUserData } from '$lib/services/storage';
  import { getImageUrl } from '$lib/services/tmdb';
  
  export let movie: StoredMovie;
  export let listType: 'watchlist' | 'favorites' = 'watchlist';
  
  // Format date added
  $: dateAdded = new Date(movie.dateAdded).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric'
  });
  
  // Handle remove from list
  function removeFromList() {
    if (listType === 'watchlist') {
      removeFromWatchlist(movie.id);
    } else {
      removeFromFavorites(movie.id);
    }
    
    // Dispatch custom event for parent component to handle removal from UI
    const event = new CustomEvent('remove', { detail: { id: movie.id } });
    document.dispatchEvent(event);
  }
  
  // User rating state
  let userRating = movie.userRating || 0;
  let userNotes = movie.userNotes || '';
  let showNotes = false;
  
  // Save user rating and notes
  function saveUserData() {
    updateMovieUserData(movie.id, { 
      userRating, 
      userNotes 
    });
    showNotes = false;
  }
  
  // Toggle notes visibility
  function toggleNotes() {
    showNotes = !showNotes;
  }
</script>

<div class="watchlist-item">
  <div class="poster">
    <a href="/movie/{movie.id}">
      <img 
        src={getImageUrl(movie.poster_path, 'w185')} 
        alt="{movie.title} poster" 
      />
    </a>
  </div>
  
  <div class="details">
    <div class="header">
      <h3 class="title">
        <a href="/movie/{movie.id}">{movie.title}</a>
      </h3>
      <div class="meta">
        <span class="date">Added on {dateAdded}</span>
        <span class="rating">TMDB: {movie.vote_average.toFixed(1)}/10</span>
      </div>
    </div>
    
    <p class="overview">{movie.overview}</p>
    
    <div class="actions">
      <div class="user-rating">
        <span class="label">Your Rating:</span>
        <div class="stars">
          {#each Array(5) as _, i}
            <button 
              class="star" 
              class:active={i < (userRating / 2)}
              on:click={() => userRating = (i + 1) * 2}
              title={`Rate ${(i + 1) * 2} out of 10`}
            >
              ★
            </button>
          {/each}
        </div>
        <span class="rating-value">{userRating ? `${userRating}/10` : 'Not rated'}</span>
      </div>
      
      <div class="buttons">
        <button class="btn notes" on:click={toggleNotes}>
          {showNotes ? 'Hide Notes' : 'Add Notes'}
        </button>
        <button class="btn remove" on:click={removeFromList}>
          Remove
        </button>
      </div>
    </div>
    
    {#if showNotes}
      <div class="notes-section">
        <textarea 
          bind:value={userNotes} 
          placeholder="Add your personal notes about this movie..."
          rows="3"
        ></textarea>
        <button class="btn save" on:click={saveUserData}>Save</button>
      </div>
    {/if}
  </div>
</div>

<style>
  .watchlist-item {
    display: flex;
    gap: 20px;
    padding: 20px;
    background-color: white;
    border-radius: 8px;
    box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
    margin-bottom: 20px;
  }
  
  .poster {
    flex-shrink: 0;
    width: 100px;
  }
  
  .poster img {
    width: 100%;
    border-radius: 4px;
    box-shadow: 0 2px 5px rgba(0, 0, 0, 0.2);
  }
  
  .details {
    flex: 1;
    display: flex;
    flex-direction: column;
  }
  
  .header {
    margin-bottom: 10px;
  }
  
  .title {
    margin: 0 0 5px 0;
    font-size: 1.2rem;
  }
  
  .title a {
    color: #333;
    text-decoration: none;
  }
  
  .title a:hover {
    color: #0066cc;
  }
  
  .meta {
    display: flex;
    gap: 15px;
    font-size: 0.85rem;
    color: #666;
  }
  
  .overview {
    margin-bottom: 15px;
    font-size: 0.95rem;
    line-height: 1.5;
    display: -webkit-box;
    -webkit-line-clamp: 3;
    -webkit-box-orient: vertical;
    overflow: hidden;
  }
  
  .actions {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-top: auto;
  }
  
  .user-rating {
    display: flex;
    align-items: center;
    gap: 10px;
  }
  
  .label {
    font-size: 0.9rem;
    color: #666;
  }
  
  .stars {
    display: flex;
    gap: 2px;
  }
  
  .star {
    background: none;
    border: none;
    font-size: 1.2rem;
    color: #ddd;
    cursor: pointer;
    transition: color 0.2s ease;
    padding: 0;
  }
  
  .star:hover, .star.active {
    color: #ffb700;
  }
  
  .rating-value {
    font-size: 0.9rem;
    min-width: 60px;
  }
  
  .buttons {
    display: flex;
    gap: 10px;
  }
  
  .btn {
    padding: 6px 12px;
    border: 1px solid #ddd;
    background-color: #f8f8f8;
    border-radius: 4px;
    cursor: pointer;
    font-size: 0.85rem;
    transition: all 0.2s ease;
  }
  
  .btn:hover {
    background-color: #eee;
  }
  
  .remove {
    color: #e74c3c;
    border-color: #e74c3c;
  }
  
  .remove:hover {
    background-color: #e74c3c;
    color: white;
  }
  
  .save {
    background-color: #0066cc;
    color: white;
    border-color: #0066cc;
  }
  
  .save:hover {
    background-color: #0055aa;
  }
  
  .notes-section {
    margin-top: 15px;
  }
  
  textarea {
    width: 100%;
    padding: 10px;
    border: 1px solid #ddd;
    border-radius: 4px;
    font-family: inherit;
    font-size: 0.9rem;
    margin-bottom: 10px;
    resize: vertical;
  }
  
  @media (max-width: 600px) {
    .watchlist-item {
      flex-direction: column;
    }
    
    .poster {
      width: 120px;
    }
    
    .actions {
      flex-direction: column;
      align-items: flex-start;
      gap: 15px;
    }
    
    .user-rating {
      width: 100%;
    }
  }
</style>
