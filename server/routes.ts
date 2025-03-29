import type { Express, Request } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { insertQuestionSchema, questionFilterSchema, parsedDocumentSchema, insertFlashcardSchema } from "@shared/schema";
import { z } from "zod";
import multer from "multer";
import { fileTypeFromBuffer } from "file-type";

export async function registerRoutes(app: Express): Promise<Server> {
  // Get all questions
  app.get("/api/questions", async (req, res) => {
    try {
      const questions = await storage.getQuestions();
      res.json(questions);
    } catch (error) {
      console.error("Error getting questions:", error);
      res.status(500).json({ message: "Failed to get questions" });
    }
  });

  // Get questions with filters
  app.get("/api/questions/filter", async (req, res) => {
    try {
      // Extract array query parameters
      const difficulties = Array.isArray(req.query.difficulties) 
        ? req.query.difficulties 
        : req.query.difficulties ? [req.query.difficulties] : [];
      
      const subjects = Array.isArray(req.query.subjects) 
        ? req.query.subjects 
        : req.query.subjects ? [req.query.subjects] : [];
      
      const years = Array.isArray(req.query.years) 
        ? req.query.years 
        : req.query.years ? [req.query.years] : [];
      
      // Parse the boolean flags
      const allDifficulties = req.query.allDifficulties !== 'false';
      const allSubjects = req.query.allSubjects !== 'false';
      const allYears = req.query.allYears !== 'false';
      
      const parsedFilters = questionFilterSchema.parse({
        difficulties,
        subjects,
        years,
        allDifficulties,
        allSubjects,
        allYears
      });
      
      const questions = await storage.getQuestionsByFilter(
        parsedFilters.difficulties,
        parsedFilters.subjects,
        parsedFilters.years,
        parsedFilters.allDifficulties,
        parsedFilters.allSubjects,
        parsedFilters.allYears
      );
      
      res.json(questions);
    } catch (error) {
      if (error instanceof z.ZodError) {
        res.status(400).json({ message: "Invalid filter parameters", errors: error.errors });
      } else {
        console.error("Error filtering questions:", error);
        res.status(500).json({ message: "Failed to filter questions" });
      }
    }
  });

  // Get a specific question by ID
  app.get("/api/questions/:id", async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      if (isNaN(id)) {
        return res.status(400).json({ message: "Invalid question ID" });
      }
      
      const question = await storage.getQuestionById(id);
      if (!question) {
        return res.status(404).json({ message: "Question not found" });
      }
      
      res.json(question);
    } catch (error) {
      console.error("Error getting question:", error);
      res.status(500).json({ message: "Failed to get question" });
    }
  });

  // Create a new question
  app.post("/api/questions", async (req, res) => {
    try {
      const questionData = insertQuestionSchema.parse(req.body);
      const newQuestion = await storage.createQuestion(questionData);
      res.status(201).json(newQuestion);
    } catch (error) {
      if (error instanceof z.ZodError) {
        res.status(400).json({ message: "Invalid question data", errors: error.errors });
      } else {
        console.error("Error creating question:", error);
        res.status(500).json({ message: "Failed to create question" });
      }
    }
  });

  // Update score
  app.post("/api/score", async (req, res) => {
    try {
      const { score } = req.body;
      
      if (typeof score !== "number") {
        return res.status(400).json({ message: "Score must be a number" });
      }
      
      const updatedScore = await storage.updateScore(score);
      res.json({ score: updatedScore });
    } catch (error) {
      console.error("Error updating score:", error);
      res.status(500).json({ message: "Failed to update score" });
    }
  });

  // Get current score
  app.get("/api/score", async (req, res) => {
    try {
      const score = await storage.getScore();
      res.json({ score });
    } catch (error) {
      console.error("Error getting score:", error);
      res.status(500).json({ message: "Failed to get score" });
    }
  });

  // Delete a question
  app.delete("/api/questions/:id", async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      if (isNaN(id)) {
        return res.status(400).json({ message: "Invalid question ID" });
      }
      
      const deleted = await storage.deleteQuestion(id);
      if (!deleted) {
        return res.status(404).json({ message: "Question not found" });
      }
      
      res.json({ message: "Question deleted successfully" });
    } catch (error) {
      console.error("Error deleting question:", error);
      res.status(500).json({ message: "Failed to delete question" });
    }
  });

  // Set up multer for file uploads
  const upload = multer({ 
    storage: multer.memoryStorage(),
    limits: { fileSize: 10 * 1024 * 1024 } // 10MB size limit
  });

  // Parse document and extract questions
  app.post("/api/questions/parse", upload.single('file'), async (req, res) => {
    try {
      if (!req.file) {
        return res.status(400).json({ message: "No file uploaded" });
      }

      // Determine file type
      const fileTypeResult = await fileTypeFromBuffer(req.file.buffer);
      let fileType = 'txt'; // Default to txt

      if (fileTypeResult) {
        if (fileTypeResult.mime === 'application/vnd.openxmlformats-officedocument.wordprocessingml.document') {
          fileType = 'docx';
        } else if (fileTypeResult.mime === 'application/pdf') {
          fileType = 'pdf';
        }
      }

      // Parse the document
      const parsedQuestions = await storage.parseDocument(
        req.file.buffer,
        fileType,
        req.file.originalname
      );

      // Return the parsed questions without saving them yet
      res.json({
        questions: parsedQuestions,
        fileType,
        filename: req.file.originalname
      });
    } catch (error) {
      console.error("Error parsing document:", error);
      res.status(500).json({ message: "Failed to parse document" });
    }
  });

  // Import parsed questions
  app.post("/api/questions/import", async (req, res) => {
    try {
      const data = parsedDocumentSchema.parse(req.body);
      const importedQuestions = [];

      // Import each question
      for (const question of data.questions) {
        const newQuestion = await storage.createQuestion(question);
        importedQuestions.push(newQuestion);
      }

      res.status(201).json({
        count: importedQuestions.length,
        questions: importedQuestions
      });
    } catch (error) {
      if (error instanceof z.ZodError) {
        res.status(400).json({ message: "Invalid document data", errors: error.errors });
      } else {
        console.error("Error importing questions:", error);
        res.status(500).json({ message: "Failed to import questions" });
      }
    }
  });
  
  // Import questions from plain text
  app.post("/api/questions/import-text", async (req, res) => {
    try {
      const { text, defaultDifficulty, defaultSubject, defaultYear } = req.body;
      
      if (typeof text !== "string" || !text.trim()) {
        return res.status(400).json({ message: "Text content is required" });
      }
      
      // Parse the text into questions
      const parsedQuestions = await storage.parseTextIntoQuestions(text, {
        defaultDifficulty: defaultDifficulty || "district",
        defaultSubject: defaultSubject || "math",
        defaultYear: defaultYear || new Date().getFullYear().toString()
      });
      
      // Import all parsed questions
      const importedQuestions = [];
      for (const question of parsedQuestions) {
        const newQuestion = await storage.createQuestion(question);
        importedQuestions.push(newQuestion);
      }
      
      res.status(201).json({
        count: importedQuestions.length,
        questions: importedQuestions
      });
    } catch (error) {
      console.error("Error importing text questions:", error);
      res.status(500).json({ message: "Failed to import questions from text" });
    }
  });
  
  // Flashcard Routes
  
  // Get all flashcards
  app.get("/api/flashcards", async (req, res) => {
    try {
      const flashcards = await storage.getFlashcards();
      res.json(flashcards);
    } catch (error) {
      console.error("Error getting flashcards:", error);
      res.status(500).json({ message: "Failed to get flashcards" });
    }
  });
  
  // Get flashcard by ID
  app.get("/api/flashcards/:id", async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      if (isNaN(id)) {
        return res.status(400).json({ message: "Invalid flashcard ID" });
      }
      
      const flashcard = await storage.getFlashcardById(id);
      if (!flashcard) {
        return res.status(404).json({ message: "Flashcard not found" });
      }
      
      res.json(flashcard);
    } catch (error) {
      console.error("Error getting flashcard:", error);
      res.status(500).json({ message: "Failed to get flashcard" });
    }
  });
  
  // Create a new flashcard
  app.post("/api/flashcards", async (req, res) => {
    try {
      const flashcardData = insertFlashcardSchema.parse(req.body);
      const newFlashcard = await storage.createFlashcard(flashcardData);
      res.status(201).json(newFlashcard);
    } catch (error) {
      if (error instanceof z.ZodError) {
        res.status(400).json({ message: "Invalid flashcard data", errors: error.errors });
      } else {
        console.error("Error creating flashcard:", error);
        res.status(500).json({ message: "Failed to create flashcard" });
      }
    }
  });
  
  // Update flashcard
  app.patch("/api/flashcards/:id", async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      if (isNaN(id)) {
        return res.status(400).json({ message: "Invalid flashcard ID" });
      }
      
      const updatedFlashcard = await storage.updateFlashcard(id, req.body);
      res.json(updatedFlashcard);
    } catch (error) {
      console.error("Error updating flashcard:", error);
      res.status(500).json({ message: "Failed to update flashcard" });
    }
  });
  
  // Delete flashcard
  app.delete("/api/flashcards/:id", async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      if (isNaN(id)) {
        return res.status(400).json({ message: "Invalid flashcard ID" });
      }
      
      const deleted = await storage.deleteFlashcard(id);
      if (!deleted) {
        return res.status(404).json({ message: "Flashcard not found" });
      }
      
      res.json({ message: "Flashcard deleted successfully" });
    } catch (error) {
      console.error("Error deleting flashcard:", error);
      res.status(500).json({ message: "Failed to delete flashcard" });
    }
  });

  const httpServer = createServer(app);
  return httpServer;
}
