<script lang="ts">
  import type { PageData, ActionData } from "./$types";
  export let data: PageData;
  export let form: ActionData;

  let searchTerm = "";

  // Filter users based on search term (client-side for now)
  $: filteredUsers = data.allUsers?.filter(user => 
    user.username.toLowerCase().includes(searchTerm.toLowerCase()) &&
    user.id !== data.currentUser?.id && // Don't show self
    !data.friends?.some(friend => friend.id === user.id) && // Don't show existing friends
    !data.sentRequests?.some(req => req.receiverId === user.id && req.status === 'PENDING') && // Don't show if request already sent
    !data.receivedRequests?.some(req => req.requesterId === user.id && req.status === 'PENDING') // Don't show if request already received
  ) || [];

</script>

<div class="container friends-page">
  <h1>Friends</h1>

  {#if form?.error}
    <p class="error">{form.error}</p>
  {/if}
  {#if form?.successMessage}
    <p class="success">{form.successMessage}</p>
  {/if}

  <section class="search-users">
    <h2>Find Users</h2>
    <input type="text" bind:value={searchTerm} placeholder="Search by username" />
    
    {#if searchTerm && filteredUsers.length > 0}
      <ul class="user-list">
        {#each filteredUsers as user}
          <li>
            <span>{user.username}</span>
            <form method="POST" action="?/sendRequest">
              <input type="hidden" name="receiverId" value={user.id} />
              <button type="submit">Send Friend Request</button>
            </form>
          </li>
        {/each}
      </ul>
    {:else if searchTerm && filteredUsers.length === 0}
      <p>No users found matching "{searchTerm}".</p>
    {/if}
  </section>

  <section class="friend-requests">
    <h2>Received Friend Requests</h2>
    {#if data.receivedRequests && data.receivedRequests.length > 0}
      <ul class="request-list">
        {#each data.receivedRequests as request}
          {#if request.status === 'PENDING'}
            <li>
              <span>{request.requester.username} wants to be your friend.</span>
              <form method="POST" action="?/acceptRequest" style="display: inline;">
                <input type="hidden" name="requestId" value={request.id} />
                <button type="submit" class="accept">Accept</button>
              </form>
              <form method="POST" action="?/declineRequest" style="display: inline;">
                <input type="hidden" name="requestId" value={request.id} />
                <button type="submit" class="decline">Decline</button>
              </form>
            </li>
          {/if}
        {/each}
      </ul>
    {:else}
      <p>No pending friend requests.</p>
    {/if}
  </section>

  <section class="sent-requests">
    <h2>Sent Friend Requests</h2>
    {#if data.sentRequests && data.sentRequests.length > 0}
      <ul class="request-list">
        {#each data.sentRequests as request}
           {#if request.status === 'PENDING'}
            <li>
              <span>Friend request sent to {request.receiver.username} (Pending)</span>
              <!-- Add cancel request form if needed -->
            </li>
          {/if}
        {/each}
      </ul>
    {:else}
      <p>No pending sent requests.</p>
    {/if}
  </section>

  <section class="current-friends">
    <h2>Your Friends</h2>
    {#if data.friends && data.friends.length > 0}
      <ul class="friend-list">
        {#each data.friends as friend}
          <li>{friend.username}</li>
        {/each}
      </ul>
    {:else}
      <p>You have no friends yet. Send some requests!</p>
    {/if}
  </section>

</div>

<style>
  .friends-page {
    max-width: 800px;
    margin: 2rem auto;
    padding: 2rem;
  }
  h1, h2 {
    color: #e0e0e0; /* Light violet/white for headers */
    border-bottom: 1px solid #800080; /* Violet accent */
    padding-bottom: 0.5rem;
    margin-bottom: 1rem;
  }
  section {
    margin-bottom: 2rem;
    background-color: rgba(26, 26, 46, 0.7); /* Slightly transparent dark violet */
    padding: 1.5rem;
    border-radius: 8px;
  }
  input[type="text"] {
    width: 100%;
    padding: 0.75rem;
    margin-bottom: 1rem;
    border: 1px solid #4a4a70; /* Darker violet border */
    border-radius: 4px;
    background-color: #1a1a2e; /* Dark violet background */
    color: #e0e0e0; /* Light text */
    box-sizing: border-box;
  }
  .user-list, .request-list, .friend-list {
    list-style: none;
    padding: 0;
  }
  .user-list li, .request-list li, .friend-list li {
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding: 0.75rem 0;
    border-bottom: 1px solid #4a4a70; /* Darker violet separator */
    color: #cccccc;
  }
  .user-list li:last-child, .request-list li:last-child, .friend-list li:last-child {
    border-bottom: none;
  }
  button, .accept, .decline {
    padding: 0.5rem 1rem;
    background-color: #800080; /* Violet */
    color: white;
    border: none;
    border-radius: 4px;
    cursor: pointer;
    font-size: 0.9rem;
    transition: background-color 0.2s ease;
  }
  button:hover, .accept:hover, .decline:hover {
    background-color: #600060; /* Darker violet */
  }
  .accept {
    background-color: #008000; /* Green for accept */
    margin-left: 0.5rem;
  }
  .accept:hover {
    background-color: #006000;
  }
  .decline {
    background-color: #b00020; /* Red for decline */
    margin-left: 0.5rem;
  }
  .decline:hover {
    background-color: #900010;
  }
  .error {
    color: #ff6b6b; /* Light red for errors */
    background-color: rgba(255, 107, 107, 0.1);
    padding: 0.75rem;
    border-radius: 4px;
    margin-bottom: 1rem;
    text-align: center;
  }
  .success {
    color: #69f0ae; /* Light green for success */
    background-color: rgba(105, 240, 174, 0.1);
    padding: 0.75rem;
    border-radius: 4px;
    margin-bottom: 1rem;
    text-align: center;
  }
  p {
    color: #b0b0d0; /* Lighter text for paragraphs */
  }
</style>

