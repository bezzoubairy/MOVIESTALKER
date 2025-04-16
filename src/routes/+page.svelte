<script lang="ts">
  import { onMount } from 'svelte';
  import MovieList from '$lib/components/MovieList.svelte';
  import SearchBar from '$lib/components/SearchBar.svelte';
  import { getPopularMovies } from '$lib/services/tmdb';
  import { popularMovies, isLoadingPopular, recentlyViewedMovies } from '$lib/stores';
  
  let searchQuery = '';
  
  // Load popular movies on mount
  onMount(async () => {
    if ($popularMovies.length === 0) {
      try {
        isLoadingPopular.set(true);
        const response = await getPopularMovies();
        popularMovies.set(response.results);
      } catch (error) {
        console.error('Error fetching popular movies:', error);
      } finally {
        isLoadingPopular.set(false);
      }
    }
  });
  
  // Handle search
  function handleSearch(event: CustomEvent<string>) {
    const query = event.detail;
    if (query.trim()) {
      window.location.href = `/search?q=${encodeURIComponent(query)}`;
    }
  }
</script>

<svelte:head>
  <title>Movie Tracker - Home</title>
</svelte:head>

<div class="home-page">
  <section class="hero">
    <div class="hero-content">
      <h1>Track Your Favorite Movies</h1>
      <p>Discover new films, keep track of what you want to watch, and rate movies you've seen.</p>
      
      <div class="search-container">
        <SearchBar 
          placeholder="Search for movies..." 
          bind:value={searchQuery}
          on:search={handleSearch}
          autofocus={true}
        />
      </div>
    </div>
  </section>
  
  {#if $recentlyViewedMovies.length > 0}
    <MovieList 
      movies={$recentlyViewedMovies} 
      title="Recently Viewed" 
      columns={4}
    />
  {/if}
  
  <MovieList 
    movies={$popularMovies} 
    title="Popular Movies" 
    loading={$isLoadingPopular}
    columns={4}
  />
</div>

<style>
  .home-page {
    padding-top: 20px;
  }
  
  .hero {
    background-color: #1a1a2e;
    color: white;
    padding: 60px 20px;
    border-radius: 10px;
    margin-bottom: 40px;
    background-image: linear-gradient(rgba(0, 0, 0, 0.7), rgba(0, 0, 0, 0.7)), 
                      url('https://image.tmdb.org/t/p/original/wwemzKWzjKYJFfCeiB57q3r4Bcm.png');
    background-size: cover;
    background-position: center;
  }
  
  .hero-content {
    max-width: 800px;
    margin: 0 auto;
    text-align: center;
  }
  
  h1 {
    font-size: 2.5rem;
    margin-bottom: 15px;
  }
  
  p {
    font-size: 1.2rem;
    margin-bottom: 30px;
    opacity: 0.9;
  }
  
  .search-container {
    max-width: 600px;
    margin: 0 auto;
  }
  
  @media (max-width: 768px) {
    .hero {
      padding: 40px 20px;
    }
    
    h1 {
      font-size: 2rem;
    }
    
    p {
      font-size: 1rem;
    }
  }
</style>
