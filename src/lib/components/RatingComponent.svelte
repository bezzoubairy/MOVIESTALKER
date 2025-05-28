<script lang="ts">
  import { createEventDispatcher } from 'svelte';
  
  export let maxRating: number = 5;
  export let initialRating: number = 0;
  export let size: 'small' | 'medium' | 'large' = 'medium';
  export let readonly: boolean = false;
  export let label: string = '';
  export let showValue: boolean = true;
  
  
  let rating = initialRating;
  let hoverRating = 0;
  
  
  const dispatch = createEventDispatcher<{
    rate: number;
  }>();
  
  
  $: sizeClass = {
    small: 'rating-small',
    medium: 'rating-medium',
    large: 'rating-large'
  }[size];
  
  
  function handleClick(value: number) {
    if (readonly) return;
    
    rating = value;
    dispatch('rate', rating);
  }
  
 
  function handleMouseEnter(value: number) {
    if (readonly) return;
    hoverRating = value;
  }
  
  
  function handleMouseLeave() {
    if (readonly) return;
    hoverRating = 0;
  }
  
  
  function getDisplayValue(value: number): number {
    return hoverRating > 0 ? hoverRating : rating;
  }
</script>

<div class="rating-component {sizeClass}" class:readonly>
  {#if label}
    <span class="rating-label">{label}</span>
  {/if}
  
  <div class="stars" on:mouseleave={handleMouseLeave}>
    {#each Array(maxRating) as _, i}
      <button 
        type="button"
        class="star"
        class:active={i < getDisplayValue(i + 1)}
        on:click={() => handleClick(i + 1)}
        on:mouseenter={() => handleMouseEnter(i + 1)}
        disabled={readonly}
        aria-label={`Rate ${i + 1} out of ${maxRating}`}
      >
        ★
      </button>
    {/each}
  </div>
  
  {#if showValue && rating > 0}
    <span class="rating-value">{rating}/{maxRating}</span>
  {/if}
</div>

<style>
  .rating-component {
    display: flex;
    align-items: center;
    gap: 10px;
  }
  
  .rating-label {
    font-weight: 500;
    color: #555;
  }
  
  .stars {
    display: flex;
    gap: 2px;
  }
  
  .star {
    background: none;
    border: none;
    cursor: pointer;
    color: #ddd;
    transition: color 0.2s ease;
    padding: 0;
    line-height: 1;
  }
  
  .star:hover {
    color: #ffb700;
  }
  
  .star.active {
    color: #ffb700;
  }
  
  .readonly .star {
    cursor: default;
  }
  
  .rating-value {
    font-size: 0.9rem;
    color: #666;
  }
  
  /* Size variations */
  .rating-small .star {
    font-size: 1rem;
  }
  
  .rating-medium .star {
    font-size: 1.5rem;
  }
  
  .rating-large .star {
    font-size: 2rem;
  }
</style>
