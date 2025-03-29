import { questions, flashcards, type Question, type InsertQuestion, type Flashcard, type InsertFlashcard } from "@shared/schema";
import { parseDocx } from "docx-parser";
import * as pdfjs from "pdfjs-dist";

export interface IStorage {
  // Question operations
  getQuestions(): Promise<Question[]>;
  getQuestionsByFilter(
    difficulties: string[],
    subjects: string[],
    years: string[],
    allDifficulties: boolean,
    allSubjects: boolean,
    allYears: boolean
  ): Promise<Question[]>;
  getQuestionById(id: number): Promise<Question | undefined>;
  createQuestion(question: InsertQuestion): Promise<Question>;
  deleteQuestion?(id: number): Promise<boolean>;
  
  // Score operations
  updateScore(newScore: number): Promise<number>;
  getScore(): Promise<number>;
  
  // Document parsing operations
  parseDocument?(fileContent: Buffer, fileType: string, filename: string): Promise<InsertQuestion[]>;
  parseTextIntoQuestions?(
    text: string, 
    defaults?: { 
      defaultDifficulty?: string; 
      defaultSubject?: string; 
      defaultYear?: string; 
    }
  ): Promise<InsertQuestion[]>;
  
  // Flashcard operations
  getFlashcards?(): Promise<Flashcard[]>;
  getFlashcardById?(id: number): Promise<Flashcard | undefined>;
  createFlashcard?(flashcard: InsertFlashcard): Promise<Flashcard>;
  updateFlashcard?(id: number, data: Partial<InsertFlashcard>): Promise<Flashcard>;
  deleteFlashcard?(id: number): Promise<boolean>;
}

export class MemStorage implements IStorage {
  private questions: Map<number, Question>;
  private flashcards: Map<number, Flashcard>;
  private currentId: number;
  private currentFlashcardId: number;
  private score: number;
  
  constructor() {
    this.questions = new Map();
    this.flashcards = new Map();
    this.currentId = 1;
    this.currentFlashcardId = 1;
    this.score = 0;
    
    // Seed with some initial questions
    this.seedQuestions();
  }
  
  async getQuestions(): Promise<Question[]> {
    return Array.from(this.questions.values());
  }
  
  async getQuestionsByFilter(
    difficulties: string[],
    subjects: string[],
    years: string[],
    allDifficulties: boolean,
    allSubjects: boolean,
    allYears: boolean
  ): Promise<Question[]> {
    const allQuestions = Array.from(this.questions.values());
    
    return allQuestions.filter(q => {
      // Check if the question matches the selected difficulties
      const difficultyMatch = allDifficulties || 
        (difficulties.length === 0 ? true : difficulties.includes(q.difficulty));
      
      // Check if the question matches the selected subjects
      const subjectMatch = allSubjects || 
        (subjects.length === 0 ? true : subjects.includes(q.subject));
      
      // Check if the question matches the selected years
      const yearMatch = allYears || 
        (years.length === 0 ? true : years.includes(q.year));
      
      return difficultyMatch && subjectMatch && yearMatch;
    });
  }
  
  async deleteQuestion(id: number): Promise<boolean> {
    return this.questions.delete(id);
  }
  
  async getQuestionById(id: number): Promise<Question | undefined> {
    return this.questions.get(id);
  }
  
  async createQuestion(insertQuestion: InsertQuestion): Promise<Question> {
    const id = this.currentId++;
    const question: Question = { ...insertQuestion, id };
    this.questions.set(id, question);
    return question;
  }
  
  async updateScore(newScore: number): Promise<number> {
    this.score = newScore;
    return this.score;
  }
  
  async getScore(): Promise<number> {
    return this.score;
  }
  
  async parseDocument(fileContent: Buffer, fileType: string, filename: string): Promise<InsertQuestion[]> {
    try {
      if (fileType === 'docx') {
        // Parse DOCX file
        const result = await parseDocx(fileContent);
        const text = result.text;
        return await this.parseTextIntoQuestions(text);
      } else if (fileType === 'pdf') {
        // Parse PDF file
        const data = new Uint8Array(fileContent);
        const loadingTask = pdfjs.getDocument({ data });
        const pdf = await loadingTask.promise;
        
        let fullText = '';
        for (let i = 1; i <= pdf.numPages; i++) {
          const page = await pdf.getPage(i);
          const content = await page.getTextContent();
          const pageText = content.items.map((item: any) => item.str).join(' ');
          fullText += pageText + '\n';
        }
        
        return await this.parseTextIntoQuestions(fullText);
      } else if (fileType === 'txt') {
        // Parse plaintext file
        const text = fileContent.toString('utf-8');
        return await this.parseTextIntoQuestions(text);
      } else {
        throw new Error(`Unsupported file type: ${fileType}`);
      }
    } catch (error) {
      console.error('Error parsing document:', error);
      throw error;
    }
  }
  
  async parseTextIntoQuestions(
    text: string, 
    defaults?: { 
      defaultDifficulty?: string; 
      defaultSubject?: string; 
      defaultYear?: string; 
    }
  ): Promise<InsertQuestion[]> {
    const questions: InsertQuestion[] = [];
    
    // Set defaults with fallbacks
    const defaultDifficulty = defaults?.defaultDifficulty || "district";
    const defaultSubject = defaults?.defaultSubject || "math";
    const defaultYear = defaults?.defaultYear || new Date().getFullYear().toString();
    
    // Split by lines and look for patterns indicating questions
    const lines = text.split(/\r?\n/);
    let currentQuestion: Partial<InsertQuestion> | null = null;
    
    for (let i = 0; i < lines.length; i++) {
      const line = lines[i].trim();
      
      // Skip empty lines
      if (!line) continue;
      
      // Check if line starts a new question using more patterns
      // Now matches Q1., 1., 1), #1, etc.
      const questionMatch = line.match(/^(?:Q:|Question:|[0-9]+[.)]|\([0-9]+\)|#[0-9]+\s*)(.*)/i);
      if (questionMatch) {
        // Save previous question if it exists
        if (currentQuestion && currentQuestion.text) {
          // If no answer provided, use a placeholder to avoid losing the question
          if (!currentQuestion.answer) {
            currentQuestion.answer = "[No answer provided]";
          }
          questions.push(currentQuestion as InsertQuestion);
        }
        
        // Start a new question
        currentQuestion = {
          text: questionMatch[1].trim(),
          answer: "",
          difficulty: defaultDifficulty as any,
          subject: defaultSubject as any,
          year: defaultYear
        };
        continue;
      }
      
      // If we don't have a current question and there's text, start one
      if (!currentQuestion && line) {
        currentQuestion = {
          text: line,
          answer: "",
          difficulty: defaultDifficulty as any,
          subject: defaultSubject as any,
          year: defaultYear
        };
        continue;
      }
      
      // Check if line contains an answer with more patterns
      const answerMatch = line.match(/^(?:A:|Answer:|ANSWER:|ANS:|Ans:)(.*)/i);
      if (answerMatch && currentQuestion) {
        currentQuestion.answer = answerMatch[1].trim();
        continue;
      }
      
      // Check for difficulty, subject, or year indicators with more patterns
      const difficultyMatch = line.match(/^(?:Difficulty|Level|Tier):\s*(district|regional|state)/i);
      if (difficultyMatch && currentQuestion) {
        currentQuestion.difficulty = difficultyMatch[1].toLowerCase() as any;
        continue;
      }
      
      const subjectMatch = line.match(/^(?:Subject|Category|Topic):\s*(math|science|arts|social|language)/i);
      if (subjectMatch && currentQuestion) {
        currentQuestion.subject = subjectMatch[1].toLowerCase() as any;
        continue;
      }
      
      const yearMatch = line.match(/^(?:Year|Date):\s*([0-9]{4})/);
      if (yearMatch && currentQuestion) {
        currentQuestion.year = yearMatch[1];
        continue;
      }
      
      // If none of the above matched and we have a current question, append to text
      if (currentQuestion && !currentQuestion.answer) {
        currentQuestion.text += " " + line;
      }
    }
    
    // Add the last question if it exists
    if (currentQuestion && currentQuestion.text) {
      // If no answer provided, use a placeholder
      if (!currentQuestion.answer) {
        currentQuestion.answer = "[No answer provided]";
      }
      questions.push(currentQuestion as InsertQuestion);
    }
    
    return questions;
  }
  
  private seedQuestions(): void {
    // Math questions
    this.createQuestion({
      text: "This mathematician, born in 1887 in Erode, India, had almost no formal training but made substantial contributions to mathematical analysis, number theory, infinite series, and continued fractions. He collaborated with G.H. Hardy at Cambridge University. Who is this mathematician?",
      answer: "Srinivasa Ramanujan",
      difficulty: "state",
      subject: "math",
      year: "2023"
    });
    
    this.createQuestion({
      text: "This value is defined as the ratio of a circle's circumference to its diameter. What is this mathematical constant?",
      answer: "Pi (π)",
      difficulty: "district",
      subject: "math",
      year: "2022"
    });
    
    // Science questions
    this.createQuestion({
      text: "This fundamental force is responsible for the attraction between masses and is described by Einstein's theory of general relativity. What is this force?",
      answer: "Gravity",
      difficulty: "regional",
      subject: "science",
      year: "2022"
    });
    
    this.createQuestion({
      text: "This scientist formulated the three laws of motion that laid the foundation for classical mechanics. Who is this scientist?",
      answer: "Sir Isaac Newton",
      difficulty: "regional",
      subject: "science",
      year: "2021"
    });
    
    // Arts questions
    this.createQuestion({
      text: "This painting by Leonardo da Vinci is one of the most famous works in the world and is housed in the Louvre Museum in Paris. What is the name of this painting?",
      answer: "Mona Lisa",
      difficulty: "district",
      subject: "arts",
      year: "2023"
    });
    
    // Social Studies questions
    this.createQuestion({
      text: "This document, written in 1776, announced that the thirteen American colonies regarded themselves as independent sovereign states. What is this document?",
      answer: "The Declaration of Independence",
      difficulty: "district",
      subject: "social",
      year: "2020"
    });
    
    // Language Arts questions
    this.createQuestion({
      text: "This author wrote 'Romeo and Juliet', 'Hamlet', and 'Macbeth'. Who is this playwright?",
      answer: "William Shakespeare",
      difficulty: "district",
      subject: "language",
      year: "2019"
    });
  }
  
  // Flashcard methods
  async getFlashcards(): Promise<Flashcard[]> {
    return Array.from(this.flashcards.values());
  }
  
  async getFlashcardById(id: number): Promise<Flashcard | undefined> {
    return this.flashcards.get(id);
  }
  
  async createFlashcard(flashcard: InsertFlashcard): Promise<Flashcard> {
    const id = this.currentFlashcardId++;
    // Ensure optional fields are properly initialized
    const newFlashcard: Flashcard = { 
      ...flashcard, 
      id,
      lastReviewed: flashcard.lastReviewed || null,
      timesReviewed: flashcard.timesReviewed || 0,
      notes: flashcard.notes || null
    };
    this.flashcards.set(id, newFlashcard);
    return newFlashcard;
  }
  
  async updateFlashcard(id: number, data: Partial<InsertFlashcard>): Promise<Flashcard> {
    const flashcard = this.flashcards.get(id);
    if (!flashcard) {
      throw new Error(`Flashcard with id ${id} not found`);
    }
    
    const updatedFlashcard = { ...flashcard, ...data };
    this.flashcards.set(id, updatedFlashcard);
    return updatedFlashcard;
  }
  
  async deleteFlashcard(id: number): Promise<boolean> {
    return this.flashcards.delete(id);
  }
}

export const storage = new MemStorage();
