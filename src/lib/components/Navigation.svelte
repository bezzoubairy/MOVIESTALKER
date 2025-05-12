<script lang="ts">
  import { page } from 	"$app/stores";
  import { onMount } from "svelte";

  // Navigation items - base items always visible
  const baseNavItems = [
    { path: "/", label: "Home" },
    { path: "/search", label: "Search" },
    { path: "/favorites", label: "Favorites" },
  ];

  // Mobile menu state
  let mobileMenuOpen = false;

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
    <a href="/" class="logo">MVGRAM</a>

    <button class="mobile-toggle" on:click={toggleMobileMenu} aria-label="Toggle menu">
      <span class="bar"></span>
      <span class="bar"></span>
      <span class="bar"></span>
    </button>

    <ul class="nav-links" class:open={mobileMenuOpen}>
      {#each baseNavItems as item}
        <li>
          <a
            href={item.path}
            class:active={$page.url.pathname === item.path}
            on:click={closeMenu}
          >
            {item.label}
          </a>
        </li>
      {/each}

      {#if $page.data.user}
        <li>
          <a href="/friends" class:active={$page.url.pathname === "/friends"} on:click={closeMenu}>Friends</a>
        </li>
        <li>
          <a href="/profile" class:active={$page.url.pathname === "/profile"} on:click={closeMenu}>Profile</a>
        </li>
        <li>
          <form method="POST" action="/logout" on:submit={closeMenu}>
            <button type="submit" class="logout-button">Logout</button>
          </form>
        </li>
      {:else}
        <li>
          <a href="/login" class:active={$page.url.pathname === "/login"} on:click={closeMenu}>Login</a>
        </li>
        <li>
          <a href="/register" class:active={$page.url.pathname === "/register"} on:click={closeMenu}>Register</a>
        </li>
      {/if}
    </ul>
  </div>
</nav>

<style>
  .navigation {
    background-color: #1a1a2e; /* Dark violet/blue */
    color: white;
    position: sticky;
    top: 0;
    z-index: 1000; 
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
    color: #e0e0e0; /* Lighter violet for logo */
    text-decoration: none;
  }
  .logo:hover {
    color: white;
  }

  .nav-links {
    display: flex;
    align-items: center; 
    list-style: none;
    margin: 0;
    padding: 0;
    gap: 15px; /* Adjusted gap for more links */
  }

  .nav-links a,
  .logout-button {
    color: #e0e0e0; 
    text-decoration: none;
    font-size: 0.95rem; /* Slightly smaller font for more links */
    padding: 8px 10px; /* Adjusted padding */
    border-radius: 4px;
    transition: all 0.2s ease;
    background: none;
    border: none;
    cursor: pointer;
    font-family: inherit; 
  }

  .nav-links a:hover,
  .logout-button:hover {
    color: white;
    background-color: rgba(128, 0, 128, 0.3); /* Violet tint on hover */
  }

  .nav-links a.active {
    color: white;
    background-color: #800080; /* Violet for active link */
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

  @media (max-width: 860px) { /* Adjusted breakpoint for more links */
    .nav-links {
        gap: 10px;
    }
    .nav-links a,
    .logout-button {
        font-size: 0.9rem;
        padding: 6px 8px;
    }
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

    .nav-links a,
    .logout-button {
      display: block;
      padding: 15px;
      border-radius: 0;
      width: 100%; 
      text-align: center;
      font-size: 1rem; /* Reset font size for mobile dropdown */
    }
  }
</style>

