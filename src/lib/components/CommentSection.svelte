<script lang="ts">
  import type { Comment } from "$lib/server/storage";
  import { enhance } from "$app/forms";
  import { invalidateAll } from "$app/navigation";
  
  export let comments: (Comment & { user: { id: string; username: string } })[] = [];
  export let currentUser: { id: string; username: string } | null = null;
  export let movieId: number;
  export let form: any;
  
  let commentContent = "";
  let isSubmitting = false;
  let errorMessage = "";
  

  function handleAddComment() {
    if (!commentContent.trim()) {
      errorMessage = "Comment cannot be empty";
      return;
    }
    
    isSubmitting = true;
    errorMessage = "";
  }
  
  
  function formatDate(date: Date | string): string {
    return new Date(date).toLocaleString();
  }
  

  function isOwnComment(comment: Comment & { user: { id: string; username: string } }): boolean {
    return !!currentUser && comment.user.id === currentUser.id;
  }
  
  // Reset form after successful submission
  $: if (form?.success && form?.type === 'comment' && form?.action === 'added') {
    commentContent = "";
    isSubmitting = false;
  }
</script>

<div class="comments-section">
  <h3>Comments</h3>
  
  {#if currentUser}
    <form 
      method="POST" 
      action="?/addComment" 
      use:enhance={() => {
        return ({ update }) => {
          update({ reset: false });
          invalidateAll();
          isSubmitting = false;
        };
      }}
      on:submit={handleAddComment}
      class="comment-form"
    >
      <textarea
        name="content"
        bind:value={commentContent}
        placeholder="Share your thoughts about this movie..."
        rows="3"
        disabled={isSubmitting}
      ></textarea>
      <button 
        type="submit" 
        class="btn submit-comment" 
        disabled={isSubmitting || !commentContent.trim()}
      >
        {isSubmitting ? 'Posting...' : 'Post Comment'}
      </button>
    </form>
    
    {#if errorMessage}
      <p class="error-message">{errorMessage}</p>
    {/if}
    
    {#if form?.error && form?.type === 'comment'}
      <p class="error-message">{form.error}</p>
    {/if}
  {:else}
    <p class="login-prompt">Please <a href="/login">log in</a> to leave a comment.</p>
  {/if}
  
  <div class="comments-list">
    {#if comments.length === 0}
      <p class="no-comments">No comments yet. Be the first to share your thoughts!</p>
    {:else}
      {#each comments as comment (comment.id)}
        <div class="comment">
          <div class="comment-header">
            <span class="username">{comment.user.username}</span>
            <span class="date">{formatDate(comment.createdAt)}</span>
          </div>
          <div class="comment-content">
            {comment.content}
          </div>
          {#if isOwnComment(comment)}
            <form 
              method="POST" 
              action="?/deleteComment" 
              use:enhance={() => {
                return ({ update }) => {
                  update({ reset: false });
                  invalidateAll();
                };
              }}
              class="delete-form"
            >
              <input type="hidden" name="commentId" value={comment.id} />
              <button type="submit" class="btn delete-comment">Delete</button>
            </form>
          {/if}
        </div>
      {/each}
    {/if}
  </div>
</div>

<style>
  .comments-section {
    margin-top: 30px;
    padding-top: 20px;
    border-top: 1px solid #eee;
  }
  
  h3 {
    font-size: 1.3rem;
    margin-bottom: 20px;
  }
  
  .comment-form {
    margin-bottom: 20px;
  }
  
  textarea {
    width: 100%;
    padding: 12px;
    border: 1px solid #ddd;
    border-radius: 4px;
    font-family: inherit;
    font-size: 1rem;
    margin-bottom: 10px;
    resize: vertical;
  }
  
  .btn {
    padding: 10px 20px;
    border: none;
    border-radius: 4px;
    cursor: pointer;
    font-size: 1rem;
    transition: all 0.2s ease;
  }
  
  .submit-comment {
    background-color: #0066cc;
    color: white;
  }
  
  .submit-comment:hover {
    background-color: #0055aa;
  }
  
  .submit-comment:disabled {
    background-color: #cccccc;
    cursor: not-allowed;
  }
  
  .error-message {
    color: #e74c3c;
    margin: 10px 0;
    padding: 8px;
    background-color: #fdeaea;
    border-radius: 4px;
  }
  
  .login-prompt {
    margin-bottom: 20px;
    padding: 15px;
    background-color: #f8f9fa;
    border-radius: 4px;
    text-align: center;
  }
  
  .login-prompt a {
    color: #0066cc;
    text-decoration: none;
    font-weight: bold;
  }
  
  .login-prompt a:hover {
    text-decoration: underline;
  }
  
  .comments-list {
    margin-top: 20px;
  }
  
  .no-comments {
    color: #666;
    font-style: italic;
    text-align: center;
    padding: 20px;
    background-color: #f8f9fa;
    border-radius: 4px;
  }
  
  .comment {
    padding: 15px;
    border: 1px solid #eee;
    border-radius: 4px;
    margin-bottom: 15px;
    background-color: #fff;
    box-shadow: 0 1px 3px rgba(0, 0, 0, 0.05);
  }
  
  .comment-header {
    display: flex;
    justify-content: space-between;
    margin-bottom: 10px;
    font-size: 0.9rem;
  }
  
  .username {
    font-weight: bold;
    color: #0066cc;
  }
  
  .date {
    color: #666;
  }
  
  .comment-content {
    line-height: 1.5;
    margin-bottom: 10px;
    word-break: break-word;
  }
  
  .delete-form {
    text-align: right;
  }
  
  .delete-comment {
    background-color: #f8f8f8;
    color: #e74c3c;
    border: 1px solid #ddd;
    padding: 5px 10px;
    font-size: 0.8rem;
  }
  
  .delete-comment:hover {
    background-color: #e74c3c;
    color: white;
    border-color: #e74c3c;
  }
  
  @media (max-width: 768px) {
    .comment-header {
      flex-direction: column;
    }
    
    .date {
      margin-top: 5px;
      font-size: 0.8rem;
    }
  }
</style>
