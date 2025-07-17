# CFIPros.com - Simplified PRD
## Solo Developer Edition with Aggressive Referral & Quiz Import

### Version 5.0 | Date: January 2025

---

## 1. Project Overview

**What**: Khan Academy-style flight training with aggressive referral rewards and easy quiz content management.

**Key Features**:
- Cash + percentage referral rewards
- JSON quiz import with image support
- Khan Academy progression system
- FAA reference materials integration

---

## 2. Aggressive Referral Program

### Dual Reward System
```javascript
// REFERRER REWARDS (You who shared)
1 signup  = $10 credit
3 signups = $30 credit + 1 month free
5 signups = $50 credit + 2 months free
10 signups = $100 credit + 6 months free

// REFEREE REWARDS (New user)
First month: 50% off ($14.50 instead of $29)
Annual plan: $50 off ($240 instead of $290)
```

### Why This Works
- **Immediate value**: $10 per referral motivates sharing
- **Stacking rewards**: Credits + free months
- **New user incentive**: 50% off is aggressive
- **Annual push**: Better savings drives LTV

### Implementation
```jsx
// Referral tracking with cash credits
const referralRewards = {
  1: { credit: 10, freeMonths: 0 },
  3: { credit: 30, freeMonths: 1 },
  5: { credit: 50, freeMonths: 2 },
  10: { credit: 100, freeMonths: 6 }
};

// Apply rewards automatically
async function processReferral(referrerId, newUserId) {
  const referralCount = await getReferralCount(referrerId);
  const reward = referralRewards[referralCount];
  
  if (reward) {
    await addAccountCredit(referrerId, reward.credit);
    await addFreeMonths(referrerId, reward.freeMonths);
    await notifyUser(referrerId, reward);
  }
}
```

---

## 3. Khan Academy Style Learning

### Module Structure
```
Private Pilot Course
├── Unit 1: Principles of Flight
│   ├── Lesson 1.1: Four Forces (mastery required)
│   ├── Lesson 1.2: Lift Generation
│   ├── Practice: 5 questions (80% to pass)
│   ├── Lesson 1.3: Drag Types
│   └── Unit Test: 10 questions (must pass)
│
├── Unit 2: Aircraft Systems (locked until Unit 1 complete)
```

### Mastery Learning
```javascript
// Khan Academy progression logic
const MASTERY_THRESHOLD = 0.8; // 80% correct

function canProgressToNext(userId, currentLesson) {
  const quizScore = await getQuizScore(userId, currentLesson);
  return quizScore >= MASTERY_THRESHOLD;
}

// Force practice until mastery
if (!canProgressToNext()) {
  return <PracticeMorePrompt />;
}
```

### Visual Progress
```jsx
// Khan Academy style progress indicators
<ProgressBar>
  <Module status="mastered" />     // Green
  <Module status="practiced" />    // Blue  
  <Module status="struggling" />   // Orange
  <Module status="not-started" />  // Gray
</ProgressBar>
```

---

## 4. Quiz Import System

### JSON Format for LLM Generation
```json
{
  "quiz_title": "Aerodynamics Basics",
  "acs_codes": ["PA.I.F.K1", "PA.I.F.K2"],
  "questions": [
    {
      "id": "aero_001",
      "question": "What are the four forces acting on an aircraft in flight?",
      "type": "multiple_choice",
      "options": [
        "Lift, Weight, Thrust, Drag",
        "Lift, Mass, Power, Friction",
        "Up, Down, Forward, Backward",
        "Lift, Gravity, Engine, Wind"
      ],
      "correct_answer": 0,
      "explanation": "The four forces are Lift (opposes weight), Weight (gravity), Thrust (opposes drag), and Drag (air resistance).",
      "image_reference": {
        "url": "/images/faa/four-forces-diagram.png",
        "caption": "Figure 1-1: Four Forces of Flight",
        "source": "FAA Airplane Flying Handbook"
      },
      "difficulty": "easy",
      "points": 1
    },
    {
      "id": "aero_002",
      "question": "Refer to Figure 2-3. At what angle of attack does the wing stall?",
      "type": "multiple_choice",
      "image_reference": {
        "url": "/images/faa/angle-of-attack-chart.png",
        "caption": "Figure 2-3: Lift Coefficient vs Angle of Attack",
        "required": true
      },
      "options": ["10°", "15°", "18°", "20°"],
      "correct_answer": 2,
      "explanation": "The chart shows maximum lift coefficient at 18° angle of attack, after which the wing stalls."
    }
  ]
}
```

### Import Interface
```jsx
// Admin panel for quiz import
export default function QuizImporter() {
  const [jsonFile, setJsonFile] = useState(null);
  
  async function handleImport() {
    const data = JSON.parse(await jsonFile.text());
    
    // Validate structure
    if (!validateQuizFormat(data)) {
      return alert('Invalid format');
    }
    
    // Upload images to storage
    for (const q of data.questions) {
      if (q.image_reference?.url) {
        q.image_reference.url = await uploadImage(q.image_reference.url);
      }
    }
    
    // Save to database
    await supabase.from('quiz_imports').insert({
      title: data.quiz_title,
      questions: data.questions,
      acs_codes: data.acs_codes
    });
    
    toast.success(`Imported ${data.questions.length} questions`);
  }
  
  return (
    <div className="p-6">
      <h2>Import Quiz Questions</h2>
      <input 
        type="file" 
        accept=".json"
        onChange={(e) => setJsonFile(e.target.files[0])}
      />
      <button onClick={handleImport}>Import Questions</button>
      
      <details className="mt-4">
        <summary>JSON Format Guide</summary>
        <pre>{JSON.stringify(sampleFormat, null, 2)}</pre>
      </details>
    </div>
  );
}
```

---

## 5. Image Support System

### FAA Reference Integration
```jsx
// Question component with image support
function QuizQuestion({ question }) {
  return (
    <div className="space-y-4">
      {question.image_reference && (
        <div className="border rounded-lg p-4">
          <img 
            src={question.image_reference.url} 
            alt={question.image_reference.caption}
            className="max-w-full h-auto"
          />
          <p className="text-sm text-gray-600 mt-2">
            {question.image_reference.caption}
          </p>
        </div>
      )}
      
      <h3 className="text-lg font-medium">{question.question}</h3>
      
      <RadioGroup>
        {question.options.map((option, i) => (
          <RadioOption key={i} value={i}>{option}</RadioOption>
        ))}
      </RadioGroup>
    </div>
  );
}
```

### Image Storage
```javascript
// Store FAA reference images
/public/images/faa/
├── charts/
│   ├── weight-balance-chart.png
│   ├── performance-charts.png
│   └── weather-charts.png
├── diagrams/
│   ├── aircraft-systems.png
│   └── airport-markings.png
└── references/
    ├── sectional-excerpts.png
    └── approach-plates.png
```

---

## 6. Database Schema Updates

```sql
-- Enhanced quiz storage
quiz_questions (
  id, module_id, question_data jsonb,
  -- question_data includes:
  -- question, options, correct_answer,
  -- explanation, image_reference, difficulty
  imported_at, import_batch_id
)

-- Referral tracking
referrals (
  id, referrer_id, referee_id,
  status, discount_applied,
  credit_awarded, months_awarded,
  created_at
)

-- User credits
user_account (
  user_id, cash_credits, free_months,
  subscription_end_date
)

-- Khan Academy style progress
user_mastery (
  user_id, lesson_id, 
  attempts, best_score,
  mastery_status, last_attempt
)
```

---

## 7. LLM Question Generation Guide

### Prompt Template for GPT-4
```markdown
Generate FAA Private Pilot quiz questions in this JSON format:

{
  "quiz_title": "[Topic Name]",
  "acs_codes": ["PA.I.X.XX"],
  "questions": [
    {
      "id": "[unique_id]",
      "question": "[Clear question text]",
      "type": "multiple_choice",
      "options": ["4 options required"],
      "correct_answer": [0-3],
      "explanation": "[Why this answer is correct]",
      "image_reference": {
        "url": "[if referencing FAA figure]",
        "caption": "Figure X-X: [Description]"
      },
      "difficulty": "easy|medium|hard"
    }
  ]
}

Requirements:
- Base questions on FAA test standards
- Include image references for charts/diagrams
- Vary difficulty levels
- Provide clear explanations
- Use FAA terminology
```

---

## 8. Referral Dashboard

```jsx
export default function ReferralHub() {
  const stats = await getReferralStats(user.id);
  
  return (
    <div className="max-w-4xl mx-auto p-6">
      {/* Hero Section */}
      <div className="bg-gradient-to-r from-blue-500 to-blue-600 text-white rounded-lg p-8">
        <h1 className="text-3xl font-bold">Earn Cash & Free Months!</h1>
        <p className="text-xl mt-2">Share CFIPros and earn up to $100 + 6 months free</p>
        
        <div className="mt-6 bg-white/20 rounded p-4">
          <p className="text-sm">Your referral link:</p>
          <div className="flex gap-2 mt-2">
            <input 
              value={`cfipros.com/ref/${user.referral_code}`}
              className="flex-1 bg-white/30 rounded px-3 py-2"
              readOnly
            />
            <button className="bg-white text-blue-600 px-4 py-2 rounded">
              Copy
            </button>
          </div>
        </div>
      </div>
      
      {/* Stats Grid */}
      <div className="grid grid-cols-4 gap-4 mt-8">
        <StatCard 
          label="Total Referrals" 
          value={stats.total}
          icon="users"
        />
        <StatCard 
          label="Converted" 
          value={stats.converted}
          icon="check"
        />
        <StatCard 
          label="Cash Earned" 
          value={`$${stats.cash_earned}`}
          icon="dollar"
        />
        <StatCard 
          label="Free Months" 
          value={stats.free_months}
          icon="calendar"
        />
      </div>
      
      {/* Progress to Next Reward */}
      <RewardProgress 
        current={stats.converted}
        nextTarget={getNextRewardTarget(stats.converted)}
      />
      
      {/* Share Templates */}
      <ShareTemplates code={user.referral_code} />
    </div>
  );
}
```

---

## 9. Implementation Timeline

### Week 1-2: Core Setup
- Railway deployment
- Database with JSON support
- Basic auth + referral codes

### Week 3: Khan Academy System
- Mastery-based progression
- Module locking logic
- Progress visualization

### Week 4: Quiz Import
- JSON upload interface
- Image handling
- Validation system

### Week 5: Referral Program
- Credit system
- Reward automation
- Dashboard UI

### Week 6: Content Creation
- Import 500+ questions
- Upload FAA images
- Create first 20 videos

### Week 7: Polish & Launch
- Testing all flows
- Payment integration
- Launch campaign

---

## 10. Quick Implementation Tips

### Quiz Import Workflow
```bash
1. Generate questions with GPT-4
2. Save as formatted JSON
3. Upload via admin panel
4. Auto-distribute to modules
5. Track performance metrics
```

### Referral Email Templates
```javascript
// Automated emails
const templates = {
  referral_milestone: {
    subject: "🎉 You earned ${amount} in credits!",
    body: "Your friend just signed up..."
  },
  
  monthly_summary: {
    subject: "Your CFIPros rewards this month",
    body: "You've earned ${credits} and ${months} free..."
  }
};
```

---

## Summary

**Key Differentiators**:
1. **$10 per referral** + stacking rewards
2. **Khan Academy mastery** learning
3. **JSON quiz import** for rapid content
4. **FAA images** in questions

**Revenue Model**:
- $29/month or $290/year
- 50% off first month via referral
- Credits reduce future payments

**Growth Strategy**:
- Each user refers 2.5 people average
- 50% conversion on referrals
- Viral coefficient: 1.25

**Simple Tech**:
- Next.js + Railway
- JSON quiz storage
- Basic image CDN
- Stripe for payments

This aggressive referral program + easy content management = rapid growth!