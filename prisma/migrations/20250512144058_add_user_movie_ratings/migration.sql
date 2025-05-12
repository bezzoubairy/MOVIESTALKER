-- CreateTable
CREATE TABLE "UserMovieRating" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "rating" INTEGER,
    "notes" TEXT,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    "movieId" INTEGER NOT NULL,
    "userId" TEXT NOT NULL,
    CONSTRAINT "UserMovieRating_movieId_fkey" FOREIGN KEY ("movieId") REFERENCES "Movie" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "UserMovieRating_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateIndex
CREATE INDEX "UserMovieRating_userId_idx" ON "UserMovieRating"("userId");

-- CreateIndex
CREATE INDEX "UserMovieRating_movieId_idx" ON "UserMovieRating"("movieId");

-- CreateIndex
CREATE UNIQUE INDEX "UserMovieRating_userId_movieId_key" ON "UserMovieRating"("userId", "movieId");
