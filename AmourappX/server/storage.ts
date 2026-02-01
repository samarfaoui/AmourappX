import { db } from "./db";
import { scores, type InsertScore, type Score, users } from "@shared/schema";
import { desc, eq } from "drizzle-orm";

export interface IStorage {
  createScore(userId: string, score: InsertScore): Promise<Score>;
  getTopScores(): Promise<(Score & { username: string | null })[]>;
}

export class DatabaseStorage implements IStorage {
  async createScore(userId: string, score: InsertScore): Promise<Score> {
    const [newScore] = await db
      .insert(scores)
      .values({ ...score, userId })
      .returning();
    return newScore;
  }

  async getTopScores(): Promise<(Score & { username: string | null })[]> {
    const results = await db
      .select({
        id: scores.id,
        score: scores.score,
        createdAt: scores.createdAt,
        userId: scores.userId,
        firstName: users.firstName,
        lastName: users.lastName,
        email: users.email,
      })
      .from(scores)
      .leftJoin(users, eq(scores.userId, users.id))
      .orderBy(desc(scores.score))
      .limit(10);
      
    return results.map(r => {
      let username = "Anonymous";
      if (r.firstName) {
        username = r.firstName;
        if (r.lastName) {
          username += ` ${r.lastName}`;
        }
      } else if (r.email) {
        username = r.email;
      }
      
      return {
        id: r.id,
        score: r.score,
        createdAt: r.createdAt,
        userId: r.userId,
        username,
      };
    });
  }
}

export const storage = new DatabaseStorage();
