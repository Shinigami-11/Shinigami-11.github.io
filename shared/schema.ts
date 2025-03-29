import { pgTable, text, serial, integer, boolean, jsonb } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

// Define enums for quiz question properties
export const QuizDifficulty = {
  DISTRICT: "district",
  REGIONAL: "regional",
  STATE: "state",
} as const;

export const QuizSubject = {
  MATH: "math",
  SCIENCE: "science",
  ARTS: "arts",
  SOCIAL: "social",
  LANGUAGE: "language",
} as const;

// Define the questions table
export const questions = pgTable("questions", {
  id: serial("id").primaryKey(),
  text: text("text").notNull(),
  answer: text("answer").notNull(),
  difficulty: text("difficulty", {
    enum: ["district", "regional", "state"],
  }).notNull(),
  subject: text("subject", {
    enum: ["math", "science", "arts", "social", "language"],
  }).notNull(),
  year: text("year").notNull(),
});

// Define the flashcards table for storing questions to study later
export const flashcards = pgTable("flashcards", {
  id: serial("id").primaryKey(),
  questionId: integer("question_id").notNull(),
  dateAdded: text("date_added").notNull(),
  lastReviewed: text("last_reviewed").default(null),
  timesReviewed: integer("times_reviewed").default(0),
  notes: text("notes").default(null),
});

// Create the insert schema for questions
export const insertQuestionSchema = createInsertSchema(questions).omit({
  id: true,
});

// Create the insert schema for flashcards
export const insertFlashcardSchema = createInsertSchema(flashcards).omit({
  id: true,
});

// Create the types
export type InsertQuestion = z.infer<typeof insertQuestionSchema>;
export type Question = typeof questions.$inferSelect;

export type InsertFlashcard = z.infer<typeof insertFlashcardSchema>;
export type Flashcard = typeof flashcards.$inferSelect;

// Create Zod schemas for question filtering - changed to support multiple selections
export const questionFilterSchema = z.object({
  difficulties: z.array(z.enum(["district", "regional", "state"] as const)).default([]),
  subjects: z.array(z.enum(["math", "science", "arts", "social", "language"] as const)).default([]),
  years: z.array(z.string()).default([]),
  allDifficulties: z.boolean().default(true),
  allSubjects: z.boolean().default(true),
  allYears: z.boolean().default(true),
});

export type QuestionFilter = z.infer<typeof questionFilterSchema>;

// Define keybindings schema
export const keybindingsSchema = z.object({
  buzzIn: z.string().default("Space"),
  nextQuestion: z.string().default("ArrowRight"),
  prevQuestion: z.string().default("ArrowLeft"),
  skipQuestion: z.string().default("s"),
  resetQuestion: z.string().default("r"),
  toggleDarkMode: z.string().default("d"),
});

export type Keybindings = z.infer<typeof keybindingsSchema>;

// Define user preferences schema
export const userPreferencesSchema = z.object({
  darkMode: z.boolean().default(false),
  readingSpeed: z.number().min(1).max(10).default(5),
  buzzTimeout: z.number().min(1).max(30).default(5),
  keybindings: keybindingsSchema.default({}),
});

export type UserPreferences = z.infer<typeof userPreferencesSchema>;

// Create a score schema
export const scoreSchema = z.object({
  score: z.number().default(0),
});

export type Score = z.infer<typeof scoreSchema>;

// Define parsed question schema (for document parsing)
export const parsedDocumentSchema = z.object({
  questions: z.array(insertQuestionSchema),
  fileType: z.enum(["docx", "pdf", "txt"]),
  filename: z.string(),
});

export type ParsedDocument = z.infer<typeof parsedDocumentSchema>;
