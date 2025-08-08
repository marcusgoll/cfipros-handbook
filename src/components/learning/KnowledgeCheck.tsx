'use client';

import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';

type Question = {
  id: string;
  question: string;
  options: string[];
  correctAnswer: number;
  explanation: string;
  hint?: string;
  category: string;
  difficulty: 'easy' | 'medium' | 'hard';
};

type KnowledgeCheckProps = {
  questions: Question[];
  title?: string;
  passingScore?: number; // percentage
  onComplete?: (score: number, passed: boolean) => void;
};

export function KnowledgeCheck({ 
  questions, 
  title = "Knowledge Check", 
  passingScore = 70,
  onComplete 
}: KnowledgeCheckProps) {
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [answers, setAnswers] = useState<Array<number | null>>(new Array(questions.length).fill(null));
  const [showResults, setShowResults] = useState(false);
  const [selectedAnswer, setSelectedAnswer] = useState<number | null>(null);

  if (!questions.length) {
    return <div>No questions available</div>;
  }

  const currentQuestion = questions[currentQuestionIndex];
  const progress = ((currentQuestionIndex) / questions.length) * 100;
  
  // Calculate results
  const correctAnswers = answers.reduce((acc, answer, index) => {
    return answer === questions[index]?.correctAnswer ? acc + 1 : acc;
  }, 0);
  const score = Math.round((correctAnswers / questions.length) * 100);
  const passed = score >= passingScore;

  useEffect(() => {
    if (showResults && onComplete) {
      onComplete(score, passed);
    }
  }, [showResults, score, passed, onComplete]);

  const handleAnswerSelect = (answerIndex: number) => {
    if (!showResults) {
      setSelectedAnswer(answerIndex);
    }
  };

  const handleNext = () => {
    if (selectedAnswer !== null) {
      const newAnswers = [...answers];
      newAnswers[currentQuestionIndex] = selectedAnswer;
      setAnswers(newAnswers);
    }

    if (currentQuestionIndex < questions.length - 1) {
      setCurrentQuestionIndex(currentQuestionIndex + 1);
      setSelectedAnswer(answers[currentQuestionIndex + 1] ?? null);
    } else {
      setShowResults(true);
    }
  };

  const handlePrevious = () => {
    if (currentQuestionIndex > 0) {
      setCurrentQuestionIndex(currentQuestionIndex - 1);
      setSelectedAnswer(answers[currentQuestionIndex - 1] ?? null);
    }
  };

  const handleRestart = () => {
    setCurrentQuestionIndex(0);
    setAnswers(new Array(questions.length).fill(null));
    setShowResults(false);
    setSelectedAnswer(null);
  };

  if (showResults) {
    return (
      <Card className="my-6">
        <CardHeader>
          <CardTitle className="flex items-center justify-between">
            <span className="flex items-center gap-2">
              {passed ? '🎉' : '📚'} {title} Results
            </span>
            <Badge variant={passed ? "default" : "secondary"} className={
              passed ? "bg-green-100 text-green-800" : "bg-amber-100 text-amber-800"
            }>
              {score}% {passed ? 'Passed' : 'Review Needed'}
            </Badge>
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Score Summary */}
          <div className={`p-4 rounded-lg ${
            passed ? 'bg-green-50 border border-green-200 dark:bg-green-950/20' : 
                    'bg-amber-50 border border-amber-200 dark:bg-amber-950/20'
          }`}>
            <div className="flex items-center justify-between mb-3">
              <span className="font-medium">
                {correctAnswers} of {questions.length} correct
              </span>
              <span className="text-2xl font-bold">{score}%</span>
            </div>
            <Progress value={score} className="h-2" />
            <p className={`mt-3 text-sm ${
              passed ? 'text-green-700 dark:text-green-300' : 'text-amber-700 dark:text-amber-300'
            }`}>
              {passed ? 
                'Great work! You\'ve mastered this content.' : 
                `You need ${passingScore}% to pass. Review the material and try again.`
              }
            </p>
          </div>

          {/* Question Review */}
          <div className="space-y-4">
            <h3 className="font-semibold">Question Review</h3>
            {questions.map((question, index) => {
              const userAnswer = answers[index];
              const isCorrect = userAnswer !== null && userAnswer === question.correctAnswer;
              
              return (
                <Card key={question.id} className={`border-l-4 ${
                  isCorrect ? 'border-l-green-500' : 'border-l-red-500'
                }`}>
                  <CardContent className="p-4">
                    <div className="flex items-start gap-3">
                      <span className={`text-lg ${
                        isCorrect ? 'text-green-600' : 'text-red-600'
                      }`}>
                        {isCorrect ? '✅' : '❌'}
                      </span>
                      <div className="flex-1">
                        <h4 className="font-medium mb-2">Q{index + 1}: {question.question}</h4>
                        <div className="text-sm space-y-1">
                          <p>
                            <strong>Your answer:</strong>{' '}
                            <span className={isCorrect ? 'text-green-700' : 'text-red-700'}>
                              {userAnswer !== null ? question.options[userAnswer] : 'No answer'}
                            </span>
                          </p>
                          {!isCorrect && (
                            <p>
                              <strong>Correct answer:</strong>{' '}
                              <span className="text-green-700">
                                {question.options[question.correctAnswer]}
                              </span>
                            </p>
                          )}
                          <p className="text-muted-foreground pt-2">
                            <strong>Explanation:</strong> {question.explanation}
                          </p>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>

          {/* Actions */}
          <div className="flex gap-3">
            <Button onClick={handleRestart} variant="outline">
              Try Again
            </Button>
            {!passed && (
              <Button asChild>
                <a href="#lesson-content">Review Lesson</a>
              </Button>
            )}
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="my-6">
      <CardHeader>
        <CardTitle className="flex items-center justify-between">
          <span className="flex items-center gap-2">
            🧠 {title}
          </span>
          <Badge variant="outline">
            {currentQuestionIndex + 1} of {questions.length}
          </Badge>
        </CardTitle>
        
        {/* Progress Bar */}
        <div className="space-y-2">
          <div className="flex justify-between text-sm text-muted-foreground">
            <span>Progress</span>
            <span>{Math.round(progress)}%</span>
          </div>
          <Progress value={progress} className="h-2" />
        </div>
      </CardHeader>
      
      <CardContent className="space-y-6">
        {/* Question */}
        <div>
          <div className="flex items-center gap-2 mb-3">
            <Badge variant="secondary" className="text-xs">
              {currentQuestion.category}
            </Badge>
            <Badge variant="outline" className={`text-xs ${
              currentQuestion.difficulty === 'hard' ? 'border-red-300 text-red-700' :
              currentQuestion.difficulty === 'medium' ? 'border-amber-300 text-amber-700' :
              'border-green-300 text-green-700'
            }`}>
              {currentQuestion.difficulty}
            </Badge>
          </div>
          
          <h3 className="text-lg font-medium mb-4">
            {currentQuestion.question}
          </h3>
        </div>

        {/* Answer Options */}
        <div className="space-y-3">
          {currentQuestion.options.map((option, index) => (
            <label
              key={index}
              className={`flex items-center space-x-3 p-4 rounded-lg cursor-pointer transition-all ${
                selectedAnswer === index
                  ? 'bg-primary/10 border-2 border-primary/50'
                  : 'bg-muted/30 border-2 border-transparent hover:bg-muted/50'
              }`}
              onClick={() => handleAnswerSelect(index)}
            >
              <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center ${
                selectedAnswer === index
                  ? 'bg-primary border-primary'
                  : 'border-muted-foreground'
              }`}>
                {selectedAnswer === index && (
                  <div className="w-2.5 h-2.5 rounded-full bg-white"></div>
                )}
              </div>
              <span className={selectedAnswer === index ? 'font-medium' : ''}>
                {option}
              </span>
            </label>
          ))}
        </div>

        {/* Hint */}
        {currentQuestion.hint && (
          <details className="group">
            <summary className="cursor-pointer text-sm text-primary hover:underline">
              💡 Need a hint?
            </summary>
            <div className="mt-2 p-3 bg-blue-50 border border-blue-200 rounded-lg dark:bg-blue-950/20">
              <p className="text-sm text-blue-800 dark:text-blue-200">
                {currentQuestion.hint}
              </p>
            </div>
          </details>
        )}

        {/* Navigation */}
        <div className="flex justify-between">
          <Button
            onClick={handlePrevious}
            disabled={currentQuestionIndex === 0}
            variant="outline"
          >
            ← Previous
          </Button>
          
          <Button
            onClick={handleNext}
            disabled={selectedAnswer === null}
            className="bg-primary hover:bg-primary/90"
          >
            {currentQuestionIndex === questions.length - 1 ? 'Finish' : 'Next →'}
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}