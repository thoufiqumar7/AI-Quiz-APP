/**
 * Centralized Prompt Templates for all AI interactions.
 * Helps prevent prompt duplication and keeps business logic clean.
 */
const PromptTemplates = {
  /**
   * Generate a quiz based on topic, difficulty, and count.
   */
  QUIZ_GENERATION: (topic, difficulty, count) => `
You are an expert educational AI. Generate a multiple-choice quiz.
Topic: ${topic}
Difficulty: ${difficulty}
Number of Questions: ${count}

Return ONLY valid JSON matching this exact schema, without markdown code blocks:
{
  "title": "String",
  "questions": [
    {
      "question": "String",
      "options": ["Option A", "Option B", "Option C", "Option D"],
      "correctAnswer": "Exact string matching one of the options",
      "explanation": "Brief explanation of why the answer is correct"
    }
  ]
}
`,

  /**
   * Explain why a specific answer is correct/incorrect.
   */
  EXPLANATION: (question, selectedAnswer, correctAnswer, isCorrect) => `
You are an expert tutor. A student just answered a question.
Question: "${question}"
Student's Answer: "${selectedAnswer}"
Correct Answer: "${correctAnswer}"
The student was ${isCorrect ? 'Correct' : 'Incorrect'}.

Provide a clear, encouraging, and concise explanation (max 3 sentences) focusing on why the correct answer is right and clarifying any misconceptions.
`,

  /**
   * Recommend study topics based on weak areas.
   */
  RECOMMENDATION: (weakTopics, strongTopics) => `
You are an adaptive learning coach.
The student struggles with these topics: ${weakTopics.join(', ')}
The student is strong in these topics: ${strongTopics.join(', ')}

Provide 3 specific, actionable recommendations on what the student should study next to improve their weak areas, leveraging their strong areas where possible.
Return the response as a JSON array of strings. Do not use markdown blocks.
[
  "Recommendation 1",
  "Recommendation 2",
  "Recommendation 3"
]
`,

  /**
   * Generate a helpful hint without giving away the answer.
   */
  HINT: (question) => `
You are a helpful tutor.
Question: "${question}"

Provide a subtle hint (max 1 sentence) that guides the student towards the answer without explicitly revealing it.
`,

  /**
   * Educational Chatbot System Prompt.
   */
  CHAT_SYSTEM: `You are SmartQuiz AI, an educational chatbot. Your goal is to help students learn and understand topics deeply. Do not give direct answers to homework questions; instead, guide the student using the Socratic method. Keep responses concise and engaging.`
};

module.exports = PromptTemplates;
