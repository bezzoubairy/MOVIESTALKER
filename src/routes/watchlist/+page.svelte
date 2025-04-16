<script lang="ts">
  import { onMount } from 'svelte';
  import WatchlistItem from '$lib/components/WatchlistItem.svelte';
  import FilterComponent from '$lib/components/FilterComponent.svelte';
  import { watchlistMovies } from '$lib/stores';
  
  let genreFilter = '';
  let sortOption = 'dateAdded';
  
  // Genre options for filtering
  const genreOptions = [
    'Action', 'Adventure', 'Animation', 'Comedy', 'Crime', 
    'Documentary', 'Drama', 'Family', 'Fantasy', 'History',
    'Horror', 'Music', 'Mystery', 'Romance', 'Science Fiction',
    'Thriller', 'War', 'Western'
  ];
  
  // Sort options
  const sortOptions = [
    'Date Added (Newest)', 
    'Date Added (Oldest)', 
    'Title (A-Z)', 
    'Title (Z-A)', 
    'Rating (Highest)', 
    'Rating (Lowest)'
  ];
  
  // Common genre IDs mapping
  const genreMap = {
    'Action': 28,
    'Adventure': 12,
    'Animation': 16,
    'Comedy': 35,
    'Crime': 80,
    'Documentary': 99,
    'Drama': 18,
    'Family': 10751,
    'Fantasy': 14,
    'History': 36,
    'Horror': 27,
    'Music': 10402,
    'Mystery': 9648,
    'Romance': 10749,
    'Science Fiction': 878,
    'Thriller': 53,
    'War': 10752,
    'Western': 37
  };
  
  // Handle movie removal from list
  function handleRemove(event: CustomEvent) {
    const movieId = event.detail.id;
    watchlistMovies.update(movies => movies.filter(m => m.id !== movieId));
  }
  
  // Filter watchlist by genre
  $: filteredWatchlist = genreFilter 
    ? $watchlistMovies.filter(movie => 
        movie.genre_ids.includes(genreMap[genreFilter as keyof typeof genreMap])
      )
    : $watchlistMovies;
  
  // Sort watchlist
  $: sortedWatchlist = [...filteredWatchlist].sort((a, b) => {
    switch(sortOption) {
      case 'Date Added (Newest)':
        return new Date(b.dateAdded).getTime() - new Date(a.dateAdded).getTime();
      case 'Date Added (Oldest)':
        return new Date(a.dateAdded).getTime() - new Date(b.dateAdded).getTime();
      case 'Title (A-Z)':
        return a.title.localeCompare(b.title);
      case 'Title (Z-A)':
        return b.title.localeCompare(a.title);
      case 'Rating (Highest)':
        return (b.userRating || 0) - (a.userRating || 0);
      case 'Rating (Lowest)':
        return (a.userRating || 0) - (b.userRating || 0);
      default:
        return new Date(b.dateAdded).getTime() - new Date(a.dateAdded).getTime();
    }
  });
</script>

<svelte:head>
  <title>My Watchlist - Movie Tracker</title>
</svelte:head>

<div class="watchlist-page">
  <h1>My Watchlist</h1>
  
  {#if $watchlistMovies.length === 0}
    <div class="empty-state">
      <p>Your watchlist is empty. Add movies to your watchlist to see them here.</p>
      <a href="/" class="btn">Browse Movies</a>
    </div>
  {:else}
    <div class="filters">
      <div class="filter-item">
        <FilterComponent 
          options={genreOptions} 
          bind:selectedOption={genreFilter}
          label="Filter by genre"
        />
      </div>
      
      <div class="filter-item">
        <FilterComponent 
          options={sortOptions} 
          bind:selectedOption={sortOption}
          label="Sort by"
        />
      </div>
    </div>
    
    {#if sortedWatchlist.length === 0}
      <div class="empty-state">
        <p>No movies match your filter criteria.</p>
        <button class="btn" on:click={() => genreFilter = ''}>Clear Filters</button>
      </div>
    {:else}
      <div class="watchlist-items">
        {#each sortedWatchlist as movie (movie.id)}
          <WatchlistItem 
            {movie} 
            listType="watchlist"
            on:remove={handleRemove}
          />
        {/each}
      </div>
    {/if}
  {/if}
</div>

<style>
  .watchlist-page {
    padding-top: 20px;
  }
  
  h1 {
    margin-bottom: 20px;
    font-size: 2rem;
  }
  
  .filters {
    display: flex;
    gap: 20px;
    margin-bottom: 20px;
    flex-wrap: wrap;
  }
  
  .filter-item {
    width: 200px;
  }
  
  .empty-state {
    text-align: center;
    padding: 60px 0;
    color: #666;
  }
  
  .btn {
    display: inline-block;
    padding: 10px 20px;
    background-color: #0066cc;
    color: white;
    text-decoration: none;
    border: none;
    border-radius: 4px;
    margin-top: 20px;
    transition: background-color 0.2s ease;
    cursor: pointer;
    font-size: 1rem;
  }
  
  .btn:hover {
    background-color: #0055aa;
  }
  
  .watchlist-items {
    display: flex;
    flex-direction: column;
    gap: 15px;
  }
  
  @media (max-width: 768px) {
    .filters {
      flex-direction: column;
      gap: 10px;
    }
    
    .filter-item {
      width: 100%;
    }
  }
</style>
