// DOM Elements
const sections = {
    home: document.getElementById('home-section'),
    auth: document.getElementById('auth-section'),
    browse: document.getElementById('browse-section'),
    create: document.getElementById('create-section'),
    take: document.getElementById('take-quiz-section'),
    results: document.getElementById('results-section'),
    leaderboard: document.getElementById('leaderboard-section'),
    analytics: document.getElementById('analytics-section')
};

// Navigation Elements
const navLinks = {
    home: document.getElementById('home-link'),
    browse: document.getElementById('browse-link'),
    leaderboard: document.getElementById('leaderboard-link'),
    login: document.getElementById('login-link')
};

// Buttons
const createQuizBtn = document.getElementById('create-quiz-btn');
const takeQuizBtn = document.getElementById('take-quiz-btn');
const addQuestionBtn = document.getElementById('add-question-btn');

// Templates
const questionTemplate = document.getElementById('question-template');
const quizCardTemplate = document.getElementById('quiz-card-template');

// Current state
let currentUser = null;
let currentQuiz = null;
let quizzes = []; // This would normally be stored in a database
let leaderboard = []; // This would normally be stored in a database

// Initialize the application
function init() {
    // Add event listeners for navigation
    navLinks.home.addEventListener('click', showSection.bind(null, 'home'));
    navLinks.browse.addEventListener('click', showSection.bind(null, 'browse'));
    navLinks.leaderboard.addEventListener('click', showSection.bind(null, 'leaderboard'));
    navLinks.login.addEventListener('click', showSection.bind(null, 'auth'));
    
    // Add event listeners for buttons
    createQuizBtn.addEventListener('click', handleCreateQuizClick);
    takeQuizBtn.addEventListener('click', showSection.bind(null, 'browse'));
    addQuestionBtn.addEventListener('click', addQuestion);
    
    // Handle auth tabs
    document.querySelectorAll('.tab-btn').forEach(btn => {
        btn.addEventListener('click', switchTab);
    });
    
    // Handle forms
    document.getElementById('login-form').addEventListener('submit', handleLogin);
    document.getElementById('register-form').addEventListener('submit', handleRegister);
    document.getElementById('quiz-form').addEventListener('submit', handleQuizSubmission);
    
    // Quiz navigation
    document.getElementById('prev-question').addEventListener('click', previousQuestion);
    document.getElementById('next-question').addEventListener('click', nextQuestion);
    document.getElementById('submit-quiz').addEventListener('click', submitQuiz);
    
    // Results actions
    document.getElementById('retake-quiz').addEventListener('click', retakeQuiz);
    document.getElementById('return-home').addEventListener('click', showSection.bind(null, 'home'));
    
    // Load sample data
    loadSampleData();
    
    // Show home section by default
    showSection('home');
}

// Show/hide sections
function showSection(sectionId) {
    // Hide all sections
    Object.values(sections).forEach(section => {
        section.classList.add('hidden');
    });
    
    // Show the requested section
    sections[sectionId].classList.remove('hidden');
    
    // Perform any necessary setup for the section
    switch(sectionId) {
        case 'browse':
            loadQuizzes();
            break;
        case 'leaderboard':
            loadLeaderboard();
            break;
        case 'analytics':
            if (currentUser) {
                loadAnalytics();
            } else {
                alert('Please login to view analytics');
                showSection('auth');
            }
            break;
        case 'create':
            if (!currentUser) {
                alert('Please login to create a quiz');
                showSection('auth');
            } else {
                // Clear the form
                document.getElementById('quiz-form').reset();
                document.getElementById('questions-container').innerHTML = '';
                // Add the first question
                addQuestion();
            }
            break;
    }
}

// Switch between login and register tabs
function switchTab(e) {
    const tabId = e.target.dataset.tab;
    
    // Update active tab button
    document.querySelectorAll('.tab-btn').forEach(btn => {
        btn.classList.remove('active');
    });
    e.target.classList.add('active');
   // Show selected tab content
   document.querySelectorAll('.tab-content').forEach(content => {
    content.classList.add('hidden');
});
document.getElementById(tabId).classList.remove('hidden');
}

// Handle login submission
function handleLogin(e) {
e.preventDefault();

const email = document.getElementById('login-email').value;
const password = document.getElementById('login-password').value;

// In a real app, this would authenticate with a server
// For demo purposes, we'll just check against our sample data
const user = sampleUsers.find(u => u.email === email && u.password === password);

if (user) {
    currentUser = {
        id: user.id,
        name: user.name,
        email: user.email
    };
    
    // Update UI for logged in user
    updateAuthUI();
    
    // Redirect to home
    showSection('home');
} else {
    alert('Invalid email or password');
}
}

// Handle registration submission
function handleRegister(e) {
e.preventDefault();

const name = document.getElementById('register-name').value;
const email = document.getElementById('register-email').value;
const password = document.getElementById('register-password').value;
const confirm = document.getElementById('register-confirm').value;

// Simple validation
if (password !== confirm) {
    alert('Passwords do not match');
    return;
}

// In a real app, this would register the user with a server
// For demo purposes, we'll just add to our sample data
const newId = sampleUsers.length + 1;

sampleUsers.push({
    id: newId,
    name,
    email,
    password
});

currentUser = {
    id: newId,
    name,
    email
};

// Update UI for logged in user
updateAuthUI();

// Redirect to home
showSection('home');
}

// Update UI based on auth state
function updateAuthUI() {
const loginLink = document.getElementById('login-link');

if (currentUser) {
    // Change login link to user profile
    loginLink.textContent = currentUser.name;
    loginLink.addEventListener('click', showUserDropdown);
    
    // Enable quiz creation
    createQuizBtn.disabled = false;
} else {
    // Reset login link
    loginLink.textContent = 'Login/Register';
    loginLink.removeEventListener('click', showUserDropdown);
    loginLink.addEventListener('click', showSection.bind(null, 'auth'));
    
    // Disable quiz creation
    createQuizBtn.disabled = true;
}
}

// Show user dropdown menu (placeholder)
function showUserDropdown() {
// For simplicity, we'll just show a logout option via alert
if (confirm('Would you like to logout?')) {
    logout();
}
}

// Handle logout
function logout() {
currentUser = null;
updateAuthUI();
showSection('home');
}

// Handle create quiz button click
function handleCreateQuizClick() {
if (currentUser) {
    showSection('create');
} else {
    alert('Please login to create a quiz');
    showSection('auth');
}
}

// Add a question to the quiz form
function addQuestion() {
const questionsContainer = document.getElementById('questions-container');
const questionCount = questionsContainer.children.length;

// Clone the question template
const questionNode = document.importNode(questionTemplate.content, true);

// Update the question number and name attributes
const questionIndex = questionCount;
const radioButtons = questionNode.querySelectorAll('input[type="radio"]');

radioButtons.forEach(radio => {
    radio.name = `correct-answer-${questionIndex}`;
});

// Add event listeners for the buttons
const addOptionBtn = questionNode.querySelector('.add-option-btn');
const removeQuestionBtn = questionNode.querySelector('.remove-question-btn');

addOptionBtn.addEventListener('click', function() {
    addOption(this.closest('.question-item'));
});

removeQuestionBtn.addEventListener('click', function() {
    if (questionsContainer.children.length > 1) {
        this.closest('.question-item').remove();
        // Renumber questions
        updateQuestionIndices();
    } else {
        alert('You need at least one question');
    }
});

// Append the new question
questionsContainer.appendChild(questionNode);
}

// Add an option to a question
function addOption(questionItem) {
const optionsContainer = questionItem.querySelector('.options-container');
const optionCount = optionsContainer.children.length;
const questionIndex = Array.from(questionItem.parentNode.children).indexOf(questionItem);

if (optionCount >= 6) {
    alert('Maximum 6 options per question');
    return;
}

// Create a new option
const optionItem = document.createElement('div');
optionItem.className = 'option-item';

const radioInput = document.createElement('input');
radioInput.type = 'radio';
radioInput.name = `correct-answer-${questionIndex}`;
radioInput.value = optionCount;
radioInput.required = true;

const textInput = document.createElement('input');
textInput.type = 'text';
textInput.className = 'option-text';
textInput.placeholder = `Option ${optionCount + 1}`;
textInput.required = true;

optionItem.appendChild(radioInput);
optionItem.appendChild(textInput);

// Add a remove button if there are more than 2 options
if (optionCount >= 2) {
    const removeBtn = document.createElement('button');
    removeBtn.type = 'button';
    removeBtn.className = 'remove-option-btn';
    removeBtn.textContent = 'Remove';
    removeBtn.addEventListener('click', function() {
        if (optionsContainer.children.length > 2) {
            this.parentElement.remove();
            // Renumber options
            updateOptionIndices(questionItem);
        } else {
            alert('Minimum 2 options required');
        }
    });
    
    optionItem.appendChild(removeBtn);
}

optionsContainer.appendChild(optionItem);
}

// Update question indices after removing a question
function updateQuestionIndices() {
const questionItems = document.querySelectorAll('.question-item');

questionItems.forEach((item, index) => {
    const radioButtons = item.querySelectorAll('input[type="radio"]');
    radioButtons.forEach(radio => {
        radio.name = `correct-answer-${index}`;
    });
});
}

// Update option indices after removing an option
function updateOptionIndices(questionItem) {
const optionItems = questionItem.querySelectorAll('.option-item');

optionItems.forEach((item, index) => {
    const radio = item.querySelector('input[type="radio"]');
    radio.value = index;
    
    const textInput = item.querySelector('.option-text');
    textInput.placeholder = `Option ${index + 1}`;
});
}

// Handle quiz form submission
function handleQuizSubmission(e) {
e.preventDefault();

// Gather quiz data
const title = document.getElementById('quiz-title').value;
const description = document.getElementById('quiz-description').value;
const category = document.getElementById('quiz-category').value;
const timeLimit = document.getElementById('time-limit').value || null;

// Gather questions
const questions = [];
const questionItems = document.querySelectorAll('.question-item');

questionItems.forEach(item => {
    const questionText = item.querySelector('.question-text').value;
    const options = [];
    const optionItems = item.querySelectorAll('.option-item');
    let correctAnswer = null;
    
    optionItems.forEach((optItem, index) => {
        const optionText = optItem.querySelector('.option-text').value;
        const isCorrect = optItem.querySelector('input[type="radio"]').checked;
        
        options.push(optionText);
        
        if (isCorrect) {
            correctAnswer = index;
        }
    });
    
    questions.push({
        text: questionText,
        options: options,
        correctAnswer: correctAnswer
    });
});

// Create the quiz object
const newQuiz = {
    id: generateId(),
    title,
    description,
    category,
    timeLimit,
    questions,
    author: currentUser.name,
    authorId: currentUser.id,
    dateCreated: new Date().toISOString(),
    attempts: 0
};

// In a real app, this would save to a database
// For demo purposes, we'll just add to our array
quizzes.push(newQuiz);

alert('Quiz created successfully!');
showSection('browse');
}

// Generate a random ID
function generateId() {
return Math.random().toString(36).substr(2, 9);
}

// Load quizzes for the browse section
function loadQuizzes() {
const quizList = document.getElementById('quiz-list');
quizList.innerHTML = '';

quizzes.forEach(quiz => {
    const quizCard = createQuizCard(quiz);
    quizList.appendChild(quizCard);
});
}

// Create a quiz card element
function createQuizCard(quiz) {
const cardNode = document.importNode(quizCardTemplate.content, true);

// Fill in the card data
cardNode.querySelector('.quiz-card-title').textContent = quiz.title;
cardNode.querySelector('.quiz-card-category').textContent = quiz.category;
cardNode.querySelector('.quiz-card-description').textContent = quiz.description;
cardNode.querySelector('.quiz-card-questions').textContent = `${quiz.questions.length} questions`;
cardNode.querySelector('.quiz-card-author').textContent = `By ${quiz.author}`;

// Add event listener to the take quiz button
const takeQuizBtn = cardNode.querySelector('.take-quiz-btn');
takeQuizBtn.addEventListener('click', function() {
    startQuiz(quiz.id);
});

return cardNode.firstElementChild;
}

// Start a quiz
function startQuiz(quizId) {
const quiz = quizzes.find(q => q.id === quizId);

if (!quiz) {
    alert('Quiz not found');
    return;
}

currentQuiz = {
    ...quiz,
    currentQuestion: 0,
    userAnswers: new Array(quiz.questions.length).fill(null),
    startTime: new Date()
};

// Set up the quiz
const titleDisplay = document.getElementById('quiz-title-display');
const descriptionDisplay = document.getElementById('quiz-description-display');
const questionCounter = document.getElementById('question-counter');
const timer = document.getElementById('timer');

titleDisplay.textContent = quiz.title;
descriptionDisplay.textContent = quiz.description;
questionCounter.textContent = `Question 1 of ${quiz.questions.length}`;

// Set up timer if time limit exists
if (quiz.timeLimit) {
    timer.classList.remove('hidden');
    startTimer(quiz.timeLimit);
} else {
    timer.classList.add('hidden');
}

// Display the first question
displayQuestion(0);

// Show the quiz section
showSection('take');
}

// Display a question
function displayQuestion(index) {
const question = currentQuiz.questions[index];
const questionDisplay = document.getElementById('question-display');
const optionsContainer = document.getElementById('options-container');
const nextBtn = document.getElementById('next-question');
const prevBtn = document.getElementById('prev-question');
const submitBtn = document.getElementById('submit-quiz');
const questionCounter = document.getElementById('question-counter');

// Update question counter
questionCounter.textContent = `Question ${index + 1} of ${currentQuiz.questions.length}`;

// Update question text
questionDisplay.textContent = question.text;

// Clear and create options
optionsContainer.innerHTML = '';

question.options.forEach((option, i) => {
    const optionBtn = document.createElement('button');
    optionBtn.type = 'button';
    optionBtn.className = 'option-btn';
    optionBtn.textContent = option;
    
    // Check if this option was previously selected
    if (currentQuiz.userAnswers[index] === i) {
        optionBtn.classList.add('selected');
    }
    
    optionBtn.addEventListener('click', function() {
        // Remove selected class from all options
        optionsContainer.querySelectorAll('.option-btn').forEach(btn => {
            btn.classList.remove('selected');
        });
        
        // Add selected class to this option
        this.classList.add('selected');
        
        // Save the answer
        currentQuiz.userAnswers[index] = i;
    });
    
    optionsContainer.appendChild(optionBtn);
});

// Update navigation buttons
prevBtn.style.visibility = index === 0 ? 'hidden' : 'visible';

if (index === currentQuiz.questions.length - 1) {
    nextBtn.classList.add('hidden');
    submitBtn.classList.remove('hidden');
} else {
    nextBtn.classList.remove('hidden');
    submitBtn.classList.add('hidden');
}

// Update current question index
currentQuiz.currentQuestion = index;
}

// Navigate to the next question
function nextQuestion() {
if (currentQuiz.currentQuestion < currentQuiz.questions.length - 1) {
    displayQuestion(currentQuiz.currentQuestion + 1);
}
}

// Navigate to the previous question
function previousQuestion() {
if (currentQuiz.currentQuestion > 0) {
    displayQuestion(currentQuiz.currentQuestion - 1);
}
}

// Start the timer
function startTimer(minutes) {
const timeDisplay = document.getElementById('time-display');
const totalSeconds = minutes * 60;
let secondsRemaining = totalSeconds;

function updateTimer() {
    const minutesLeft = Math.floor(secondsRemaining / 60);
    const secondsLeft = secondsRemaining % 60;
    
    timeDisplay.textContent = `${minutesLeft.toString().padStart(2, '0')}:${secondsLeft.toString().padStart(2, '0')}`;
    
    if (secondsRemaining <= 0) {
        clearInterval(timerInterval);
        alert('Time\'s up!');
        submitQuiz();
    }
    
    secondsRemaining--;
}

// Initial display
updateTimer();

// Update every second
const timerInterval = setInterval(updateTimer, 1000);

// Store the interval ID to clear it later
currentQuiz.timerInterval = timerInterval;
}

// Submit the quiz
function submitQuiz() {
// Clear timer if it exists
if (currentQuiz.timerInterval) {
    clearInterval(currentQuiz.timerInterval);
}

// Calculate the score
let score = 0;
currentQuiz.questions.forEach((question, index) => {
    if (currentQuiz.userAnswers[index] === question.correctAnswer) {
        score++;
    }
});

// Calculate the time taken
const endTime = new Date();
const timeTaken = Math.floor((endTime - currentQuiz.startTime) / 1000); // in seconds

// Create the result object
const result = {
    quizId: currentQuiz.id,
    quizTitle: currentQuiz.title,
    score,
    totalQuestions: currentQuiz.questions.length,
    percentage: Math.round((score / currentQuiz.questions.length) * 100),
    timeTaken,
    date: endTime.toISOString(),
    userAnswers: [...currentQuiz.userAnswers],
    user: currentUser ? currentUser.name : 'Guest'
};

// Save the result
saveQuizResult(result);

// Display the results
displayResults(result);

// Show the results section
showSection('results');
}

// Save quiz result
function saveQuizResult(result) {
// Increment quiz attempts
const quizIndex = quizzes.findIndex(q => q.id === result.quizId);
if (quizIndex !== -1) {
    quizzes[quizIndex].attempts++;
}

// Add to leaderboard
leaderboard.push({
    id: generateId(),
    quizId: result.quizId,
    quizTitle: result.quizTitle,
    user: result.user,
    score: result.percentage,
    timeTaken: result.timeTaken,
    date: result.date
});

// Sort leaderboard by score (descending) and time (ascending)
leaderboard.sort((a, b) => {
    if (a.score === b.score) {
        return a.timeTaken - b.timeTaken;
    }
    return b.score - a.score;
});
}

// Display quiz results
function displayResults(result) {
const scorePercentage = document.getElementById('score-percentage');
const scoreRaw = document.getElementById('score-raw');
const questionsBreakdown = document.getElementById('questions-breakdown');

// Display score
scorePercentage.textContent = `${result.percentage}%`;
scoreRaw.textContent = `${result.score}/${result.totalQuestions}`;

// Clear and create questions breakdown
questionsBreakdown.innerHTML = '';

// Get the original quiz
const quiz = quizzes.find(q => q.id === result.quizId);

if (!quiz) return;

// Create breakdown for each question
quiz.questions.forEach((question, index) => {
    const userAnswer = result.userAnswers[index];
    const isCorrect = userAnswer === question.correctAnswer;
    
    const questionDiv = document.createElement('div');
    questionDiv.className = `question-result ${isCorrect ? 'correct' : 'incorrect'}`;
    
    const questionHeader = document.createElement('div');
    questionHeader.className = 'question-result-header';
    
    const questionText = document.createElement('div');
    questionText.className = 'question-text';
    questionText.textContent = `Q${index + 1}: ${question.text}`;
    
    const questionStatus = document.createElement('div');
    questionStatus.className = 'question-status';
    questionStatus.textContent = isCorrect ? 'Correct' : 'Incorrect';
    
    questionHeader.appendChild(questionText);
    questionHeader.appendChild(questionStatus);
    
    const answerDetails = document.createElement('div');
    answerDetails.className = 'answer-details';
    
    // Your answer
    const yourAnswer = document.createElement('p');
    if (userAnswer !== null) {
        yourAnswer.textContent = `Your answer: ${question.options[userAnswer]}`;
    } else {
        yourAnswer.textContent = 'Your answer: Not answered';
    }
    
    // Correct answer (only show if incorrect)
    const correctAnswer = document.createElement('p');
    if (!isCorrect) {
        correctAnswer.textContent = `Correct answer: ${question.options[question.correctAnswer]}`;
        correctAnswer.className = 'correct-answer';
    }
    
    answerDetails.appendChild(yourAnswer);
    if (!isCorrect) answerDetails.appendChild(correctAnswer);
    
    questionDiv.appendChild(questionHeader);
    questionDiv.appendChild(answerDetails);
    
    questionsBreakdown.appendChild(questionDiv);
});
}

// Retake the quiz
function retakeQuiz() {
startQuiz(currentQuiz.id);
}

// Load leaderboard
function loadLeaderboard() {
const leaderboardEntries = document.getElementById('leaderboard-entries');
const quizFilter = document.getElementById('leaderboard-quiz-filter');

// Clear previous entries
leaderboardEntries.innerHTML = '';

// Reset quiz filter
quizFilter.innerHTML = '<option value="">All Quizzes</option>';

// Add quizzes to the filter
const uniqueQuizzes = Array.from(new Set(leaderboard.map(entry => entry.quizId)));
uniqueQuizzes.forEach(quizId => {
    const quiz = quizzes.find(q => q.id === quizId);
    if (quiz) {
        const option = document.createElement('option');
        option.value = quizId;
        option.textContent = quiz.title;
        quizFilter.appendChild(option);
    }
});

// Add event listener to the filter
quizFilter.addEventListener('change', loadLeaderboard);

// Get selected quiz filter
const selectedQuiz = quizFilter.value;

// Filter leaderboard entries
let filteredEntries = [...leaderboard];
if (selectedQuiz) {
    filteredEntries = filteredEntries.filter(entry => entry.quizId === selectedQuiz);
}

// Display entries
filteredEntries.forEach((entry, index) => {
    const row = document.createElement('tr');
    
    const rank = document.createElement('td');
    rank.textContent = index + 1;
    
    const name = document.createElement('td');
    name.textContent = entry.user;
    
    const quiz = document.createElement('td');
    quiz.textContent = entry.quizTitle;
    
    const score = document.createElement('td');
    score.textContent = `${entry.score}%`;
    
    const time = document.createElement('td');
    time.textContent = formatTime(entry.timeTaken);
    
    const date = document.createElement('td');
    date.textContent = new Date(entry.date).toLocaleDateString();
    
    row.appendChild(rank);
    row.appendChild(name);
    row.appendChild(quiz);
    row.appendChild(score);
    row.appendChild(time);
    row.appendChild(date);
    
    leaderboardEntries.appendChild(row);
});
}

// Format time in seconds to mm:ss
function formatTime(seconds) {
const minutes = Math.floor(seconds / 60);
const remainingSeconds = seconds % 60;
return `${minutes.toString().padStart(2, '0')}:${remainingSeconds.toString().padStart(2, '0')}`;
}

// Load analytics for a quiz
function loadAnalytics() {
const quizSelect = document.getElementById('analytics-quiz-select');
const totalAttempts = document.getElementById('total-attempts');
const averageScore = document.getElementById('average-score');
const completionRate = document.getElementById('completion-rate');
const questionPerformance = document.getElementById('question-performance');

// Clear previous quizzes
quizSelect.innerHTML = '';

// Filter quizzes by the current user
const userQuizzes = quizzes.filter(quiz => quiz.authorId === currentUser.id);

if (userQuizzes.length === 0) {
    alert('You have not created any quizzes yet');
    showSection('home');
    return;
}

// Add quizzes to the select
userQuizzes.forEach(quiz => {
    const option = document.createElement('option');
    option.value = quiz.id;
    option.textContent = quiz.title;
    quizSelect.appendChild(option);
});

// Add event listener to the select
quizSelect.addEventListener('change', function() {
    displayAnalytics(this.value);
});

// Load analytics for the first quiz
displayAnalytics(userQuizzes[0].id);
}

// Display analytics for a quiz
function displayAnalytics(quizId) {
const totalAttempts = document.getElementById('total-attempts');
const averageScore = document.getElementById('average-score');
const completionRate = document.getElementById('completion-rate');
const questionPerformance = document.getElementById('question-performance');

// Get the quiz
const quiz = quizzes.find(q => q.id === quizId);

if (!quiz) return;

// Get all attempts for this quiz
const attempts = leaderboard.filter(entry => entry.quizId === quizId);

// Calculate analytics
const attemptCount = attempts.length;
const avgScore = attempts.length > 0 ? Math.round(attempts.reduce((sum, entry) => sum + entry.score, 0) / attempts.length) : 0;
const completion = Math.round((attemptCount / quiz.attempts) * 100) || 0;

// Display analytics
totalAttempts.textContent = attemptCount;
averageScore.textContent = `${avgScore}%`;
completionRate.textContent = `${completion}%`;

// Clear and create question performance
questionPerformance.innerHTML = '';

// Create performance for each question
quiz.questions.forEach((question, index) => {
    const questionDiv = document.createElement('div');
    questionDiv.className = 'question-performance-item';
    
    const questionText = document.createElement('h4');
    questionText.textContent = `Question ${index + 1}: ${question.text}`;
    
    const correctCount = attempts.filter(attempt => {
        const result = leaderboard.find(entry => entry.id === attempt.id);
        return result && result.userAnswers && result.userAnswers[index] === question.correctAnswer;
    }).length;
    
    const correctPercentage = attemptCount > 0 ? Math.round((correctCount / attemptCount) * 100) : 0;
    
    const performanceText = document.createElement('p');
    performanceText.textContent = `${correctCount} out of ${attemptCount} (${correctPercentage}%) answered correctly`;
    
    const performanceBar = document.createElement('div');
    performanceBar.className = 'performance-bar';
    
    const performanceFill = document.createElement('div');
    performanceFill.className = 'performance-fill';
    performanceFill.style.width = `${correctPercentage}%`;
    
    performanceBar.appendChild(performanceFill);
    
    questionDiv.appendChild(questionText);
    questionDiv.appendChild(performanceText);
    questionDiv.appendChild(performanceBar);
    
    questionPerformance.appendChild(questionDiv);
});
}

// Load sample data
function loadSampleData() {
// Sample quizzes
quizzes = [
    {
        id: 'quiz1',
        title: 'Web Development Basics',
        description: 'Test your knowledge of HTML, CSS, and JavaScript fundamentals.',
        category: 'technology',
        timeLimit: 10,
        questions: [
            {
                text: 'What does HTML stand for?',
                options: [
                    'Hyper Text Markup Language',
                    'High Tech Modern Language',
                    'Hyper Transfer Markup Language',
                    'Home Tool Markup Language'
                ],
                correctAnswer: 0
            },
            {
                text: 'Which property is used to change the background color in CSS?',
                options: [
                    'color',
                    'bgcolor',
                    'background-color',
                    'background'
                ],
                correctAnswer: 2
            },
            {
                text: 'Which of the following is a JavaScript framework?',
                options: [
                    'Java',
                    'Python',
                    'React',
                    'HTML'
                ],
                correctAnswer: 2
            }
        ],
        author: 'Admin',
        authorId: 1,
        dateCreated: '2025-03-15T10:30:00Z',
        attempts: 0
    },
    {
        id: 'quiz2',
        title: 'Science Quiz',
        description: 'Test your knowledge of basic science concepts.',
        category: 'science',
        timeLimit: null,
        questions: [
            {
                text: 'What is the chemical symbol for water?',
                options: [
                    'WA',
                    'H2O',
                    'W',
                    'HO2'
                ],
                correctAnswer: 1
            },
            {
                text: 'Which planet is known as the Red Planet?',
                options: [
                    'Venus',
                    'Jupiter',
                    'Mars',
                    'Saturn'
                ],
                correctAnswer: 2
            },
            {
                text: 'What is the largest organ in the human body?',
                options: [
                    'Heart',
                    'Liver',
                    'Brain',
                    'Skin'
                ],
                correctAnswer: 3
            }
        ],
        author: 'Admin',
        authorId: 1,
        dateCreated: '2025-03-10T15:45:00Z',
        attempts: 0
    }
];
}

// Sample users data
const sampleUsers = [
{
    id: 1,
    name: 'Admin',
    email: 'admin@example.com',
    password: 'password123'
}
];

// Initialize the app when the DOM is loaded
document.addEventListener('DOMContentLoaded', init);