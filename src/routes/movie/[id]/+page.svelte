<script lang="ts">
  import type { PageData, ActionData } from "./$types";
  import MovieDetails from "$lib/components/MovieDetails.svelte";
  import MovieList from "$lib/components/MovieList.svelte";

  export let data: PageData;
  export let form: ActionData;

  $: movie = data.movie;
  $: initialInFavorites = data.inFavorites;
  $: recommendedMovies = data.recommendedMovies || [];
  $: error = data.error;

  let currentInFavorites: boolean | undefined = initialInFavorites;
  let currentUserRating: number | null | undefined = movie?.userRating;
  let currentUserNotes: string | undefined = movie?.userNotes;

  $: if (form?.success && form?.type === "favorite") {
    currentInFavorites = form.action === "added";
  }
  $: if (form?.success && form?.message === "User data updated.") {
    // For rating/notes, could re-fetch or rely on form data if returned
  }

  $: {
    currentInFavorites = data.inFavorites;
    if (data.movie) {
        currentUserRating = data.movie.userRating;
        currentUserNotes = data.movie.userNotes;
    }
  }

</script>

<svelte:head>
  <title>{movie ? movie.title + " - Movie Tracker" : "Movie Details - Movie Tracker"}</title>
</svelte:head>

<div class="movie-page">
  {#if error}
    <div class="error-display">
      <h2>Error</h2>
      <p>{error}</p>
      <a href="/" class="btn">Back to Home</a>
    </div>
  {:else if movie}
    <MovieDetails 
      bind:movie={movie} 
      bind:isInFavorites={currentInFavorites}
      bind:userRating={currentUserRating}
      bind:userNotes={currentUserNotes}
      pageForm={form} 
    />

    {#if recommendedMovies.length > 0}
      <div class="recommendations">
        <h2>You Might Also Like</h2>
        <MovieList 
          movies={recommendedMovies} 
          columns={4} 
          showControls={true} 
        />
      </div>
    {/if}
  {:else}
    <div class="loading">
      <div class="spinner"></div>
      <p>Loading movie details...</p> 
    </div>
  {/if}
</div>

<style>
  .movie-page {
    padding-top: 20px;
  }
  .loading,
  .error-display {
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    padding: 60px 20px;
    text-align: center;
  }
  .spinner {
    width: 50px;
    height: 50px;
    border: 5px solid rgba(0, 0, 0, 0.1);
    border-radius: 50%;
    border-top-color: #0066cc;
    animation: spin 1s ease-in-out infinite;
    margin-bottom: 20px;
  }
  @keyframes spin {
    to {
      transform: rotate(360deg);
    }
  }
  .error-display h2 {
    color: #e74c3c;
    margin-bottom: 10px;
  }
  .btn {
    display: inline-block;
    padding: 10px 20px;
    background-color: #0066cc;
    color: white;
    text-decoration: none;
    border-radius: 4px;
    margin-top: 20px;
    transition: background-color 0.2s ease;
  }
  .btn:hover {
    background-color: #0055aa;
  }
  .recommendations {
    margin-top: 40px;
  }
  .recommendations h2 {
    font-size: 1.5rem;
    margin-bottom: 20px;
    font-weight: 600;
    color: #333;
    border-bottom: 2px solid #eee;
    padding-bottom: 10px;
  }
</style>

