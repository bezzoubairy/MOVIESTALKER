<script lang="ts">
  import { createEventDispatcher } from 'svelte';
  
  export let placeholder: string = 'Search for movies...';
  export let value: string = '';
  export let autofocus: boolean = false;
  
  const dispatch = createEventDispatcher<{
    search: string;
    input: string;
    clear: void;
  }>();
  
  function handleInput(event: Event) {
    const target = event.target as HTMLInputElement;
    value = target.value;
    dispatch('input', value);
  }
  
  function handleSubmit(event: Event) {
    event.preventDefault();
    if (value.trim()) {
      dispatch('search', value);
    }
  }
  
  function clearSearch() {
    value = '';
    dispatch('clear');
    dispatch('input', '');
  }
</script>

<form class="search-bar" on:submit={handleSubmit}>
  <div class="search-input-container">
    <input
      type="text"
      class="search-input"
      {placeholder}
      bind:value
      on:input={handleInput}
      autocomplete="off"
      {autofocus}
    />
    
    {#if value}
      <button 
        type="button" 
        class="clear-button" 
        on:click={clearSearch}
        aria-label="Clear search"
      >
        ✕
      </button>
    {/if}
  </div>
  
  <button type="submit" class="search-button" disabled={!value.trim()}>
    Search
  </button>
</form>

<style>
  .search-bar {
    display: flex;
    width: 100%;
    max-width: 600px;
    margin: 0 auto 20px;
    gap: 10px;
  }
  
  .search-input-container {
    position: relative;
    flex: 1;
  }
  
  .search-input {
    width: 100%;
    padding: 12px 40px 12px 16px;
    border: 2px solid #ddd;
    border-radius: 8px;
    font-size: 1rem;
    transition: border-color 0.2s ease;
  }
  
  .search-input:focus {
    outline: none;
    border-color: #0066cc;
    box-shadow: 0 0 0 3px rgba(0, 102, 204, 0.2);
  }
  
  .clear-button {
    position: absolute;
    right: 12px;
    top: 50%;
    transform: translateY(-50%);
    background: none;
    border: none;
    color: #999;
    cursor: pointer;
    font-size: 1rem;
    padding: 4px;
    border-radius: 50%;
  }
  
  .clear-button:hover {
    color: #666;
    background-color: #f0f0f0;
  }
  
  .search-button {
    padding: 0 20px;
    background-color: #0066cc;
    color: white;
    border: none;
    border-radius: 8px;
    font-size: 1rem;
    cursor: pointer;
    transition: background-color 0.2s ease;
  }
  
  .search-button:hover {
    background-color: #0055aa;
  }
  
  .search-button:disabled {
    background-color: #ccc;
    cursor: not-allowed;
  }
  
  @media (max-width: 480px) {
    .search-bar {
      flex-direction: column;
    }
    
    .search-button {
      width: 100%;
      padding: 12px;
    }
  }
</style>
