<script lang="ts">
  import { onMount } from 'svelte';
  import Navigation from '$lib/components/Navigation.svelte';
  import { loadUserCollections } from '$lib/stores';
  
  // Load user collections on mount
  onMount(() => {
    loadUserCollections();
  });
</script>

<div class="app">
  <Navigation />
  
  <main>
    <slot />
  </main>
  
  <footer>
    <div class="container">
      <p>Movie Tracker &copy; {new Date().getFullYear()} | Data provided by <a href="https://www.themoviedb.org" target="_blank" rel="noopener noreferrer">TMDB</a></p>
    </div>
  </footer>
</div>

<style>
  :global(body) {
    margin: 0;
    padding: 0;
    font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Oxygen, Ubuntu, Cantarell, 'Open Sans', 'Helvetica Neue', sans-serif;
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
