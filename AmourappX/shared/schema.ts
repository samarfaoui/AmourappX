export * from "./models/auth";
import { pgTable, text, serial, integer, timestamp } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";
import { users } from "./models/auth";
import { relations } from "drizzle-orm";

export const scores = pgTable("scores", {
  id: serial("id").primaryKey(),
  userId: text("user_id").notNull().references(() => users.id),
  score: integer("score").notNull(),
  createdAt: timestamp("created_at").defaultNow(),
});

export const scoresRelations = relations(scores, ({ one }) => ({
  user: one(users, {
    fields: [scores.userId],
    references: [users.id],
  }),
}));

export const insertScoreSchema = createInsertSchema(scores).pick({
  score: true,
});

export type Score = typeof scores.$inferSelect;
export type InsertScore = z.infer<typeof insertScoreSchema>;
