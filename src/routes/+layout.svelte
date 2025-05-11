<script lang="ts">
  import { onMount } from "svelte";
  import Navigation from "$lib/components/Navigation.svelte";
  import {
    watchlistMovies,
    favoriteMovies,
    recentlyViewedMovies,
    isLoadingCollections,
  } from "$lib/stores";
  import type { LayoutData } from "./$types"; // Import LayoutData type

  export let data: LayoutData; // Receive data from +layout.server.ts

  // Initialize stores with data from the server
  $: {
    if (data && !data.error) {
      watchlistMovies.set(data.watchlist || []);
      favoriteMovies.set(data.favorites || []);
      recentlyViewedMovies.set(data.recentlyViewed || []);
      isLoadingCollections.set(false); // Assuming data loading is complete here
    } else if (data && data.error) {
      console.error("Error loading collections:", data.error);
      isLoadingCollections.set(false);
      // Optionally, set an error state in a store to display to the user
    }
  }

  // onMount is no longer needed for initial data load as it's handled by server load
  // However, if there are client-side specific initializations, they can remain.
</script>

<div class="app">
  <Navigation />

  <main>
    <slot />
  </main>

  <footer>
    <div class="container">
      <p>
        Movie Tracker &copy; {new Date().getFullYear()} | Data provided by
        <a
          href="https://www.themoviedb.org"
          target="_blank"
          rel="noopener noreferrer"
          >TMDB</a
        >
      </p>
    </div>
  </footer>
</div>

<style>
  :global(body) {
    margin: 0;
    padding: 0;
    font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Oxygen,
      Ubuntu, Cantarell, "Open Sans", "Helvetica Neue", sans-serif;
    background-color: #f8f9fa;
    color: #333;
    line-height: 1.6;
  }

  :global(*) {
    box-sizing: border-box;
  }

  .app {
    display: flex;
    flex-direction: column;
    min-height: 100vh;
  }

  main {
    flex: 1;
    padding: 20px;
    max-width: 1200px;
    margin: 0 auto;
    width: 100%;
  }

  footer {
    background-color: #1a1a2e;
    color: #fff;
    padding: 20px 0;
    margin-top: 40px;
  }

  .container {
    max-width: 1200px;
    margin: 0 auto;
    padding: 0 20px;
  }

  footer a {
    color: #4dabf7;
    text-decoration: none;
  }

  footer a:hover {
    text-decoration: underline;
  }
</style>
