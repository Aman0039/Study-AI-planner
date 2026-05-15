const { GoogleGenAI } = require('@google/genai');

const genAI = new GoogleGenAI({
  apiKey: process.env.GEMINI_API_KEY,
});

/**
 * Generate content with retry logic
 */
const generateContent = async (
  prompt,
  modelName = 'gemini-2.5-flash',
  retries = 3
) => {
  for (let i = 0; i < retries; i++) {
    try {
      const response = await genAI.models.generateContent({
        model: modelName,
        contents: prompt,
      });

      // console.log(response.text);

      return response.text;
    } catch (error) {
      console.error('Gemini Error:', error);

      if (i === retries - 1) {
        throw error;
      }

      await new Promise((r) =>
        setTimeout(r, 1000 * (i + 1))
      );
    }
  }
};

/**
 * Generate a summary of the given text
 */
const generateSummary = async (text, summaryType = 'detailed') => {
  const prompts = {
    short: `Create a concise 3-5 sentence summary of the following study material. Focus on the most important points only:\n\n${text.substring(0, 8000)}`,
    detailed: `Create a comprehensive, well-structured summary of the following study material. Include all main concepts, key points, and important details. Organize with clear paragraphs:\n\n${text.substring(0, 8000)}`,
    bullets: `Extract and list the key points from the following study material as bullet points. Make each bullet point clear, informative, and actionable. Return as a JSON array of strings:\n\n${text.substring(0, 8000)}\n\nReturn ONLY a JSON array like: ["point 1", "point 2", ...]`,
    keyConcepts: `Identify and explain the key concepts, terms, and ideas from the following study material. For each concept, provide a brief definition or explanation. Return as a JSON array of objects:\n\n${text.substring(0, 8000)}\n\nReturn ONLY a JSON array like: [{"concept": "term", "definition": "explanation"}, ...]`
  };

  const result = await generateContent(prompts[summaryType] || prompts.detailed);

  if (summaryType === 'bullets' || summaryType === 'keyConcepts') {
    try {
      const cleaned = result.replace(/```json\n?/g, '').replace(/```\n?/g, '').trim();
      return JSON.parse(cleaned);
    } catch {
      return result;
    }
  }
  return result;
};

/**
 * Explain a topic like the student is 10 years old
 */
const explainSimply = async (topic, context = '') => {
  const prompt = `You are a friendly teacher explaining to a 10-year-old student. Explain the following topic in very simple, easy-to-understand language. Use analogies, simple examples, and a fun tone. Avoid jargon.

Topic: ${topic}
${context ? `Context from study material: ${context.substring(0, 3000)}` : ''}

Give a clear, friendly, and engaging explanation that a child could understand.`;

  return await generateContent(prompt);
};

/**
 * Generate quiz questions
 */
const generateQuiz = async (text, quizType = 'mcq', numQuestions = 10) => {
  const typeInstructions = {
    mcq: 'multiple choice questions with 4 options (A, B, C, D)',
    trueFalse: 'True/False questions',
    fillBlanks: 'fill-in-the-blank questions',
    mixed: 'a mix of MCQ, True/False, and fill-in-the-blank questions'
  };

  const prompt = `You are an expert educator. Generate ${numQuestions} ${typeInstructions[quizType] || typeInstructions.mcq} based on the following study material.

Study Material:
${text.substring(0, 6000)}

Return ONLY a valid JSON array in this exact format:
[
  {
    "question": "Question text here",
    "type": "mcq",
    "options": ["A. Option 1", "B. Option 2", "C. Option 3", "D. Option 4"],
    "correctAnswer": "A. Option 1",
    "explanation": "Brief explanation of why this is correct"
  }
]

For True/False, use type "trueFalse" and options ["True", "False"].
For fill-in-the-blank, use type "fillBlanks" and options [].
Make questions educational, accurate, and varying in difficulty.`;

  const result = await generateContent(prompt);
  try {
    const cleaned = result.replace(/```json\n?/g, '').replace(/```\n?/g, '').trim();
    return JSON.parse(cleaned);
  } catch {
    throw new Error('Failed to parse quiz questions from AI response');
  }
};

/**
 * Generate flashcards
 */
const generateFlashcards = async (text, numCards = 15) => {
  const prompt = `You are an expert educator. Create ${numCards} educational flashcards from the following study material. Each flashcard should test an important concept, fact, or definition.

Study Material:
${text.substring(0, 6000)}

Return ONLY a valid JSON array in this exact format:
[
  {
    "question": "Clear, concise question",
    "answer": "Clear, accurate answer (2-4 sentences)",
    "difficulty": "easy|medium|hard"
  }
]

Ensure questions cover different aspects of the material and vary in difficulty.`;

  const result = await generateContent(prompt);
  try {
    const cleaned = result.replace(/```json\n?/g, '').replace(/```\n?/g, '').trim();
    return JSON.parse(cleaned);
  } catch {
    throw new Error('Failed to parse flashcards from AI response');
  }
};

/**
 * Generate a personalized study plan
 */
const generateStudyPlan = async (subjects, examDate, hoursPerDay) => {
  const daysUntilExam = Math.ceil((new Date(examDate) - new Date()) / (1000 * 60 * 60 * 24));

  const prompt = `You are an expert academic advisor. Create a detailed, personalized study plan for a student.

Student Details:
- Subjects to study: ${subjects.map(s => `${s.name} (Priority: ${s.priority})`).join(', ')}
- Exam date: ${examDate}
- Days until exam: ${daysUntilExam}
- Available study hours per day: ${hoursPerDay}

Create a realistic, efficient study schedule. Return ONLY a valid JSON object in this exact format:
{
  "overview": "Brief overview of the study strategy",
  "schedule": [
    {
      "day": "Day 1 - Monday (Date)",
      "sessions": [
        {
          "subject": "Subject Name",
          "duration": 60,
          "topic": "Specific topic to cover",
          "technique": "Study technique (e.g., Active recall, Mind mapping)"
        }
      ],
      "totalHours": 3
    }
  ],
  "tips": ["Study tip 1", "Study tip 2", "Study tip 3"],
  "weeklyGoals": ["Goal 1", "Goal 2"]
}

Create schedule for up to 7 days. Make it specific, actionable, and motivating.`;

  const result = await generateContent(prompt);
  try {
    const cleaned = result.replace(/```json\n?/g, '').replace(/```\n?/g, '').trim();
    return JSON.parse(cleaned);
  } catch {
    throw new Error('Failed to parse study plan from AI response');
  }
};

/**
 * Generate a revision sheet
 */
const generateRevisionSheet = async (text, subject = 'General') => {
  const prompt = `Create a comprehensive one-page revision sheet for ${subject} based on the following study material. Include:
- Key definitions and terms
- Important formulas or rules (if applicable)  
- Core concepts summary
- Common mistakes to avoid
- Quick tips for remembering key points

Study Material:
${text.substring(0, 6000)}

Format it clearly with sections. Make it perfect for last-minute revision.`;

  return await generateContent(prompt);
};

/**
 * Chat with context awareness
 */
const chatWithContext = async (messages, context = '', userMessage) => {
  const systemContext = context
    ? `You are an intelligent AI study assistant. You have access to the following study material to help answer questions:\n\n${context.substring(0, 4000)}\n\nUse this context to give accurate, helpful answers. If the question is not related to the material, still help but clarify.`
    : `You are an intelligent AI study assistant. Help students understand concepts, solve doubts, and learn effectively. Be encouraging, clear, and educational.`;

  const conversationHistory = messages.slice(-10).map(m =>
    `${m.role === 'user' ? 'Student' : 'Assistant'}: ${m.content}`
  ).join('\n');

  const prompt = `${systemContext}

Previous conversation:
${conversationHistory}

Student: ${userMessage}

Provide a helpful, accurate, and educational response. Be concise but thorough. Use examples where helpful.`;

  return await generateContent(prompt);
};

/**
 * Summarize YouTube transcript
 */
const summarizeYouTubeContent = async (transcript, videoTitle = '') => {
  const prompt = `You are an expert at analyzing educational video content. Analyze this YouTube video transcript${videoTitle ? ` titled "${videoTitle}"` : ''} and provide:

Transcript:
${transcript.substring(0, 8000)}

Return ONLY a valid JSON object in this exact format:
{
  "summary": "Comprehensive summary of the video content (3-4 paragraphs)",
  "keyTakeaways": ["Takeaway 1", "Takeaway 2", "Takeaway 3", "Takeaway 4", "Takeaway 5"],
  "notes": ["Detailed note 1", "Detailed note 2", "Detailed note 3"],
  "mainTopics": ["Topic 1", "Topic 2", "Topic 3"]
}`;

  const result = await generateContent(prompt);
  try {
    const cleaned = result.replace(/```json\n?/g, '').replace(/```\n?/g, '').trim();
    return JSON.parse(cleaned);
  } catch {
    return { summary: result, keyTakeaways: [], notes: [], mainTopics: [] };
  }
};

module.exports = {
  generateContent,
  generateSummary,
  explainSimply,
  generateQuiz,
  generateFlashcards,
  generateStudyPlan,
  generateRevisionSheet,
  chatWithContext,
  summarizeYouTubeContent
};
