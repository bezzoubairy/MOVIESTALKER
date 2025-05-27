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
  
  // Format numbers with commas
  const formatNumber = (num: number): string => {
    return num.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",");
  };
</script>

<div class="container profile-page">
  <h1>User Profile</h1>

  {#if data.currentUser}
    <div class="profile-grid">
      <div class="profile-details card">
        <div class="profile-header">
          <div class="avatar">{data.currentUser.username.charAt(0).toUpperCase()}</div>
          <h2>Welcome, {data.currentUser.username}!</h2>
        </div>
        <div class="profile-info">
          <p><strong>Email:</strong> {data.currentUser.email}</p>
          <p><strong>Joined MVGRAM on:</strong> {formatDate(data.currentUser.createdAt)}</p>
        </div>
        
        <div class="stats-grid">
          <div class="stat-card">
            <div class="stat-value">{data.stats?.favoriteCount || 0}</div>
            <div class="stat-label">Favorites</div>
          </div>
          <div class="stat-card">
            <div class="stat-value">{data.stats?.recentlyViewedCount || 0}</div>
            <div class="stat-label">Viewed</div>
          </div>
          <div class="stat-card">
            <div class="stat-value">{data.stats?.commentCount || 0}</div>
            <div class="stat-label">Comments</div>
          </div>
          <div class="stat-card">
            <div class="stat-value">{data.stats?.ratingCount || 0}</div>
            <div class="stat-label">Ratings</div>
          </div>
        </div>
      </div>

      <div class="friends-list card">
        <h3>Your Friends ({data.friends?.length ?? 0})</h3>
        {#if data.friends && data.friends.length > 0}
          <ul>
            {#each data.friends as friend}
              <li>
                <div class="friend-avatar">{friend.username.charAt(0).toUpperCase()}</div>
                <span class="friend-name">{friend.username}</span>
              </li>
            {/each}
          </ul>
        {:else}
          <p class="empty-state">You haven't added any friends yet. <a href="/friends">Find friends</a></p>
        {/if}
      </div>
    </div>
    
    <div class="activity-section">
      <h3>Recent Activity</h3>
      
      <div class="activity-grid">
        <div class="recent-favorites card">
          <h4>Recently Favorited Movies</h4>
          {#if data.activity?.recentFavorites && data.activity.recentFavorites.length > 0}
            <ul class="activity-list">
              {#each data.activity.recentFavorites as favorite}
                <li>
                  <a href="/movie/{favorite.movie.id}" class="activity-item">
                    <span class="movie-title">{favorite.movie.title}</span>
                    <span class="activity-date">{formatDate(favorite.dateAdded)}</span>
                  </a>
                </li>
              {/each}
            </ul>
          {:else}
            <p class="empty-state">No favorites yet. <a href="/">Discover movies</a> to add to your favorites!</p>
          {/if}
        </div>
        
        <div class="recent-comments card">
          <h4>Recent Comments</h4>
          {#if data.activity?.recentComments && data.activity.recentComments.length > 0}
            <ul class="activity-list">
              {#each data.activity.recentComments as comment}
                <li>
                  <a href="/movie/{comment.movie.id}" class="activity-item">
                    <div>
                      <span class="movie-title">{comment.movie.title}</span>
                      <p class="comment-content">"{comment.content.length > 60 ? comment.content.substring(0, 60) + '...' : comment.content}"</p>
                    </div>
                    <span class="activity-date">{formatDate(comment.createdAt)}</span>
                  </a>
                </li>
              {/each}
            </ul>
          {:else}
            <p class="empty-state">No comments yet. Share your thoughts on movies you've watched!</p>
          {/if}
        </div>
      </div>
    </div>
    
  {:else if data.error}
    <p class="error-message">{data.error}</p>
  {:else}
    <div class="login-prompt card">
      <h3>Please Log In</h3>
      <p>You need to be logged in to view your profile.</p>
      <a href="/login" class="btn login-btn">Log In</a>
    </div>
  {/if}
</div>

<style>
  .profile-page {
    padding-top: 2rem;
    padding-bottom: 2rem;
    max-width: 1200px;
    margin: 0 auto;
  }
  
  h1 {
    margin-bottom: 1.5rem;
    color: #333;
    font-size: 2rem;
  }
  
  .profile-grid {
    display: grid;
    grid-template-columns: 2fr 1fr;
    gap: 1.5rem;
    margin-bottom: 2rem;
  }
  
  .profile-header {
    display: flex;
    align-items: center;
    margin-bottom: 1.5rem;
  }
  
  .avatar {
    width: 60px;
    height: 60px;
    border-radius: 50%;
    background-color: #6200ee;
    color: white;
    display: flex;
    align-items: center;
    justify-content: center;
    font-size: 1.8rem;
    font-weight: bold;
    margin-right: 1rem;
  }
  
  .friend-avatar {
    width: 36px;
    height: 36px;
    border-radius: 50%;
    background-color: #03dac6;
    color: white;
    display: flex;
    align-items: center;
    justify-content: center;
    font-size: 1rem;
    font-weight: bold;
    margin-right: 0.75rem;
  }
  
  .profile-details h2 {
    margin: 0;
    color: #333;
    font-size: 1.5rem;
  }
  
  .profile-info {
    margin-bottom: 1.5rem;
  }
  
  .profile-details p {
    margin-bottom: 0.75rem;
    font-size: 1rem;
    color: #555;
  }
  
  .profile-details p strong {
    color: #6200ee;
    font-weight: 600;
  }
  
  .stats-grid {
    display: grid;
    grid-template-columns: repeat(4, 1fr);
    gap: 1rem;
    margin-top: 1.5rem;
  }
  
  .stat-card {
    background-color: #f5f5f5;
    border-radius: 8px;
    padding: 1rem;
    text-align: center;
    box-shadow: 0 2px 4px rgba(0, 0, 0, 0.05);
    transition: transform 0.2s ease, box-shadow 0.2s ease;
  }
  
  .stat-card:hover {
    transform: translateY(-3px);
    box-shadow: 0 4px 8px rgba(0, 0, 0, 0.1);
  }
  
  .stat-value {
    font-size: 1.8rem;
    font-weight: bold;
    color: #6200ee;
    margin-bottom: 0.25rem;
  }
  
  .stat-label {
    font-size: 0.9rem;
    color: #666;
  }
  
  .friends-list h3 {
    color: #333;
    border-bottom: 1px solid #eee;
    padding-bottom: 0.75rem;
    margin-top: 0;
    margin-bottom: 1rem;
    font-size: 1.25rem;
  }
  
  .friends-list ul {
    list-style-type: none;
    padding-left: 0;
    margin: 0;
  }
  
  .friends-list li {
    padding: 0.75rem 0;
    border-bottom: 1px solid #eee;
    display: flex;
    align-items: center;
  }
  
  .friends-list li:last-child {
    border-bottom: none;
  }
  
  .friend-name {
    font-size: 1rem;
    color: #333;
  }
  
  .activity-section h3 {
    margin-bottom: 1rem;
    color: #333;
    font-size: 1.5rem;
  }
  
  .activity-grid {
    display: grid;
    grid-template-columns: 1fr 1fr;
    gap: 1.5rem;
  }
  
  .recent-favorites h4,
  .recent-comments h4 {
    margin-top: 0;
    margin-bottom: 1rem;
    color: #333;
    font-size: 1.1rem;
    border-bottom: 1px solid #eee;
    padding-bottom: 0.5rem;
  }
  
  .activity-list {
    list-style-type: none;
    padding-left: 0;
    margin: 0;
  }
  
  .activity-list li {
    border-bottom: 1px solid #eee;
  }
  
  .activity-list li:last-child {
    border-bottom: none;
  }
  
  .activity-item {
    display: flex;
    justify-content: space-between;
    align-items: flex-start;
    padding: 0.75rem 0;
    text-decoration: none;
    color: inherit;
    transition: background-color 0.2s ease;
  }
  
  .activity-item:hover {
    background-color: #f9f9f9;
  }
  
  .movie-title {
    font-weight: 600;
    color: #6200ee;
    display: block;
    margin-bottom: 0.25rem;
  }
  
  .comment-content {
    font-size: 0.9rem;
    color: #666;
    margin: 0.25rem 0 0 0;
    font-style: italic;
  }
  
  .activity-date {
    font-size: 0.8rem;
    color: #999;
    white-space: nowrap;
    margin-left: 1rem;
  }
  
  .card {
    background-color: white;
    border-radius: 8px;
    padding: 1.5rem;
    box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
  }
  
  .empty-state {
    color: #666;
    font-style: italic;
    padding: 1rem 0;
    text-align: center;
  }
  
  .empty-state a {
    color: #6200ee;
    text-decoration: none;
    font-weight: 600;
  }
  
  .empty-state a:hover {
    text-decoration: underline;
  }
  
  .error-message {
    color: #d32f2f;
    background-color: #ffebee;
    padding: 1rem;
    border-radius: 8px;
    text-align: center;
  }
  
  .login-prompt {
    text-align: center;
    padding: 2rem;
  }
  
  .login-prompt h3 {
    margin-top: 0;
    color: #333;
  }
  
  .login-btn {
    display: inline-block;
    background-color: #6200ee;
    color: white;
    padding: 0.75rem 2rem;
    border-radius: 4px;
    text-decoration: none;
    font-weight: 600;
    margin-top: 1rem;
    transition: background-color 0.2s ease;
  }
  
  .login-btn:hover {
    background-color: #5000ca;
  }
  
  @media (max-width: 768px) {
    .profile-grid {
      grid-template-columns: 1fr;
    }
    
    .activity-grid {
      grid-template-columns: 1fr;
    }
    
    .stats-grid {
      grid-template-columns: repeat(2, 1fr);
    }
  }
  
  @media (max-width: 480px) {
    .profile-header {
      flex-direction: column;
      text-align: center;
    }
    
    .avatar {
      margin-right: 0;
      margin-bottom: 1rem;
    }
    
    .activity-item {
      flex-direction: column;
    }
    
    .activity-date {
      margin-left: 0;
      margin-top: 0.5rem;
    }
  }
</style>
