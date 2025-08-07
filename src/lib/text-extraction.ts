export type ExtractedContent = {
  text: string;
  questions: QuestionData[];
  metadata: {
    pageCount?: number;
    wordCount: number;
    extractionMethod: string;
  };
};

export type QuestionData = {
  questionNumber: number;
  questionText: string;
  options?: string[];
  userAnswer?: string;
  correctAnswer?: string;
  explanation?: string;
  difficulty?: 'Easy' | 'Medium' | 'Hard';
  category?: string;
  acsCode?: string;
};

export class TextExtractor {
  static async extractFromFile(file: File): Promise<ExtractedContent> {
    const mimeType = file.type;

    switch (mimeType) {
      case 'application/pdf':
        return this.extractFromPDF(file);
      case 'text/plain':
        return this.extractFromText(file);
      case 'image/jpeg':
      case 'image/png':
        return this.extractFromImage(file);
      default:
        throw new Error(`Unsupported file type: ${mimeType}`);
    }
  }

  private static async extractFromPDF(file: File): Promise<ExtractedContent> {
    const arrayBuffer = await file.arrayBuffer();

    const simulatedText = `
    Mock PDF extraction for ${file.name}
    
    Question 1: What is the minimum fuel requirement for VFR day flights?
    A) 30 minutes beyond destination
    B) 45 minutes beyond destination  
    C) 60 minutes beyond destination
    D) No minimum required
    Answer: A
    
    Question 2: What altitude should you maintain when flying over congested areas?
    A) 500 feet AGL
    B) 1000 feet AGL
    C) 1500 feet AGL
    D) 2000 feet AGL
    Answer: B
    
    Question 3: What is the standard traffic pattern altitude?
    A) 800 feet AGL
    B) 1000 feet AGL
    C) 1200 feet AGL
    D) 1500 feet AGL
    Answer: B
    `;

    const questions = this.parseQuestions(simulatedText);

    return {
      text: simulatedText,
      questions,
      metadata: {
        pageCount: 1,
        wordCount: simulatedText.split(' ').length,
        extractionMethod: 'PDF parsing simulation',
      },
    };
  }

  private static async extractFromText(file: File): Promise<ExtractedContent> {
    const text = await file.text();
    const questions = this.parseQuestions(text);

    return {
      text,
      questions,
      metadata: {
        wordCount: text.split(' ').length,
        extractionMethod: 'Plain text parsing',
      },
    };
  }

  private static async extractFromImage(file: File): Promise<ExtractedContent> {
    const simulatedText = `
    Mock OCR extraction from ${file.name}
    
    Question 1: What is the maximum speed below 10,000 feet MSL?
    A) 200 knots
    B) 250 knots
    C) 300 knots
    D) No limit
    Answer: B
    
    Question 2: What is Class B airspace?
    A) Generally airspace from surface to 4,000 feet AGL
    B) Generally airspace from surface to 10,000 feet MSL
    C) Generally airspace from surface to 2,500 feet AGL
    D) Controlled airspace extending upward from 700 or 1,200 feet AGL
    Answer: B
    `;

    const questions = this.parseQuestions(simulatedText);

    return {
      text: simulatedText,
      questions,
      metadata: {
        wordCount: simulatedText.split(' ').length,
        extractionMethod: 'OCR simulation',
      },
    };
  }

  private static parseQuestions(text: string): QuestionData[] {
    const questions: QuestionData[] = [];
    const lines = text.split('\n').map(line => line.trim()).filter(Boolean);

    let currentQuestion: Partial<QuestionData> = {};
    let questionNumber = 0;

    for (const line of lines) {
      if (line.match(/^Question \d+:/)) {
        if (currentQuestion.questionText) {
          questions.push(currentQuestion as QuestionData);
        }

        questionNumber++;
        currentQuestion = {
          questionNumber,
          questionText: line.replace(/^Question \d+:\s*/, ''),
          options: [],
          difficulty: Math.random() > 0.6 ? 'Hard' : Math.random() > 0.3 ? 'Medium' : 'Easy',
        };
      } else if (line.match(/^[A-D]\)/)) {
        if (currentQuestion.options) {
          currentQuestion.options.push(line);
        }
      } else if (line.match(/^Answer:\s*[A-D]$/)) {
        currentQuestion.correctAnswer = line.replace('Answer: ', '');
        currentQuestion.category = this.categorizeQuestion(currentQuestion.questionText || '');
        currentQuestion.acsCode = this.matchACSCode(currentQuestion.questionText || '');
      }
    }

    if (currentQuestion.questionText) {
      questions.push(currentQuestion as QuestionData);
    }

    return questions;
  }

  private static categorizeQuestion(questionText: string): string {
    const text = questionText.toLowerCase();

    if (text.includes('fuel') || text.includes('range') || text.includes('endurance')) {
      return 'Flight Planning';
    }
    if (text.includes('altitude') || text.includes('airspace') || text.includes('traffic pattern')) {
      return 'Airspace and Traffic Patterns';
    }
    if (text.includes('weather') || text.includes('visibility') || text.includes('ceiling')) {
      return 'Weather';
    }
    if (text.includes('navigation') || text.includes('chart') || text.includes('compass')) {
      return 'Navigation';
    }
    if (text.includes('emergency') || text.includes('malfunction') || text.includes('failure')) {
      return 'Emergency Procedures';
    }
    if (text.includes('regulation') || text.includes('far') || text.includes('legal')) {
      return 'Regulations';
    }
    if (text.includes('performance') || text.includes('weight') || text.includes('balance')) {
      return 'Aircraft Performance';
    }
    if (text.includes('system') || text.includes('engine') || text.includes('electrical')) {
      return 'Aircraft Systems';
    }

    return 'General Knowledge';
  }

  private static matchACSCode(questionText: string): string {
    const { ACSCodeDatabase } = require('./acs-code-database');
    const matches = ACSCodeDatabase.findMatchingCodes(questionText, 1);
    return matches.length > 0 ? matches[0].code : 'PA.I.A.K1';
  }
}
