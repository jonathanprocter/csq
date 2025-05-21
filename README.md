# Couples Schema Questionnaire (CSQ)

An offline web-based questionnaire that helps couples assess relationship patterns using schema therapy concepts. The app contains everything needed to run in a web browser with no external dependencies.

## Features

- Interactive questionnaire with Likert-style questions
- Progress bar and navigation controls
- Local results page summarizing scores by schema
- Works entirely offline; questionnaire data is loaded from `data/questionnaire.json`

## Getting Started

1. Clone or download this repository.
2. Open `index.html` in any modern web browser.
   - If your browser restricts loading local files, serve the folder with a simple HTTP server (e.g. `npx http-server`).
3. Complete the questionnaire and click **See Results** to view your scores.

## Project Structure

```
index.html       – Main questionnaire page
results.html     – Displays scores after completion
script.js        – Application logic for loading questions and handling responses
results.js       – Logic for rendering saved scores
style.css        – Styles for both pages
data/questionnaire.json – Example questionnaire data
```

The `data/questionnaire.json` file provides a small sample dataset. You can expand it with additional schemas or questions following the same structure.

## Deployment

The application is completely static. Host the files on any web server or static site platform. Ensure all files remain in the same relative structure so the questionnaire data and scripts load correctly.

## Disclaimer

This questionnaire is for educational purposes only and is not a substitute for professional advice, diagnosis or treatment.

