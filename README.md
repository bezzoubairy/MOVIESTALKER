# Movie Tracker

A SvelteKit application for tracking movies, sharing your/friends fovourite films ,and rating films.

## Project Purpose

This application allows users to:
- Browse popular movies from TMDB
- Search for specific movies by title
- View detailed information about movies
- Mark movies as favorites
- Rate movies and add personal notes
- Filter and sort their favorites

## Implementation Details

### Technologies Used

- **SvelteKit**: Framework for building the application
- **TypeScript**: For type safety and better developer experience
- **CSS**: For styling with responsive design
- **SQLite Database with Prisma**: For persisting user data
- **TMDB API**: For fetching movie data

### Key Features

1. **Movie Discovery**: Browse popular movies and search for specific titles
2. **Movie Details**: View comprehensive information about each movie
3. **Responsive Design**: Works on desktop and mobile devices
4. **Favorites Collection**: Mark movies as favorites for quick access
5. **Personal Ratings**: Rate movies and add personal notes

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

The application uses an **SQLite database via Prisma ORM** to persist user data between sessions. The following data is stored:

1. **Movies**: Core movie details (ID, title, poster, release date, overview) and user-specific data (ratings, notes).
2. **Watchlist**: Links movies to a user's watchlist, storing the `dateAdded`.
3. **Favorites**: Links movies to a user's favorites list, storing the `dateAdded`.
4. **Recently Viewed**: Tracks recently viewed movies with `dateAdded` (acting as last viewed date).

The data is managed through Prisma Client, ensuring type safety and efficient database interactions. The `src/lib/services/storage.ts` module now handles all database operations.

## Component Communication

Components in the application communicate through several methods:

1. **Props**: Parent components pass data to child components via props
2. **Events**: Child components emit events that parent components can listen for
3. **Stores**: Svelte stores are used for global state management
4. **Services**: Shared service modules provide functionality across components


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

3. Create a `.env` file in the root of the `movie-tracker` directory with your TMDB API key and the database URL (it should already be configured for SQLite):
   ```env
   TMDB_API_KEY=your_api_key_here
   DATABASE_URL="file:./dev.db"
   ```

4. Apply Prisma migrations to set up the database schema:
   ```
   npx prisma migrate dev --name init
   ```
   (If you are setting this up for the first time and the migration already exists from the project files, this command will apply it. If you make schema changes later, you'll use `npx prisma migrate dev --name your_migration_name`.)

5. Start the development server
   ```
   npm run dev
   ```

6. Open your browser and navigate to `http://localhost:5173` (or the port indicated if 5173 is busy).
