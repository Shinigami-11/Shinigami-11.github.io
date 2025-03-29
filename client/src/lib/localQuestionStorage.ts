import { Question, InsertQuestion } from '@shared/schema';

// Local storage key for user questions
const USER_QUESTIONS_KEY = 'quiz_parserinator_user_questions';

// Get all user questions from local storage
export function getUserQuestions(): Question[] {
  try {
    const storedQuestions = localStorage.getItem(USER_QUESTIONS_KEY);
    if (!storedQuestions) return [];
    return JSON.parse(storedQuestions);
  } catch (error) {
    console.error('Error retrieving user questions from local storage:', error);
    return [];
  }
}

// Save a new question to local storage
export function saveUserQuestion(question: InsertQuestion): Question {
  try {
    const userQuestions = getUserQuestions();
    
    // Generate a unique ID (negative to avoid collision with server IDs)
    const id = -(userQuestions.length + 1);
    
    // Create the new question
    const newQuestion: Question = {
      ...question,
      id
    };
    
    // Add to local array and save
    userQuestions.push(newQuestion);
    localStorage.setItem(USER_QUESTIONS_KEY, JSON.stringify(userQuestions));
    
    return newQuestion;
  } catch (error) {
    console.error('Error saving user question to local storage:', error);
    throw new Error('Failed to save question locally.');
  }
}

// Delete a user question from local storage
export function deleteUserQuestion(id: number): boolean {
  try {
    const userQuestions = getUserQuestions();
    const filteredQuestions = userQuestions.filter(q => q.id !== id);
    
    if (filteredQuestions.length === userQuestions.length) {
      return false; // No question found with that ID
    }
    
    localStorage.setItem(USER_QUESTIONS_KEY, JSON.stringify(filteredQuestions));
    return true;
  } catch (error) {
    console.error('Error deleting user question from local storage:', error);
    return false;
  }
}

// Update a user question in local storage
export function updateUserQuestion(id: number, updatedData: Partial<InsertQuestion>): Question | null {
  try {
    const userQuestions = getUserQuestions();
    const questionIndex = userQuestions.findIndex(q => q.id === id);
    
    if (questionIndex === -1) {
      return null; // No question found with that ID
    }
    
    // Update the question
    const updatedQuestion = {
      ...userQuestions[questionIndex],
      ...updatedData
    };
    
    userQuestions[questionIndex] = updatedQuestion;
    localStorage.setItem(USER_QUESTIONS_KEY, JSON.stringify(userQuestions));
    
    return updatedQuestion;
  } catch (error) {
    console.error('Error updating user question in local storage:', error);
    return null;
  }
}

// Import questions from a parsed document
export function importUserQuestions(questions: InsertQuestion[]): Question[] {
  try {
    const userQuestions = getUserQuestions();
    const newQuestions: Question[] = [];
    
    // Generate IDs for all new questions
    questions.forEach((question, index) => {
      const id = -(userQuestions.length + index + 1);
      const newQuestion: Question = { ...question, id };
      newQuestions.push(newQuestion);
    });
    
    // Save all questions
    const updatedQuestions = [...userQuestions, ...newQuestions];
    localStorage.setItem(USER_QUESTIONS_KEY, JSON.stringify(updatedQuestions));
    
    return newQuestions;
  } catch (error) {
    console.error('Error importing user questions to local storage:', error);
    throw new Error('Failed to import questions locally.');
  }
}

// Clear all user questions
export function clearUserQuestions(): boolean {
  try {
    localStorage.removeItem(USER_QUESTIONS_KEY);
    return true;
  } catch (error) {
    console.error('Error clearing user questions from local storage:', error);
    return false;
  }
}