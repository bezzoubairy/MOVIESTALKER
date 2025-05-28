<script lang="ts">
  import type { ActionData } from './$types';
  export let form: ActionData;
</script>

<div class="container">
  <h1>Login</h1>

  {#if form?.error}
    <p class="error">{form.error}</p>
  {/if}

  <form method="POST" action="?/login">
    <div>
      <label for="username">Username or Email</label>
      <input type="text" id="username" name="username" required value={form?.username || ''} />
    </div>
    <div>
      <label for="password">Password</label>
      <input type="password" id="password" name="password" required />
    </div>
    <button type="submit">Login</button>
  </form>

  <p class="register-link">
    Don't have an account? <a href="/register">Register here</a>
  </p>
</div>

<style>
  .container {
    max-width: 500px;
    margin: 2rem auto;
    padding: 2rem;
    
    background-color: var(--secondary-bg, #1a1a2e); /* Default if theme not loaded */
    border: 1px solid var(--border-color, #4a4a70);
    border-radius: 8px;
  }
  h1 {
    text-align: center;
    margin-bottom: 1.5rem;
    color: var(--light-violet, #e0e0e0);
  }
  label {
    display: block;
    margin-bottom: 0.5rem;
    color: var(--medium-violet-text, #b0b0d0);
  }

  .error {
  
    color: var(--error-color, red);
    background-color: rgba(255, 107, 107, 0.1);
    padding: 0.75rem;
    border-radius: 4px;
    margin-bottom: 1rem;
    text-align: center;
    border: 1px solid var(--error-color, red);
  }
  .register-link {
    text-align: center;
    margin-top: 1.5rem;
  }
  .register-link a {
    color: var(--accent-violet, #800080);
    text-decoration: underline;
  }
  .register-link a:hover {
    color: var(--light-violet, #e0e0e0);
  }
</style>

