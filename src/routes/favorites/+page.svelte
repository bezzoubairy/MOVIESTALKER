<script lang="ts">
  import MovieCard from "$lib/components/MovieCard.svelte";
  import FilterComponent from "$lib/components/FilterComponent.svelte";
  import type { PageData } from "./$types";
  import { invalidateAll } from "$app/navigation"; 

  export let data: PageData;

  $: favorites = data.favorites || [];

  let genreFilter = "";
  let sortOption = "dateAdded"; // Default sort

  const genreOptions = [
    "Action", "Adventure", "Animation", "Comedy", "Crime",
    "Documentary", "Drama", "Family", "Fantasy", "History",
    "Horror", "Music", "Mystery", "Romance", "Science Fiction",
    "Thriller", "War", "Western",
  ];

  const sortOptions = [
    "Date Added (Newest)",
    "Date Added (Oldest)",
    "Title (A-Z)",
    "Title (Z-A)",
    "Rating (Highest)",
    "Rating (Lowest)",
  ];

  const genreMap: { [key: string]: number } = {
    Action: 28, Adventure: 12, Animation: 16, Comedy: 35, Crime: 80,
    Documentary: 99, Drama: 18, Family: 10751, Fantasy: 14, History: 36,
    Horror: 27, Music: 10402, Mystery: 9648, Romance: 10749, "Science Fiction": 878,
    Thriller: 53, War: 10752, Western: 37,
  };

  $: filteredFavorites = genreFilter
    ? favorites.filter((movie) =>
        movie.genre_ids?.includes(genreMap[genreFilter as keyof typeof genreMap])
      )
    : favorites;

  $: sortedFavorites = [...filteredFavorites].sort((a, b) => {
    switch (sortOption) {
      case "Date Added (Newest)":
        return new Date(b.dateAdded || 0).getTime() - new Date(a.dateAdded || 0).getTime();
      case "Date Added (Oldest)":
        return new Date(a.dateAdded || 0).getTime() - new Date(b.dateAdded || 0).getTime();
      case "Title (A-Z)":
        return a.title.localeCompare(b.title);
      case "Title (Z-A)":
        return b.title.localeCompare(a.title);
      case "Rating (Highest)":
        return (b.userRating || 0) - (a.userRating || 0);
      case "Rating (Lowest)":
        return (a.userRating || 0) - (b.userRating || 0);
      default:
        return new Date(b.dateAdded || 0).getTime() - new Date(a.dateAdded || 0).getTime();
    }
  });

</script>

<svelte:head>
  <title>My Favorites - Movie Tracker</title>
</svelte:head>

<div class="favorites-page">
  <h1>My Favorites</h1>

  {#if data.error}
    <p class="error-message">Error loading favorites: {data.error}</p>
  {/if}

  {#if favorites.length === 0 && !data.error}
    <div class="empty-state">
      <p>Your favorites list is empty. Add movies to your favorites to see them here.</p>
      <a href="/" class="btn">Browse Movies</a>
    </div>
  {:else if sortedFavorites.length > 0}
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
    <div class="movie-grid">
      {#each sortedFavorites as movie (movie.id)}
        <MovieCard
          movie={movie}
          isInitiallyInFavorites={true} 
          isInitiallyInWatchlist={movie.isInWatchlist || false} 
          showControls={true}
        />
      {/each}
    </div>
  {:else if favorites.length > 0 && sortedFavorites.length === 0}
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
    <div class="empty-state">
      <p>No movies match your filter criteria.</p>
      <button class="btn" on:click={() => (genreFilter = "")}>Clear Filters</button>
    </div>
  {/if}
</div>

<style>
  .favorites-page {
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
    min-width: 200px;
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
  .movie-grid {
    display: grid;
    grid-template-columns: repeat(auto-fill, minmax(200px, 1fr));
    gap: 20px;
  }
  .error-message {
    color: red;
    text-align: center;
    padding: 20px;
    border: 1px solid red;
    background-color: #ffe0e0;
    border-radius: 4px;
  }
  @media (max-width: 768px) {
    .filters {
      flex-direction: column;
      gap: 10px;
    }
    .filter-item {
      width: 100%;
    }
    .movie-grid {
       grid-template-columns: repeat(auto-fill, minmax(150px, 1fr));
    }
  }
</style>
