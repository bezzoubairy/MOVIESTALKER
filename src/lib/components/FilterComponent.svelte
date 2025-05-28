<script lang="ts">
  export let options: string[] = [];
  export let selectedOption: string = '';
  export let label: string = 'Filter';
 
  function handleSelect(event: Event) {
    const target = event.target as HTMLSelectElement;
    selectedOption = target.value;
  }
</script>

<div class="filter-component">
  <label for="filter-select">{label}</label>
  <select 
    id="filter-select" 
    bind:value={selectedOption} 
    on:change={handleSelect}
  >
    <option value="">All</option>
    {#each options as option}
      <option value={option}>{option}</option>
    {/each}
  </select>
</div>

<style>
  .filter-component {
    display: flex;
    flex-direction: column;
    gap: 5px;
    margin-bottom: 15px;
  }
  
  label {
    font-size: 0.9rem;
    font-weight: 600;
    color: #555;
  }
  
  select {
    padding: 8px 12px;
    border: 1px solid #ddd;
    border-radius: 4px;
    background-color: white;
    font-size: 0.9rem;
    cursor: pointer;
    transition: border-color 0.2s ease;
  }
  
  select:focus {
    outline: none;
    border-color: #0066cc;
    box-shadow: 0 0 0 2px rgba(0, 102, 204, 0.2);
  }
  
  select:hover {
    border-color: #bbb;
  }
</style>
