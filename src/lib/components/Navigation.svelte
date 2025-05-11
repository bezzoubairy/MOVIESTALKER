<script lang="ts">
  import { page } from '$app/stores';
  import { onMount } from 'svelte';
  
  export let activeRoute: string = '/';
  
  // Navigation items
  const navItems = [
    { path: '/', label: 'Home' },
    { path: '/search', label: 'Search' },
    // { path: '/watchlist', label: 'Watchlist' }, // Watchlist removed
    { path: '/favorites', label: 'Favorites' }
  ];
  
  // Mobile menu state
  let mobileMenuOpen = false;
  
  // Update active route based on current page
  onMount(() => {
    activeRoute = $page.url.pathname;
  });
  
  $: {
    activeRoute = $page.url.pathname;
  }
  
  // Toggle mobile menu
  function toggleMobileMenu() {
    mobileMenuOpen = !mobileMenuOpen;
  }
  
  // Close mobile menu when clicking a link
  function closeMenu() {
    mobileMenuOpen = false;
  }
</script>

<nav class="navigation">
  <div class="container">
    <a href="/" class="logo">MovieTracker</a>
    
    <button class="mobile-toggle" on:click={toggleMobileMenu} aria-label="Toggle menu">
      <span class="bar"></span>
      <span class="bar"></span>
      <span class="bar"></span>
    </button>
    
    <ul class="nav-links" class:open={mobileMenuOpen}>
      {#each navItems as item}
        <li>
          <a 
            href={item.path} 
            class:active={activeRoute === item.path}
            on:click={closeMenu}
          >
            {item.label}
          </a>
        </li>
      {/each}
    </ul>
  </div>
</nav>

<style>
  .navigation {
    background-color: #1a1a2e;
    color: white;
    position: sticky;
    top: 0;
    z-index: 100;
    box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
  }
  
  .container {
    max-width: 1200px;
    margin: 0 auto;
    padding: 0 20px;
    display: flex;
    justify-content: space-between;
    align-items: center;
    height: 70px;
  }
  
  .logo {
    font-size: 1.5rem;
    font-weight: bold;
    color: white;
    text-decoration: none;
  }
  
  .nav-links {
    display: flex;
    list-style: none;
    margin: 0;
    padding: 0;
    gap: 20px;
  }
  
  .nav-links a {
    color: #e0e0e0;
    text-decoration: none;
    font-size: 1rem;
    padding: 8px 12px;
    border-radius: 4px;
    transition: all 0.2s ease;
  }
  
  .nav-links a:hover {
    color: white;
    background-color: rgba(255, 255, 255, 0.1);
  }
  
  .nav-links a.active {
    color: white;
    background-color: #0066cc;
  }
  
  .mobile-toggle {
    display: none;
    background: none;
    border: none;
    cursor: pointer;
    padding: 10px;
  }
  
  .bar {
    display: block;
    width: 25px;
    height: 3px;
    margin: 5px auto;
    background-color: white;
    transition: all 0.3s ease;
  }
  
  @media (max-width: 768px) {
    .mobile-toggle {
      display: block;
    }
    
    .nav-links {
      position: fixed;
      left: -100%;
      top: 70px;
      flex-direction: column;
      background-color: #1a1a2e;
      width: 100%;
      text-align: center;
      transition: 0.3s;
      box-shadow: 0 10px 10px rgba(0, 0, 0, 0.1);
      padding: 20px 0;
      gap: 0;
    }
    
    .nav-links.open {
      left: 0;
    }
    
    .nav-links li {
      margin: 0;
      width: 100%;
    }
    
    .nav-links a {
      display: block;
      padding: 15px;
      border-radius: 0;
    }
  }
</style>
