// IMPORTANT: If the JavaScript is not working it is most probably because it relies on external libraries that are linked in the index.html file - however, if you don't have the permission to access them, it's better not to link them.

// Please keep in mind that JS files might also be obfuscated to prevent people from stealing the code and animations.

// However, all the HTML elements and CSS are there are you just need to access them using JS.

/**
 * Couples Schema Questionnaire - Question Data
 * This file loads and structures the questionnaire data
 */

// Schema data structure
let schemaData = null;

// Load the questionnaire data from JSON file
async function loadQuestionnaireData() {
    try {
        // Fetch the questionnaire data from the local data directory
        // The original code expected the script to live inside a `js` folder
        // and used a relative path starting with `../`. In this project the
        // script sits at the repository root, so we fetch directly from
        // `data/questionnaire.json`.
        const response = await fetch('data/questionnaire.json');
        if (!response.ok) {
            throw new Error('Failed to load questionnaire data');
        }

        const data = await response.json();
        schemaData = data.schemas;

        // Validate the data structure
        if (!Array.isArray(schemaData) || schemaData.length === 0) {
            throw new Error('Invalid questionnaire data structure');
        }

        return schemaData;
    } catch (error) {
        // Display error message to user
        const errorMessage = document.createElement('div');
        errorMessage.className = 'error-message content-box';
        errorMessage.innerHTML = `
            <h3>Error Loading Questionnaire</h3>
            <p>We encountered a problem loading the questionnaire data. Please try refreshing the page or contact support if the problem persists.</p>
            <p>Error details: ${error.message}</p>
        `;

        // Insert error message at the beginning of the main content
        const mainContent = document.querySelector('main .container');
        if (mainContent) {
            mainContent.prepend(errorMessage);
        }

        return null;
    }
}

// Get all questions as a flat array
function getAllQuestions() {
    if (!schemaData) return [];

    return schemaData.reduce((allQuestions, schema) => {
        return allQuestions.concat(schema.questions.map(question => ({
            ...question,
            schemaName: schema.name
        })));
    }, []);
}

// Get questions for a specific schema
function getQuestionsForSchema(schemaId) {
    if (!schemaData) return [];

    const schema = schemaData.find(s => s.id === schemaId);
    return schema ? schema.questions : [];
}

// Get schema by ID
function getSchemaById(schemaId) {
    if (!schemaData) return null;

    return schemaData.find(schema => schema.id === schemaId);
}

// Get all schemas
function getAllSchemas() {
    return schemaData || [];
}

// Calculate score for a specific schema based on responses
function calculateSchemaScore(schemaId, responses) {
    const questions = getQuestionsForSchema(schemaId);

    if (!questions.length) return 0;

    return questions.reduce((score, question) => {
        const response = responses[question.id];
        return score + (response !== undefined ? parseInt(response) : 0);
    }, 0);
}

// Calculate scores for all schemas
function calculateAllSchemaScores(responses) {
    if (!schemaData) return [];

    return schemaData.map(schema => {
        const score = calculateSchemaScore(schema.id, responses);

        return {
            id: schema.id,
            name: schema.name,
            description: schema.description,
            score: score,
            maxPossibleScore: schema.questions.length * 4, // 4 is max score per question
            percentage: (score / (schema.questions.length * 4)) * 100
        };
    });
}

// Export the functions for use in other scripts
window.questionnaireData = {
    loadQuestionnaireData,
    getAllQuestions,
    getQuestionsForSchema,
    getSchemaById,
    getAllSchemas,
    calculateSchemaScore,
    calculateAllSchemaScores
};/**
 * Couples Schema Questionnaire - Main Application Logic
 * This file handles the questionnaire functionality, navigation, and form submission
 */

// Application state
const state = {
    currentQuestionIndex: 0,
    responses: {},
    questions: [],
    schemas: []
};

// DOM elements
const elements = {
    introSection: document.getElementById('introduction'),
    questionnaireSection: document.getElementById('questionnaire'),
    startButton: document.getElementById('start-questionnaire'),
    questionContainer: document.getElementById('question-container'),
    progressFill: document.getElementById('progress-fill'),
    currentQuestionSpan: document.getElementById('current-question'),
    totalQuestionsSpan: document.getElementById('total-questions'),
    prevButton: document.getElementById('prev-button'),
    nextButton: document.getElementById('next-button'),
    submitButton: document.getElementById('submit-button'),
    questionnaireForm: document.getElementById('questionnaire-form')
};

// Initialize the application
async function initApp() {
    try {
        // Load questionnaire data
        const schemas = await window.questionnaireData.loadQuestionnaireData();
        if (!schemas) return;

        state.schemas = schemas;
        state.questions = window.questionnaireData.getAllQuestions();

        // Set up event listeners
        setupEventListeners();

        // Update total questions count
        elements.totalQuestionsSpan.textContent = state.questions.length;
    } catch (error) {
        displayError('Error initializing application: ' + error.message);
    }
}

// Display error message
function displayError(message) {
    const errorMessage = document.createElement('div');
    errorMessage.className = 'error-message content-box';
    errorMessage.innerHTML = `
        <h3>Error</h3>
        <p>${message}</p>
    `;

    // Insert error message at the beginning of the main content
    const mainContent = document.querySelector('main .container');
    if (mainContent) {
        mainContent.prepend(errorMessage);
    }
}

// Set up event listeners
function setupEventListeners() {
    // Start questionnaire button
    elements.startButton.addEventListener('click', startQuestionnaire);

    // Navigation buttons
    elements.prevButton.addEventListener('click', goToPreviousQuestion);
    elements.nextButton.addEventListener('click', goToNextQuestion);

    // Form submission
    elements.questionnaireForm.addEventListener('submit', handleFormSubmit);
}

// Start the questionnaire
function startQuestionnaire() {
    // Hide introduction, show questionnaire
    elements.introSection.classList.remove('active-section');
    elements.introSection.classList.add('hidden-section');
    elements.questionnaireSection.classList.remove('hidden-section');
    elements.questionnaireSection.classList.add('active-section');

    // Display first question
    displayCurrentQuestion();
}

// Display the current question
function displayCurrentQuestion() {
    const question = state.questions[state.currentQuestionIndex];
    if (!question) return;

    // Clear previous question
    elements.questionContainer.innerHTML = '';

    // Create question element
    const questionElement = document.createElement('div');
    questionElement.className = 'question-item';

    // Get schema information
    const schema = window.questionnaireData.getSchemaById(question.schema_id);

    // Build question HTML
    questionElement.innerHTML = `
        <h3 class="question-text">${question.text}</h3>
        <div class="schema-category">Category: <span>${schema ? schema.name : 'Unknown'}</span></div>
        
        <div class="likert-scale">
            <div class="likert-option">
                <input type="radio" name="q${question.id}" id="q${question.id}-0" value="0" 
                    ${state.responses[question.id] === '0' ? 'checked' : ''}>
                <label for="q${question.id}-0">0<span class="option-text">Disagree</span></label>
            </div>
            <div class="likert-option">
                <input type="radio" name="q${question.id}" id="q${question.id}-1" value="1"
                    ${state.responses[question.id] === '1' ? 'checked' : ''}>
                <label for="q${question.id}-1">1<span class="option-text">Neither agree nor disagree</span></label>
            </div>
            <div class="likert-option">
                <input type="radio" name="q${question.id}" id="q${question.id}-2" value="2"
                    ${state.responses[question.id] === '2' ? 'checked' : ''}>
                <label for="q${question.id}-2">2<span class="option-text">Slightly agree</span></label>
            </div>
            <div class="likert-option">
                <input type="radio" name="q${question.id}" id="q${question.id}-3" value="3"
                    ${state.responses[question.id] === '3' ? 'checked' : ''}>
                <label for="q${question.id}-3">3<span class="option-text">Agree</span></label>
            </div>
            <div class="likert-option">
                <input type="radio" name="q${question.id}" id="q${question.id}-4" value="4"
                    ${state.responses[question.id] === '4' ? 'checked' : ''}>
                <label for="q${question.id}-4">4<span class="option-text">Strongly agree</span></label>
            </div>
        </div>
    `;

    // Add question to container
    elements.questionContainer.appendChild(questionElement);

    // Add event listeners to radio buttons
    const radioButtons = questionElement.querySelectorAll('input[type="radio"]');
    radioButtons.forEach(radio => {
        radio.addEventListener('change', () => {
            state.responses[question.id] = radio.value;
            updateNavigationButtons();
        });
    });

    // Update progress indicators
    updateProgress();

    // Update navigation buttons
    updateNavigationButtons();
}

// Update progress indicators
function updateProgress() {
    const currentQuestion = state.currentQuestionIndex + 1;
    const totalQuestions = state.questions.length;
    const progressPercentage = (currentQuestion / totalQuestions) * 100;

    elements.progressFill.style.width = `${progressPercentage}%`;
    elements.currentQuestionSpan.textContent = currentQuestion;
}

// Update navigation buttons based on current state
function updateNavigationButtons() {
    // Previous button - disabled on first question
    elements.prevButton.disabled = state.currentQuestionIndex === 0;

    // Next/Submit buttons
    const isLastQuestion = state.currentQuestionIndex === state.questions.length - 1;

    if (isLastQuestion) {
        elements.nextButton.classList.add('hidden');
        elements.submitButton.classList.remove('hidden');
    } else {
        elements.nextButton.classList.remove('hidden');
        elements.submitButton.classList.add('hidden');
    }
}

// Go to previous question
function goToPreviousQuestion() {
    if (state.currentQuestionIndex > 0) {
        state.currentQuestionIndex--;
        displayCurrentQuestion();
    }
}

// Go to next question
function goToNextQuestion() {
    const currentQuestion = state.questions[state.currentQuestionIndex];

    // Save current response if selected
    const selectedOption = document.querySelector(`input[name="q${currentQuestion.id}"]:checked`);
    if (selectedOption) {
        state.responses[currentQuestion.id] = selectedOption.value;
    }

    // Move to next question if not at the end
    if (state.currentQuestionIndex < state.questions.length - 1) {
        state.currentQuestionIndex++;
        displayCurrentQuestion();
    }
}

// Handle form submission
function handleFormSubmit(event) {
    event.preventDefault();

    // Save the final question's response
    const currentQuestion = state.questions[state.currentQuestionIndex];
    const selectedOption = document.querySelector(`input[name="q${currentQuestion.id}"]:checked`);
    if (selectedOption) {
        state.responses[currentQuestion.id] = selectedOption.value;
    }

    // Calculate scores
    const scores = window.questionnaireData.calculateAllSchemaScores(state.responses);

    // Store results in session storage for the results page
    sessionStorage.setItem('schemaScores', JSON.stringify(scores));
    sessionStorage.setItem('schemaResponses', JSON.stringify(state.responses));

    // Navigate to results page
    window.location.href = 'results.html';
}

// Initialize the application when the DOM is loaded
document.addEventListener('DOMContentLoaded', initApp);
