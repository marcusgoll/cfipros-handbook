'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Checkbox } from '@/components/ui/checkbox';
import { Badge } from '@/components/ui/badge';

// Knowledge Check Question Component (Khan Academy style)
export function KnowledgeCheck({
  question,
  options,
  correctAnswer,
  explanation,
  hint
}: {
  question: string;
  options: string[];
  correctAnswer: number;
  explanation: string;
  hint?: string;
}) {
  const [selectedAnswer, setSelectedAnswer] = useState<number | null>(null);
  const [showResult, setShowResult] = useState(false);
  const [showHint, setShowHint] = useState(false);

  const handleSubmit = () => {
    if (selectedAnswer !== null) {
      setShowResult(true);
    }
  };

  const handleReset = () => {
    setSelectedAnswer(null);
    setShowResult(false);
    setShowHint(false);
  };

  const isCorrect = selectedAnswer === correctAnswer;

  return (
    <Card className="my-6 border-blue-200 bg-blue-50/50 dark:border-blue-800 dark:bg-blue-950/20">
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-lg">
          <span className="text-blue-600">🧠</span>
          Knowledge Check
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <p className="font-medium">{question}</p>
        
        <div className="space-y-2">
          {options.map((option, index) => (
            <label
              key={index}
              className={`flex items-center space-x-3 p-3 rounded-lg cursor-pointer transition-colors ${
                showResult
                  ? index === correctAnswer
                    ? 'bg-green-100 border border-green-300 dark:bg-green-950/30 dark:border-green-700'
                    : selectedAnswer === index && !isCorrect
                    ? 'bg-red-100 border border-red-300 dark:bg-red-950/30 dark:border-red-700'
                    : 'bg-gray-50 border border-gray-200 dark:bg-gray-800 dark:border-gray-700'
                  : selectedAnswer === index
                  ? 'bg-blue-100 border border-blue-300 dark:bg-blue-950/30 dark:border-blue-700'
                  : 'bg-gray-50 border border-gray-200 hover:bg-gray-100 dark:bg-gray-800 dark:border-gray-700 dark:hover:bg-gray-700'
              }`}
            >
              <input
                type="radio"
                name="answer"
                value={index}
                checked={selectedAnswer === index}
                onChange={() => !showResult && setSelectedAnswer(index)}
                disabled={showResult}
                className="sr-only"
              />
              <div className={`w-4 h-4 rounded-full border-2 flex items-center justify-center ${
                showResult && index === correctAnswer
                  ? 'bg-green-500 border-green-500'
                  : showResult && selectedAnswer === index && !isCorrect
                  ? 'bg-red-500 border-red-500'
                  : selectedAnswer === index
                  ? 'bg-blue-500 border-blue-500'
                  : 'border-gray-300'
              }`}>
                {((showResult && index === correctAnswer) || (selectedAnswer === index)) && (
                  <div className="w-2 h-2 rounded-full bg-white"></div>
                )}
              </div>
              <span className={showResult && index === correctAnswer ? 'font-medium' : ''}>
                {option}
              </span>
              {showResult && index === correctAnswer && (
                <Badge variant="secondary" className="ml-auto bg-green-100 text-green-800">
                  Correct
                </Badge>
              )}
            </label>
          ))}
        </div>

        <div className="flex gap-2">
          {!showResult ? (
            <>
              <Button 
                onClick={handleSubmit} 
                disabled={selectedAnswer === null}
                className="bg-blue-600 hover:bg-blue-700"
              >
                Check Answer
              </Button>
              {hint && (
                <Button
                  variant="outline"
                  onClick={() => setShowHint(!showHint)}
                >
                  {showHint ? 'Hide Hint' : 'Show Hint'}
                </Button>
              )}
            </>
          ) : (
            <Button variant="outline" onClick={handleReset}>
              Try Again
            </Button>
          )}
        </div>

        {showHint && hint && (
          <div className="p-3 bg-amber-50 border border-amber-200 rounded-lg dark:bg-amber-950/20 dark:border-amber-800">
            <p className="text-sm text-amber-800 dark:text-amber-200">
              <strong>💡 Hint:</strong> {hint}
            </p>
          </div>
        )}

        {showResult && (
          <div className={`p-4 rounded-lg ${
            isCorrect 
              ? 'bg-green-50 border border-green-200 dark:bg-green-950/20 dark:border-green-800'
              : 'bg-red-50 border border-red-200 dark:bg-red-950/20 dark:border-red-800'
          }`}>
            <p className={`font-medium ${
              isCorrect ? 'text-green-800 dark:text-green-200' : 'text-red-800 dark:text-red-200'
            }`}>
              {isCorrect ? '✅ Correct!' : '❌ Incorrect'}
            </p>
            <p className={`mt-2 text-sm ${
              isCorrect ? 'text-green-700 dark:text-green-300' : 'text-red-700 dark:text-red-300'
            }`}>
              {explanation}
            </p>
          </div>
        )}
      </CardContent>
    </Card>
  );
}

// Learning Objectives Checklist (Teachable style)
export function LearningObjectives({
  objectives,
  title = "Learning Objectives"
}: {
  objectives: string[];
  title?: string;
}) {
  const [checkedItems, setCheckedItems] = useState<boolean[]>(
    new Array(objectives.length).fill(false)
  );

  const toggleItem = (index: number) => {
    const newCheckedItems = [...checkedItems];
    newCheckedItems[index] = !newCheckedItems[index];
    setCheckedItems(newCheckedItems);
  };

  const completedCount = checkedItems.filter(Boolean).length;
  const progressPercentage = (completedCount / objectives.length) * 100;

  return (
    <Card className="my-6 border-purple-200 bg-purple-50/50 dark:border-purple-800 dark:bg-purple-950/20">
      <CardHeader>
        <CardTitle className="flex items-center justify-between">
          <span className="flex items-center gap-2">
            <span className="text-purple-600">🎯</span>
            {title}
          </span>
          <Badge variant="secondary" className="bg-purple-100 text-purple-800">
            {completedCount}/{objectives.length}
          </Badge>
        </CardTitle>
        
        {/* Progress bar */}
        <div className="w-full bg-gray-200 rounded-full h-2 dark:bg-gray-700">
          <div 
            className="bg-purple-600 h-2 rounded-full transition-all duration-300"
            style={{ width: `${progressPercentage}%` }}
          ></div>
        </div>
      </CardHeader>
      
      <CardContent>
        <div className="space-y-3">
          {objectives.map((objective, index) => (
            <label
              key={index}
              className="flex items-start gap-3 cursor-pointer group"
            >
              <Checkbox
                checked={checkedItems[index]}
                onCheckedChange={() => toggleItem(index)}
                className="mt-1"
              />
              <span className={`text-sm transition-colors ${
                checkedItems[index] 
                  ? 'line-through text-muted-foreground' 
                  : 'group-hover:text-purple-700 dark:group-hover:text-purple-300'
              }`}>
                {objective}
              </span>
            </label>
          ))}
        </div>
        
        {completedCount === objectives.length && (
          <div className="mt-4 p-3 bg-green-50 border border-green-200 rounded-lg dark:bg-green-950/20 dark:border-green-800">
            <p className="text-green-800 dark:text-green-200 font-medium">
              🎉 All objectives completed! Great work!
            </p>
          </div>
        )}
      </CardContent>
    </Card>
  );
}

// ACS Reference Component
export function ACSReference({
  code,
  title,
  description
}: {
  code: string;
  title: string;
  description: string;
}) {
  return (
    <Card className="my-4 border-indigo-200 bg-indigo-50/50 dark:border-indigo-800 dark:bg-indigo-950/20">
      <CardContent className="p-4">
        <div className="flex items-start gap-3">
          <Badge variant="secondary" className="bg-indigo-100 text-indigo-800 font-mono">
            {code}
          </Badge>
          <div>
            <h4 className="font-semibold text-indigo-900 dark:text-indigo-100">
              {title}
            </h4>
            <p className="text-sm text-indigo-700 dark:text-indigo-300 mt-1">
              {description}
            </p>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

// FAR Reference Component
export function FARReference({
  section,
  title,
  summary
}: {
  section: string;
  title: string;
  summary: string;
}) {
  return (
    <Card className="my-4 border-red-200 bg-red-50/50 dark:border-red-800 dark:bg-red-950/20">
      <CardContent className="p-4">
        <div className="flex items-start gap-3">
          <Badge variant="secondary" className="bg-red-100 text-red-800 font-mono">
            {section}
          </Badge>
          <div>
            <h4 className="font-semibold text-red-900 dark:text-red-100">
              {title}
            </h4>
            <p className="text-sm text-red-700 dark:text-red-300 mt-1">
              {summary}
            </p>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

// Export all interactive components
export const InteractiveElements = {
  KnowledgeCheck,
  LearningObjectives,
  ACSReference,
  FARReference,
};