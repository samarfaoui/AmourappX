
import { db } from "./db";
import { users, scores } from "@shared/schema";
import { storage } from "./storage";

async function seed() {
  console.log("Seeding...");
  
  // Create a dummy user
  let userId;
  const existingUsers = await db.select().from(users).limit(1);
  if (existingUsers.length > 0) {
    userId = existingUsers[0].id;
  } else {
      const [user] = await db.insert(users).values({
        email: "demo@example.com",
        firstName: "Demo",
        lastName: "Player",
      }).returning();
      userId = user.id;
  }
  
  const existingScores = await storage.getTopScores();
  if (existingScores.length === 0 && userId) {
     await storage.createScore(userId, { score: 10 });
     await storage.createScore(userId, { score: 50 });
     await storage.createScore(userId, { score: 100 });
     console.log("Seeded scores.");
  } else {
      console.log("Scores already exist or no user created.");
  }
}

seed().catch(console.error).finally(() => process.exit(0));
