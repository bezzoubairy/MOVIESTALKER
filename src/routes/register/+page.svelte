<script lang="ts">
  import type { ActionData } from './$types';
  export let form: ActionData;
</script>

<div class="container">
  <h1>Register</h1>

  {#if form?.error}
    <p class="error">{form.error}</p>
  {/if}
  {#if form?.success}
    <p class="success">Registration successful! You can now log in.</p>
  {/if}

  <form method="POST" action="?/register">
    <div>
      <label for="username">Username</label>
      <input type="text" id="username" name="username" required value={form?.username || ''} />
    </div>
    <div>
      <label for="email">Email</label>
      <input type="email" id="email" name="email" required value={form?.email || ''} />
    </div>
    <div>
      <label for="password">Password</label>
      <input type="password" id="password" name="password" required />
    </div>
    <button type="submit">Register</button>
  </form>
</div>

<style>
  .container {
    max-width: 500px;
    margin: 2rem auto;
    padding: 2rem;
    border: 1px solid #ccc;
    border-radius: 8px;
  }
  h1 {
    text-align: center;
    margin-bottom: 1.5rem;
  }
  label {
    display: block;
    margin-bottom: 0.5rem;
  }
  input[type="text"],
  input[type="email"],
  input[type="password"] {
    width: 100%;
    padding: 0.75rem;
    margin-bottom: 1rem;
    border: 1px solid #ddd;
    border-radius: 4px;
    box-sizing: border-box;
  }
  button[type="submit"] {
    width: 100%;
    padding: 0.75rem;
    background-color: #5a5a5a; 
    color: white;
    border: none;
    border-radius: 4px;
    cursor: pointer;
    font-size: 1rem;
  }
  button[type="submit"]:hover {
    background-color: #444;
  }
  .error {
    color: red;
    margin-bottom: 1rem;
    text-align: center;
  }
  .success {
    color: green;
    margin-bottom: 1rem;
    text-align: center;
  }
</style>

