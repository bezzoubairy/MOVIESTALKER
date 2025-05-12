<script lang="ts">
  import { page, navigating } from "$app/stores";
  import MovieList from "$lib/components/MovieList.svelte";
  import SearchBar from "$lib/components/SearchBar.svelte";
  import FilterComponent from "$lib/components/FilterComponent.svelte";
  import type { PageData } from "./$types";
  import { onMount } from "svelte";

  export let data: 
  
  $: query = data.query;
  $: movies = data.movies || [];
  $: currentPage = data.currentPage || 1;
  $: totalPages = data.totalPages || 0;
  $: error = data.error;

  let clientSideQuery = query || ""; 
  let genreFilter = "";
  let isLoading = false; 

  
  $: if (query && clientSideQuery !== query) {
    clientSideQuery = query;
  }

  // loading indicator
  $: isLoading = $navigating?.to?.url.pathname === $page.url.pathname && 
                 $navigating?.to?.url.searchParams.get("q") !== $page.url.searchParams.get("q");

  const genreOptions = [
    "Action", "Adventure", "Animation", "Comedy", "Crime",
    "Documentary", "Drama", "Family", "Fantasy", "History",
    "Horror", "Music", "Mystery", "Romance", "Science Fiction",
    "Thriller", "War", "Western",
  ];

  const genreMap: { [key: string]: number } = {
    Action: 28, Adventure: 12, Animation: 16, Comedy: 35, Crime: 80,
    Documentary: 99, Drama: 18, Family: 10751, Fantasy: 14, History: 36,
    Horror: 27, Music: 10402, Mystery: 9648, Romance: 10749, "Science Fiction": 878,
    Thriller: 53, War: 10752, Western: 37,
  };

  function handleSearch(event: CustomEvent<string>) {
    const searchTerm = event.detail;
    if (searchTerm.trim()) {
      
      window.location.href = `/search?q=${encodeURIComponent(searchTerm.trim())}`;
    }
  }

  $: filteredResults = genreFilter
    ? movies.filter((movie) =>
        movie.genre_ids?.includes(genreMap[genreFilter as keyof typeof genreMap])
      )
    : movies;

  function goToPage(pageNumber: number) {
    if (pageNumber >= 1 && pageNumber <= totalPages && query) {
      window.location.href = `/search?q=${encodeURIComponent(query)}&page=${pageNumber}`;
    }
  }

</script>

<svelte:head>
  <title>Search Movies - Movie Tracker</title>
</svelte:head>

<div class="search-page">
  <h1>Search Movies</h1>

  <div class="search-container">
    <SearchBar
      placeholder="Search for movies..."
      bind:value={clientSideQuery} 
      on:search={handleSearch}
      autofocus={!query} 
    />
  </div>

  {#if error}
    <p class="error-message">{error}</p>
  {/if}

  {#if query && !error}
    <div class="results-header">
      <h2>Results for "{query}"</h2>
      {#if movies.length > 0}
        <div class="filter-container">
          <FilterComponent
            options={genreOptions}
            bind:selectedOption={genreFilter}
            label="Filter by genre"
          />
        </div>
      {/if}
    </div>

    <MovieList
      movies={filteredResults}
      loading={isLoading} 
      emptyMessage="No movies found matching your search and filters."
      columns={4}
      showControls={true}
    />

    {#if totalPages > 1 && !isLoading}
      <div class="pagination">
        <button on:click={() => goToPage(currentPage - 1)} disabled={currentPage <= 1}>
          Previous
        </button>
        <span>Page {currentPage} of {totalPages}</span>
        <button on:click={() => goToPage(currentPage + 1)} disabled={currentPage >= totalPages}>
          Next
        </button>
      </div>
    {/if}

  {:else if !query && !error}
    <div class="empty-state">
      <p>Enter a movie title to search.</p>
    </div>
  {/if}
</div>

<style>
  .search-page {
    padding-top: 20px;
  }
  h1 {
    margin-bottom: 20px;
    font-size: 2rem;
  }
  .search-container {
    max-width: 600px;
    margin: 0 auto 30px;
  }
  .results-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 20px;
    flex-wrap: wrap;
    gap: 20px;
  }
  h2 {
    margin: 0;
    font-size: 1.5rem;
  }
  .filter-container {
    min-width: 200px;
  }
  .empty-state {
    text-align: center;
    padding: 60px 0;
    color: #666;
  }
  .pagination {
    display: flex;
    justify-content: center;
    align-items: center;
    margin-top: 30px;
    gap: 10px;
  }
  .pagination button {
    padding: 8px 16px;
    border: 1px solid #ddd;
    background-color: #f8f8f8;
    border-radius: 4px;
    cursor: pointer;
  }
  .pagination button:disabled {
    background-color: #eee;
    color: #aaa;
    cursor: not-allowed;
  }
  .error-message {
    color: red;
    text-align: center;
    padding: 20px;
    border: 1px solid red;
    background-color: #ffe0e0;
    border-radius: 4px;
    margin-bottom: 20px;
  }

  @media (max-width: 768px) {
    .results-header {
      flex-direction: column;
      align-items: flex-start;
    }
    .filter-container {
      width: 100%;
    }
  }
</style>
