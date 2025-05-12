<script lang="ts">
  import type { PageData } from "./$types";
  export let data: PageData;

  const formatDate = (dateString: string | Date | undefined) => {
    if (!dateString) return "N/A";
    return new Date(dateString).toLocaleDateString(undefined, {
      year: "numeric",
      month: "long",
      day: "numeric",
    });
  };
</script>

<div class="container profile-page">
  <h1>User Profile</h1>

  {#if data.currentUser}
    <div class="profile-details card">
      <h2>Welcome, {data.currentUser.username}!</h2>
      <p><strong>Email:</strong> {data.currentUser.email}</p>
      <p><strong>Joined MVGRAM on:</strong> {formatDate(data.currentUser.createdAt)}</p>
    </div>

    <div class="friends-list card">
      <h3>Your Friends ({data.friends?.length ?? 0})</h3>
      {#if data.friends && data.friends.length > 0}
        <ul>
          {#each data.friends as friend}
            <li>{friend.username}</li>
          {/each}
        </ul>
      {:else}
        <p>You haven't added any friends yet. <a href="/friends">Find friends</a></p>
      {/if}
    </div>
    
  {:else if data.error}
    <p class="error-message">{data.error}</p>
  {:else}
    <p>Loading profile data or not logged in...</p>
    <p><a href="/login">Please login to view your profile.</a></p>
  {/if}
</div>

<style>
  .profile-page {
    padding-top: 2rem;
    padding-bottom: 2rem;
  }

  .profile-details h2 {
    margin-top: 0;
    color: var(--accent-violet);
    border-bottom: none; /* Assuming h2 in global.css might have a border */
  }

  .profile-details p,
  .friends-list p,
  .friends-list li {
    margin-bottom: 0.75rem;
    font-size: 1.1rem;
    color: var(--medium-violet-text);
  }

  .profile-details p strong {
    color: var(--light-violet);
  }

  .friends-list h3 {
    color: var(--accent-violet);
    border-bottom: 1px solid var(--border-color);
    padding-bottom: 0.5rem;
    margin-top: 0;
  }
  
  .friends-list ul {
    list-style-type: none;
    padding-left: 0;
  }

  .friends-list li {
    padding: 0.5rem 0;
    border-bottom: 1px solid var(--border-color-light, #333);
  }
  .friends-list li:last-child {
    border-bottom: none;
  }

  .card {
    /* General card styling is in global.css */
    margin-bottom: 2rem;
  }
</style>

