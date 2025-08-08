#!/usr/bin/env node

/**
 * CFI Interactive Handbook - Private Pilot Content Structure Generator
 * 
 * This script creates the standardized folder structure for Private Pilot
 * handbook content based on FAA curriculum standards.
 */

const fs = require('fs');
const path = require('path');

// Private Pilot Course Structure based on FAA Standards
const PRIVATE_PILOT_STRUCTURE = [
  {
    folder: '01-aircraft-systems',
    title: 'Aircraft Systems',
    sections: [
      'powerplant-systems',
      'electrical-systems', 
      'hydraulic-systems',
      'flight-controls',
      'landing-gear',
      'fuel-systems',
      'environmental-systems'
    ]
  },
  {
    folder: '02-principles-of-flight',
    title: 'Principles of Flight',
    sections: [
      'airfoil-theory',
      'four-forces',
      'angle-of-attack',
      'stability-and-control',
      'stalls-and-spins',
      'load-factors'
    ]
  },
  {
    folder: '03-flight-instruments',
    title: 'Flight Instruments',
    sections: [
      'pitot-static-system',
      'gyroscopic-instruments',
      'magnetic-compass',
      'engine-instruments',
      'glass-cockpit-displays'
    ]
  },
  {
    folder: '04-flight-operations',
    title: 'Flight Operations',
    sections: [
      'preflight-procedures',
      'engine-start-and-taxi',
      'takeoff-and-climb',
      'cruise-flight',
      'approach-and-landing',
      'ground-operations'
    ]
  },
  {
    folder: '05-weather',
    title: 'Weather',
    sections: [
      'atmospheric-science',
      'weather-systems',
      'weather-reports-and-forecasts',
      'weather-hazards',
      'weather-decision-making'
    ]
  },
  {
    folder: '06-navigation',
    title: 'Navigation',
    sections: [
      'chart-reading',
      'pilotage-and-dead-reckoning',
      'radio-navigation',
      'gps-navigation',
      'electronic-flight-displays'
    ]
  },
  {
    folder: '07-regulations',
    title: 'Regulations',
    sections: [
      'certification-requirements',
      'general-operating-rules',
      'airworthiness-requirements',
      'maintenance-requirements',
      'medical-requirements'
    ]
  },
  {
    folder: '08-airspace',
    title: 'Airspace',
    sections: [
      'controlled-airspace',
      'uncontrolled-airspace', 
      'special-use-airspace',
      'airspace-requirements',
      'tfr-and-notams'
    ]
  },
  {
    folder: '09-communications',
    title: 'Communications',
    sections: [
      'radio-procedures',
      'atc-communications',
      'airport-communications',
      'emergency-communications',
      'light-gun-signals'
    ]
  },
  {
    folder: '10-performance',
    title: 'Performance',
    sections: [
      'performance-charts',
      'takeoff-performance',
      'cruise-performance',
      'landing-performance',
      'weight-and-balance'
    ]
  },
  {
    folder: '11-flight-planning',
    title: 'Flight Planning',
    sections: [
      'cross-country-planning',
      'route-selection',
      'fuel-planning',
      'weather-briefings',
      'flight-plan-filing'
    ]
  },
  {
    folder: '12-emergency-procedures',
    title: 'Emergency Procedures',
    sections: [
      'engine-failures',
      'electrical-failures',
      'navigation-equipment-failures',
      'weather-emergencies',
      'emergency-landings'
    ]
  },
  {
    folder: '99-practical-test',
    title: 'Practical Test',
    sections: [
      'oral-exam-prep',
      'flight-test-prep',
      'acs-standards',
      'common-mistakes',
      'checkride-day'
    ]
  }
];

function createDirectory(dirPath) {
  if (!fs.existsSync(dirPath)) {
    fs.mkdirSync(dirPath, { recursive: true });
    console.log(`✅ Created directory: ${dirPath}`);
  } else {
    console.log(`⚠️  Directory exists: ${dirPath}`);
  }
}

function createSectionIndexFile(dirPath, sectionData) {
  const indexPath = path.join(dirPath, 'page.mdx');
  
  if (fs.existsSync(indexPath)) {
    console.log(`⚠️  File exists: ${indexPath}`);
    return;
  }

  const content = `---
title: "${sectionData.title}"
description: "Overview of ${sectionData.title.toLowerCase()} in private pilot training"
category: "${sectionData.folder}"
order: ${parseInt(sectionData.folder.split('-')[0])}
status: "draft"
section_type: "overview"
total_lessons: ${sectionData.sections.length}
estimated_hours: "8-12 hours"
objectives:
  - "Master fundamental ${sectionData.title.toLowerCase()} concepts"
  - "Apply knowledge to practical flight operations" 
  - "Meet current ACS standards"
---

# {frontmatter.title}

## Section Overview

This section covers the essential knowledge areas for **{frontmatter.title.toLowerCase()}** in private pilot training. These topics form the foundation for safe and proficient flight operations.

## What You'll Learn

{frontmatter.objectives.map((objective, index) => (
  <div key={index}>✈️ {objective}</div>
))}

## Section Structure

This section contains **{frontmatter.total_lessons} lessons** with an estimated study time of **{frontmatter.estimated_hours}**.

### Lesson Topics

${sectionData.sections.map((section, index) => 
  `${index + 1}. **${section.split('-').map(word => word.charAt(0).toUpperCase() + word.slice(1)).join(' ')}** - [${section}.mdx](./${section})`
).join('\n')}

## Learning Path

```mermaid
graph TD
    A[Foundation Concepts] --> B[Systems Knowledge]
    B --> C[Normal Operations]
    C --> D[Emergency Procedures]
    D --> E[Practical Application]
    E --> F[ACS Standards]
```

## Prerequisites

Before starting this section, ensure you have completed:
- Basic aeronautical knowledge
- Aircraft familiarization
- Previous prerequisite sections

## Study Strategy

### Recommended Approach
1. **Read through overview** to understand big picture
2. **Complete lessons sequentially** - they build on each other
3. **Practice with scenarios** after each major concept
4. **Review regularly** to maintain knowledge retention

### Time Management
- **Daily Study**: 30-45 minutes per lesson
- **Weekly Review**: 1 hour consolidation 
- **Practical Application**: Regular flight training correlation

## Assessment & Standards

### Knowledge Requirements
This section prepares you for:
- Written examination questions
- Oral examination topics  
- Practical test scenarios

### ACS Integration
Content aligns with current FAA Airman Certification Standards (ACS) for Private Pilot certification.

## Getting Started

Ready to begin? Start with the first lesson in this section, or use the navigation menu to jump to a specific topic.

**Next**: Begin with [${sectionData.sections[0].split('-').map(word => word.charAt(0).toUpperCase() + word.slice(1)).join(' ')}](./${sectionData.sections[0]})

---

**Section Progress**: Track your completion as you work through each lesson  
**Estimated Completion Time**: {frontmatter.estimated_hours}  
**ACS Alignment**: ✅ Current standards
`;

  fs.writeFileSync(indexPath, content);
  console.log(`✅ Created section index: ${indexPath}`);
}

function createSubsectionPlaceholders(basePath, sections) {
  sections.forEach((section, index) => {
    const sectionPath = path.join(basePath, `${section}.mdx`);
    
    if (fs.existsSync(sectionPath)) {
      console.log(`⚠️  File exists: ${sectionPath}`);
      return;
    }

    const content = `---
title: "${section.split('-').map(word => word.charAt(0).toUpperCase() + word.slice(1)).join(' ')}"
description: "Learn about ${section.split('-').join(' ')} in aviation"
duration: "45 min"
category: "${basePath.split('/').pop()}"
section: "${section}"
order: ${index + 1}
status: "draft"
difficulty: "beginner"
prerequisites: []
objectives:
  - "Understand fundamental concepts"
  - "Identify key components and systems"
  - "Apply knowledge to flight operations"
keywords:
  - "${section}"
  - "private pilot"
  - "aviation"
acs_codes:
  - "PA.I.B.K1"
far_references:
  - "14 CFR 91.3"
author: "CFI Team"
last_updated: "${new Date().toISOString().split('T')[0]}"
version: "1.0"
---

# {frontmatter.title}

## Introduction

Brief introduction explaining what this lesson covers and why it's important for private pilots.

## Learning Objectives

By the end of this lesson, you should be able to:

{frontmatter.objectives.map((objective, index) => (
  <div key={index}>• {objective}</div>
))}

## Key Concepts

### Primary Concept Name

Explain the main concept with clear, practical examples.

**Important Points:**
- Key point 1
- Key point 2  
- Key point 3

### Secondary Concept

Additional concept explanation with aviation-specific examples.

## Practical Application

### Real-World Examples

Describe how this concept applies in actual flight operations.

### Common Scenarios

- **Scenario 1**: Description and explanation
- **Scenario 2**: Description and explanation

## Regulatory Requirements

{frontmatter.far_references && (
  <div>
    <h4>Applicable Regulations:</h4>
    <ul>
      {frontmatter.far_references.map((ref, index) => (
        <li key={index}>{ref}</li>
      ))}
    </ul>
  </div>
)}

## Memory Aids & Tips

### Mnemonics
- Create memorable acronyms for key procedures
- Use visual associations for complex concepts

### Study Tips
- Practice recommendations
- Common mistakes to avoid
- Review techniques

## Knowledge Check

### Review Questions

1. **Question 1**: Multiple choice or short answer question
   - Answer explanation

2. **Question 2**: Practical application question  
   - Answer explanation

### ACS Standards

{frontmatter.acs_codes && (
  <div>
    <p>This lesson addresses the following ACS standards:</p>
    <ul>
      {frontmatter.acs_codes.map((code, index) => (
        <li key={index}><strong>{code}</strong></li>
      ))}
    </ul>
  </div>
)}

## Further Study

### Recommended Resources
- FAA Handbook references
- Additional reading materials
- Video resources

### Next Steps
- Link to related lessons
- Suggested practice exercises

---

**Prerequisites**: {frontmatter.prerequisites.length > 0 ? frontmatter.prerequisites.join(', ') : 'None'}  
**Estimated Study Time**: {frontmatter.duration}  
**Last Updated**: {frontmatter.last_updated}
`;

    fs.writeFileSync(sectionPath, content);
    console.log(`✅ Created lesson placeholder: ${sectionPath}`);
  });
}

function generatePrivatePilotStructure(basePath = './content/handbook/private-pilot') {
  console.log('🚀 Generating Private Pilot Course Structure...\n');

  // Create base directory
  createDirectory(basePath);

  // Create each major section
  PRIVATE_PILOT_STRUCTURE.forEach(section => {
    const sectionPath = path.join(basePath, section.folder);
    createDirectory(sectionPath);
    
    // Create section index file
    createSectionIndexFile(sectionPath, section);
    
    // Create subsection placeholder files
    createSubsectionPlaceholders(sectionPath, section.sections);
    
    console.log(''); // Add spacing between sections
  });

  console.log('🎉 Private Pilot Course Structure Generated Successfully!');
  console.log('\n📋 Next Steps:');
  console.log('1. Review generated files and update content as needed');
  console.log('2. Update frontmatter with accurate ACS codes and regulations');
  console.log('3. Add actual lesson content to replace placeholder text');
  console.log('4. Test navigation and linking between lessons');
  console.log('5. Update order values for proper sequencing');
}

// Command line usage
if (require.main === module) {
  const args = process.argv.slice(2);
  const targetPath = args[0] || './content/handbook/private-pilot';
  
  console.log(`Target directory: ${path.resolve(targetPath)}\n`);
  generatePrivatePilotStructure(targetPath);
}

module.exports = { generatePrivatePilotStructure, PRIVATE_PILOT_STRUCTURE };