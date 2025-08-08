# CFI Interactive Handbook - Content Templates

## 📁 Private Pilot Course Structure

This template system provides a standardized structure for organizing Private Pilot Course content in the CFI Interactive Handbook.

## 🏗 Folder Structure Overview

```
content/handbook/private-pilot/
├── 01-aircraft-systems/           # Aircraft Systems & Components
├── 02-principles-of-flight/       # Aerodynamics & Flight Theory
├── 03-flight-instruments/         # Instruments & Navigation
├── 04-flight-operations/          # Normal & Emergency Procedures
├── 05-weather/                    # Meteorology & Weather Services
├── 06-navigation/                 # Navigation Systems & Procedures
├── 07-regulations/                # FAR/AIM & Legal Requirements
├── 08-airspace/                   # Airspace Classes & Requirements
├── 09-communications/             # Radio Communications & ATC
├── 10-performance/                # Aircraft Performance & Planning
├── 11-flight-planning/            # Cross-Country & Route Planning
├── 12-emergency-procedures/       # Emergency & Abnormal Situations
└── 99-practical-test/             # Checkride Prep & Standards
```

## 📝 Naming Conventions

### Folder Names
- **Numbered prefixes** (01-, 02-, etc.) for logical ordering
- **Kebab-case** for URLs (aircraft-systems, flight-instruments)
- **Descriptive names** that match FAA curriculum standards

### File Names
- **Descriptive MDX names** matching lesson content
- **Sequential numbering** within categories when needed
- **Examples**: 
  - `engine-systems.mdx`
  - `01-airfoil-theory.mdx`
  - `weather-reports-and-forecasts.mdx`

## 🎯 Content Organization Principles

1. **FAA Alignment**: Structure follows FAA Private Pilot curriculum
2. **Progressive Learning**: Content builds from basic to advanced concepts
3. **Logical Grouping**: Related topics grouped together
4. **Easy Navigation**: Clear hierarchy for students and instructors
5. **Scalability**: Room for expansion and additional content

## 📋 Usage Instructions

### Quick Start - Generate Full Structure

1. **Run the generator script** to create complete folder structure:
   ```bash
   node content-templates/folder-structure-generator.js
   ```

2. **Customize the target path** (optional):
   ```bash
   node content-templates/folder-structure-generator.js ./custom/path/private-pilot
   ```

### Manual Content Creation

1. **Choose appropriate category** from the 01-13 structure
2. **Use the MDX templates** provided in this folder
3. **Follow naming conventions** for consistency
4. **Update frontmatter** with accurate metadata
5. **Test navigation** after adding new content

### Template Selection Guide

- **Standard Lessons**: Use `mdx-template-lesson.mdx`
- **Section Overviews**: Use `mdx-template-section-index.mdx`  
- **Checkride Prep**: Use `mdx-template-practical-test.mdx`

### Content Development Workflow

1. **Generate Structure**: Run `folder-structure-generator.js` 
2. **Review Generated Files**: Check section indexes and lesson placeholders
3. **Update Frontmatter**: Add accurate ACS codes, FAR references, prerequisites
4. **Write Content**: Replace placeholder text with actual lesson content
5. **Test Integration**: Verify navigation and linking works correctly
6. **Quality Check**: Run linting and validate markdown

## 🚀 Generator Script Features

The `folder-structure-generator.js` script creates:
- ✅ **13 Major Sections** with proper numbering (01-12, 99)
- ✅ **Section Index Pages** with navigation and overview content
- ✅ **Lesson Placeholders** for each subsection topic
- ✅ **Proper Frontmatter** with ACS alignment and metadata
- ✅ **Mermaid Diagrams** for learning path visualization
- ✅ **Navigation Links** between related content

## 🔗 Template Files

- `mdx-template-lesson.mdx` - Standard lesson template with full frontmatter
- `mdx-template-section-index.mdx` - Section overview with navigation
- `mdx-template-practical-test.mdx` - Checkride preparation content
- `folder-structure-generator.js` - Automated structure creation script