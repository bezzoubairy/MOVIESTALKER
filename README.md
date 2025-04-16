# Movie Tracker

A SvelteKit application for tracking movies, managing watchlists, and rating films.

## Project Purpose

This application allows users to:
- Browse popular movies from TMDB
- Search for specific movies by title
- View detailed information about movies
- Add movies to a watchlist for future viewing
- Mark movies as favorites
- Rate movies and add personal notes
- Filter and sort their watchlist and favorites

## Implementation Details

### Technologies Used

- **SvelteKit**: Framework for building the application
- **TypeScript**: For type safety and better developer experience
- **CSS**: For styling with responsive design
- **Local Storage**: For persisting user data
- **TMDB API**: For fetching movie data

### Key Features

1. **Movie Discovery**: Browse popular movies and search for specific titles
2. **Movie Details**: View comprehensive information about each movie
3. **Watchlist Management**: Add/remove movies to a personal watchlist
4. **Favorites Collection**: Mark movies as favorites for quick access
5. **Personal Ratings**: Rate movies and add personal notes
6. **Responsive Design**: Works on desktop and mobile devices

## Codebase Structure

```
movie-tracker/
├── src/
│   ├── lib/
│   │   ├── components/      # Svelte components
│   │   │   ├── MovieCard.svelte
│   │   │   ├── MovieList.svelte
│   │   │   ├── SearchBar.svelte
│   │   │   ├── Navigation.svelte
│   │   │   ├── MovieDetails.svelte
│   │   │   ├── WatchlistItem.svelte
│   │   │   ├── FilterComponent.svelte
│   │   │   └── RatingComponent.svelte
│   │   ├── services/        # API and storage services
│   │   │   ├── tmdb.ts      # TMDB API integration
│   │   │   └── storage.ts   # Local storage functionality
│   │   └── stores.ts        # Svelte stores for state management
│   ├── routes/              # SvelteKit routes
│   │   ├── +layout.svelte   # Main layout with navigation
│   │   ├── +page.svelte     # Home page
│   │   ├── search/          # Search functionality
│   │   ├── movie/[id]/      # Movie details page
│   │   ├── watchlist/       # User's watchlist
│   │   └── favorites/       # User's favorites
│   ├── app.html             # HTML template
│   └── app.d.ts             # TypeScript declarations
└── static/
    └── global.css           # Global styles
```

## API Usage

The application uses The Movie Database (TMDB) API for fetching movie data. The following API endpoints are used:

1. **Popular Movies**: Fetches a list of currently popular movies
   ```
   GET /movie/popular
   ```

2. **Movie Search**: Searches for movies by title
   ```
   GET /search/movie
   ```

3. **Movie Details**: Gets detailed information about a specific movie
   ```
   GET /movie/{movie_id}
   ```

4. **Movie Recommendations**: Gets movie recommendations based on a movie
   ```
   GET /movie/{movie_id}/recommendations
   ```

## Data Storage Approach

The application uses the browser's Local Storage API to persist user data between sessions. The following data is stored:

1. **Watchlist**: Movies the user wants to watch
2. **Favorites**: Movies the user has marked as favorites
3. **Recently Viewed**: Movies the user has recently viewed
4. **User Ratings**: User's personal ratings for movies
5. **User Notes**: User's personal notes about movies

The data is stored in a structured JSON format and is loaded when the application starts. The storage service provides methods for adding, removing, and updating items in these collections.

## Component Communication

Components in the application communicate through several methods:

1. **Props**: Parent components pass data to child components via props
2. **Events**: Child components emit events that parent components can listen for
3. **Stores**: Svelte stores are used for global state management
4. **Services**: Shared service modules provide functionality across components

For example:
- The `MovieList` component receives an array of movies as a prop and renders multiple `MovieCard` components
- When a user clicks "Add to Watchlist" in the `MovieCard` component, it calls the storage service and updates the store
- The `Navigation` component uses the current route to highlight the active navigation item

## Getting Started

### Prerequisites

- Node.js (v14 or later)
- npm or yarn

### Installation

1. Clone the repository
   ```
   git clone <repository-url>
   cd movie-tracker
   ```

2. Install dependencies
   ```
   npm install
   ```

3. Create a `.env` file with your TMDB API key
   ```
   TMDB_API_KEY=your_api_key_here
   ```

4. Start the development server
   ```
   npm run dev
   ```

5. Open your browser and navigate to `http://localhost:5173`

## Building for Production

To create a production build:

```
npm run build
```

The built application will be in the `build` directory and can be served using any static file server.
