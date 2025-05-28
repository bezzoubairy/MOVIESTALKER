
-- CreateTable
CREATE TABLE "FriendRequest" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "requesterId" TEXT NOT NULL,
    "receiverId" TEXT NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'PENDING',
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "FriendRequest_requesterId_fkey" FOREIGN KEY ("requesterId") REFERENCES "User" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "FriendRequest_receiverId_fkey" FOREIGN KEY ("receiverId") REFERENCES "User" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "Friendship" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "userOneId" TEXT NOT NULL,
    "userTwoId" TEXT NOT NULL,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "Friendship_userOneId_fkey" FOREIGN KEY ("userOneId") REFERENCES "User" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "Friendship_userTwoId_fkey" FOREIGN KEY ("userTwoId") REFERENCES "User" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- RedefineTables
PRAGMA defer_foreign_keys=ON;
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_FavoriteItem" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "dateAdded" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "movieId" INTEGER NOT NULL,
    "userId" TEXT NOT NULL,
    CONSTRAINT "FavoriteItem_movieId_fkey" FOREIGN KEY ("movieId") REFERENCES "Movie" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "FavoriteItem_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);
INSERT INTO "new_FavoriteItem" ("dateAdded", "id", "movieId") SELECT "dateAdded", "id", "movieId" FROM "FavoriteItem";
DROP TABLE "FavoriteItem";
ALTER TABLE "new_FavoriteItem" RENAME TO "FavoriteItem";
CREATE INDEX "FavoriteItem_userId_idx" ON "FavoriteItem"("userId");
CREATE UNIQUE INDEX "FavoriteItem_movieId_userId_key" ON "FavoriteItem"("movieId", "userId");
CREATE TABLE "new_Movie" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "title" TEXT NOT NULL,
    "posterPath" TEXT,
    "releaseDate" TEXT,
    "overview" TEXT
);
INSERT INTO "new_Movie" ("id", "overview", "posterPath", "releaseDate", "title") SELECT "id", "overview", "posterPath", "releaseDate", "title" FROM "Movie";
DROP TABLE "Movie";
ALTER TABLE "new_Movie" RENAME TO "Movie";
CREATE TABLE "new_RecentlyViewedItem" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "dateAdded" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "movieId" INTEGER NOT NULL,
    "userId" TEXT NOT NULL,
    CONSTRAINT "RecentlyViewedItem_movieId_fkey" FOREIGN KEY ("movieId") REFERENCES "Movie" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "RecentlyViewedItem_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);
INSERT INTO "new_RecentlyViewedItem" ("dateAdded", "id", "movieId") SELECT "dateAdded", "id", "movieId" FROM "RecentlyViewedItem";
DROP TABLE "RecentlyViewedItem";
ALTER TABLE "new_RecentlyViewedItem" RENAME TO "RecentlyViewedItem";
CREATE INDEX "RecentlyViewedItem_userId_idx" ON "RecentlyViewedItem"("userId");
CREATE UNIQUE INDEX "RecentlyViewedItem_movieId_userId_key" ON "RecentlyViewedItem"("movieId", "userId");
PRAGMA foreign_keys=ON;
PRAGMA defer_foreign_keys=OFF;

-- CreateIndex
CREATE INDEX "FriendRequest_requesterId_idx" ON "FriendRequest"("requesterId");

-- CreateIndex
CREATE INDEX "FriendRequest_receiverId_idx" ON "FriendRequest"("receiverId");

-- CreateIndex
CREATE UNIQUE INDEX "FriendRequest_requesterId_receiverId_key" ON "FriendRequest"("requesterId", "receiverId");

-- CreateIndex
CREATE INDEX "Friendship_userOneId_idx" ON "Friendship"("userOneId");

-- CreateIndex
CREATE INDEX "Friendship_userTwoId_idx" ON "Friendship"("userTwoId");

-- CreateIndex
CREATE UNIQUE INDEX "Friendship_userOneId_userTwoId_key" ON "Friendship"("userOneId", "userTwoId");
