<script lang="ts">
  import { onMount } from 'svelte';
  import { page } from '$app/stores';
  import MovieList from '$lib/components/MovieList.svelte';
  import SearchBar from '$lib/components/SearchBar.svelte';
  import FilterComponent from '$lib/components/FilterComponent.svelte';
  import { searchMovies } from '$lib/services/tmdb';
  import { searchResults, searchQuery, isSearching } from '$lib/stores';
  
  let query = '';
  let currentPage = 1;
  let totalPages = 0;
  let genreFilter = '';
  
  // Genre options for filtering
  const genreOptions = [
    'Action', 'Adventure', 'Animation', 'Comedy', 'Crime', 
    'Documentary', 'Drama', 'Family', 'Fantasy', 'History',
    'Horror', 'Music', 'Mystery', 'Romance', 'Science Fiction',
    'Thriller', 'War', 'Western'
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
  
  // Get query from URL on mount
  onMount(() => {
    const urlQuery = $page.url.searchParams.get('q');
    if (urlQuery) {
      query = urlQuery;
      searchQuery.set(query);
      performSearch(query);
    }
  });
  
  // Perform search
  async function performSearch(searchTerm: string, page = 1) {
    if (!searchTerm.trim()) return;
    
    try {
      isSearching.set(true);
      const response = await searchMovies(searchTerm, page);
      searchResults.set(response.results);
      totalPages = response.total_pages;
      currentPage = response.page;
    } catch (error) {
      console.error('Error searching movies:', error);
    } finally {
      isSearching.set(false);
    }
  }
  
  // Handle search submission
  function handleSearch(event: CustomEvent<string>) {
    const searchTerm = event.detail;
    if (searchTerm.trim()) {
      query = searchTerm;
      searchQuery.set(query);
      
      // Update URL without reloading page
      const url = new URL(window.location.href);
      url.searchParams.set('q', query);
      window.history.pushState({}, '', url);
      
      performSearch(query);
    }
  }
  
  // Filter results by genre
  $: filteredResults = genreFilter 
    ? $searchResults.filter(movie => 
        movie.genre_ids.includes(genreMap[genreFilter as keyof typeof genreMap])
      )
    : $searchResults;
  
  // Handle genre filter change
  function handleGenreChange() {
    // No need to do anything here as the reactive statement will handle filtering
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
      bind:value={query}
      on:search={handleSearch}
      autofocus={true}
    />
  </div>
  
  {#if query}
    <div class="results-header">
      <h2>Results for "{query}"</h2>
      
      {#if $searchResults.length > 0}
        <div class="filter-container">
          <FilterComponent 
            options={genreOptions} 
            bind:selectedOption={genreFilter}
            label="Filter by genre"
            on:change={handleGenreChange}
          />
        </div>
      {/if}
    </div>
    
    <MovieList 
      movies={filteredResults} 
      loading={$isSearching}
      emptyMessage="No movies found matching your search."
      columns={4}
    />
  {:else}
    <div class="empty-state">
      <p>Enter a movie title to search</p>
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
    width: 200px;
  }
  
  .empty-state {
    text-align: center;
    padding: 60px 0;
    color: #666;
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
