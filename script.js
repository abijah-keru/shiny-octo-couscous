// Global variables
let currentSection = 0;
let userName = '';
let formData = {};
const sections = [
    'life-stuff',
    'values-beliefs', 
    'relationship-history',
    'personality-style',
    'habits-selfcare',
    'lifestyle-vacation',
    'values-future',
    'social-energy'
];

// Initialize the app
document.addEventListener('DOMContentLoaded', function() {
    console.log('DOM Content Loaded - starting initialization');
    initializeApp();
});

function initializeApp() {
    console.log('Initializing app...');
    
    // Set up event listeners
    setupLoginForm();
    setupNavigation();
    setupFormHandling();
    
    // Initialize first section
    showSection(0);
    updateProgress();
    
    console.log('App initialized successfully');
}

// Login form handling
function setupLoginForm() {
    const loginForm = document.getElementById('login-form');
    
    if (!loginForm) {
        console.error('Login form not found!');
        return;
    }
    
    // Add submit event listener
    loginForm.addEventListener('submit', function(e) {
        e.preventDefault();
        console.log('Form submitted, preventing default');
        handleLogin();
    });
    
    // Also add click event listener to the button as backup
    const submitButton = document.getElementById('submit-btn');
    if (submitButton) {
        submitButton.addEventListener('click', function(e) {
    e.preventDefault();
            console.log('Button clicked');
            handleLogin();
        });
    } else {
        console.error('Submit button not found!');
    }
}

function handleLogin() {
    const nameInput = document.getElementById('user-name');
    userName = nameInput.value.trim();
    
    console.log('User name:', userName);
    
    if (userName) {
        // Store user name
        localStorage.setItem('compatibilityUserName', userName);
        
        console.log('Showing Let\'s Dance screen');
        // Show Let's Dance screen first
        showScreen('lets-dance-screen');
        
        // Username display removed - no longer needed
        
        // After 1 second, go to questionnaire
        setTimeout(() => {
            console.log('Starting questionnaire');
            showScreen('questionnaire-screen');
            
            // Initialize questionnaire state
            currentSection = 0;
            showSection(0);
            updateProgress();
            updateNavButtons();
        }, 2000);
    } else {
        console.log('No user name provided');
        alert('Please enter your name to continue.');
    }
}

// Screen management
function showScreen(screenId) {
    console.log('Showing screen:', screenId);
    
    // Hide all screens
    document.querySelectorAll('.screen').forEach(screen => {
        screen.classList.remove('active');
    });
    
    // Show target screen
    const targetScreen = document.getElementById(screenId);
    if (targetScreen) {
        targetScreen.classList.add('active');
        console.log('Screen activated:', screenId);
    } else {
        console.error('Target screen not found:', screenId);
    }
}

// Section navigation
function setupNavigation() {
    const prevBtn = document.getElementById('prev-section');
    const nextBtn = document.getElementById('next-section');
    const submitBtn = document.getElementById('submit-questionnaire');
    const navButtons = document.querySelectorAll('.nav-btn');
    
    // Previous button
    prevBtn.addEventListener('click', function() {
        if (currentSection > 0) {
            // Update completion status before moving
            updateSectionCompletion();
            
            currentSection--;
            showSection(currentSection);
            updateProgress();
            updateNavButtons();
            // Scroll to top when changing sections
            window.scrollTo({ top: 0, behavior: 'smooth' });
        }
    });
    
    // Next button
    nextBtn.addEventListener('click', function() {
        if (currentSection < sections.length - 1) {
            // Update completion status for current section before moving
            updateSectionCompletion();
            
            currentSection++;
            showSection(currentSection);
            updateProgress();
            updateNavButtons();
            // Scroll to top when changing sections
            window.scrollTo({ top: 0, behavior: 'smooth' });
        }
    });
    
    // Submit button
    submitBtn.addEventListener('click', function() {
        if (validateAllQuestions()) {
        collectFormData();
        showResults();
        } else {
            showIncompleteError();
        }
    });
    
    // Navigation buttons
    navButtons.forEach((btn, index) => {
        btn.addEventListener('click', function() {
            // Update completion status before switching sections
            updateSectionCompletion();
            
            currentSection = index;
            showSection(currentSection);
            updateProgress();
            updateNavButtons();
            // Scroll to top when changing sections
            window.scrollTo({ top: 0, behavior: 'smooth' });
        });
    });
    
    // Restart button
    document.getElementById('restart-btn').addEventListener('click', function() {
        // Clear stored data
        localStorage.removeItem('compatibilityUserName');
        localStorage.removeItem('compatibilityFormData');
        
        // Reset form
        document.getElementById('questionnaire-form').reset();
        formData = {};
        currentSection = 0;
        
        // Show login screen
        showScreen('login-screen');
        document.getElementById('user-name').value = '';
    });
}

function showSection(sectionIndex) {
    // Hide all sections
    document.querySelectorAll('.question-section').forEach(section => {
        section.classList.remove('active');
    });
    
    // Show current section
    const currentSectionElement = document.getElementById(sections[sectionIndex]);
    if (currentSectionElement) {
        currentSectionElement.classList.add('active');
    }
    
    // Update navigation buttons
    document.querySelectorAll('.nav-btn').forEach((btn, index) => {
        btn.classList.toggle('active', index === sectionIndex);
    });
}

function updateProgress() {
    const progressFill = document.getElementById('progress-fill');
    const progressPercentage = document.getElementById('progress-percentage');
    
    // Calculate progress based on answered questions
    const totalQuestions = countTotalQuestions();
    const answeredQuestions = countAnsweredQuestions();
    const progress = totalQuestions > 0 ? (answeredQuestions / totalQuestions) * 100 : 0;
    
    progressFill.style.width = `${progress}%`;
    progressPercentage.textContent = `${Math.round(progress)}%`;
    
    // Automatically transition to thank you page when 100% complete
    if (Math.round(progress) === 100) {
        setTimeout(() => {
            showResults();
        }, 1000); // 1 second delay to show the 100% completion
    }
}

function countTotalQuestions() {
    // Count all question groups across all sections
    let totalCount = 0;
    sections.forEach(sectionId => {
        const section = document.getElementById(sectionId);
        if (section) {
            const questionGroups = section.querySelectorAll('.question-group');
            totalCount += questionGroups.length;
        }
    });
    return totalCount;
}

function countAnsweredQuestions() {
    // Count questions that have at least one answer selected
    let answeredCount = 0;
    sections.forEach(sectionId => {
        const section = document.getElementById(sectionId);
        if (section) {
            const questionGroups = section.querySelectorAll('.question-group');
            questionGroups.forEach(group => {
                const checkboxes = group.querySelectorAll('input[type="checkbox"]');
                const name = checkboxes[0]?.name;
                if (name && formData[name] && formData[name].length > 0) {
                    answeredCount++;
                }
            });
        }
    });
    return answeredCount;
}

function validateAllQuestions() {
    let allAnswered = true;
    const skippedSections = [];
    
    sections.forEach(sectionId => {
        const section = document.getElementById(sectionId);
        if (section) {
            const questionGroups = section.querySelectorAll('.question-group');
            let sectionAnswered = true;
            
            questionGroups.forEach(group => {
                const checkboxes = group.querySelectorAll('input[type="checkbox"]');
                const name = checkboxes[0]?.name;
                const hasAnswer = name && formData[name] && formData[name].length > 0;
                
                if (!hasAnswer) {
                    allAnswered = false;
                    sectionAnswered = false;
                }
            });
            
            if (!sectionAnswered) {
                skippedSections.push(sectionId);
            }
        }
    });
    
    return allAnswered;
}

function showIncompleteError() {
    // Create error message
    const errorMessage = document.createElement('div');
    errorMessage.className = 'error-message';
    errorMessage.innerHTML = `
        <div class="error-content">
            <h3>Oops! You skipped some questions</h3>
            <p>Please complete all sections before submitting. Completed sections are marked in green.</p>
            <button class="btn-primary" onclick="this.parentElement.parentElement.remove()">Got it!</button>
        </div>
    `;
    
    // Add to page
    document.body.appendChild(errorMessage);
    
    // Update section completion status
    updateSectionCompletion();
}

function updateSectionCompletion() {
    sections.forEach(sectionId => {
        const section = document.getElementById(sectionId);
        const navBtn = document.querySelector(`[data-section="${sectionId}"]`);
        
        if (section && navBtn) {
            const questionGroups = section.querySelectorAll('.question-group');
            let sectionCompleted = true;
            
            questionGroups.forEach(group => {
                const checkboxes = group.querySelectorAll('input[type="checkbox"]');
                const name = checkboxes[0]?.name;
                const hasAnswer = name && formData[name] && formData[name].length > 0;
                
                if (!hasAnswer) {
                    sectionCompleted = false;
                }
            });
            
            // Update navigation button appearance
            if (sectionCompleted) {
                navBtn.classList.add('completed-section');
                navBtn.classList.remove('incomplete-section');
            } else {
                navBtn.classList.add('incomplete-section');
                navBtn.classList.remove('completed-section');
            }
        }
    });
    
    // Check if current section is completed and auto-advance
    checkAndAutoAdvance();
}

function checkAndAutoAdvance() {
    const currentSectionElement = document.getElementById(sections[currentSection]);
    if (currentSectionElement) {
        const questionGroups = currentSectionElement.querySelectorAll('.question-group');
        let sectionCompleted = true;
        
        questionGroups.forEach(group => {
            const checkboxes = group.querySelectorAll('input[type="checkbox"]');
            const name = checkboxes[0]?.name;
            const hasAnswer = name && formData[name] && formData[name].length > 0;
            
            if (!hasAnswer) {
                sectionCompleted = false;
            }
        });
        
        // Auto-advance to next section if current is completed and not the last section
        if (sectionCompleted && currentSection < sections.length - 1) {
            setTimeout(() => {
                fadeToNextSection();
            }, 500); // Small delay to show the green completion
        }
    }
}

function fadeToNextSection() {
    const container = document.querySelector('.questionnaire-container');
    
    // Add fade-out class
    container.classList.add('fade-out');
    
    // After fade-out completes, change section and fade back in
    setTimeout(() => {
        currentSection++;
        showSection(currentSection);
        updateProgress();
        updateNavButtons();
        window.scrollTo({ top: 0, behavior: 'smooth' });
        
        // Remove fade-out and add fade-in
        container.classList.remove('fade-out');
        container.classList.add('fade-in');
        
        // Remove fade-in class after animation completes
        setTimeout(() => {
            container.classList.remove('fade-in');
        }, 500);
    }, 500); // Wait for fade-out to complete
}

function autoScrollToNextQuestion() {
    const currentSectionElement = document.getElementById(sections[currentSection]);
    if (currentSectionElement) {
        const questionGroups = currentSectionElement.querySelectorAll('.question-group');
        let nextUnansweredQuestion = null;
        
        // Find the next unanswered question
        for (let i = 0; i < questionGroups.length; i++) {
            const group = questionGroups[i];
            const checkboxes = group.querySelectorAll('input[type="checkbox"]');
            const name = checkboxes[0]?.name;
            const hasAnswer = name && formData[name] && formData[name].length > 0;
            
            if (!hasAnswer) {
                nextUnansweredQuestion = group;
                break;
            }
        }
        
        // If there's a next unanswered question, scroll to it
        if (nextUnansweredQuestion) {
            setTimeout(() => {
                nextUnansweredQuestion.scrollIntoView({ 
                    behavior: 'smooth', 
                    block: 'nearest',
                    inline: 'nearest'
                });
            }, 300); // Small delay to allow the checkbox selection to register
        }
    }
}

function updateNavButtons() {
    const prevBtn = document.getElementById('prev-section');
    const nextBtn = document.getElementById('next-section');
    const submitBtn = document.getElementById('submit-questionnaire');
    
    // Update previous button
    prevBtn.disabled = currentSection === 0;
    
    // Update next/submit buttons
    if (currentSection === sections.length - 1) {
        nextBtn.style.display = 'none';
        submitBtn.style.display = 'inline-block';
    } else {
        nextBtn.style.display = 'inline-block';
        submitBtn.style.display = 'none';
    }
}

// Form data handling
function setupFormHandling() {
    const form = document.getElementById('questionnaire-form');
    
    // Auto-save form data as user progresses
    form.addEventListener('change', function() {
        collectFormData();
        saveFormData();
        updateProgress(); // Update progress when form changes
        updateSectionCompletion(); // Update section completion status
        
        // Auto-scroll to next question when answer is selected
        autoScrollToNextQuestion();
    });
    
    // Load saved data if exists
    loadSavedData();
    
    // Initial progress update
    updateProgress();
}

function collectFormData() {
    const form = document.getElementById('questionnaire-form');
    const formDataObj = new FormData(form);
    
    // Convert FormData to regular object
    formData = {};
    for (let [key, value] of formDataObj.entries()) {
        if (!formData[key]) {
            formData[key] = [];
        }
        formData[key].push(value);
    }
    
    return formData;
}

function saveFormData() {
    localStorage.setItem('compatibilityFormData', JSON.stringify(formData));
}

function loadSavedData() {
    const savedData = localStorage.getItem('compatibilityFormData');
    if (savedData) {
        formData = JSON.parse(savedData);
        
        // Restore checkbox states
        Object.keys(formData).forEach(questionName => {
            const values = formData[questionName];
            values.forEach(value => {
                const checkbox = document.querySelector(`input[name="${questionName}"][value="${value}"]`);
                if (checkbox) {
                    checkbox.checked = true;
                }
  });
});

        // Update progress after loading saved data
        updateProgress();
    }
}

// Results generation
function showResults() {
    collectFormData();
    
    // Show results screen
    showScreen('results-screen');
    
    // Update results user name
    document.getElementById('results-user-name').textContent = userName;
    
    // Create thank you message with sparks
    createThankYouMessage();
    
    // Save final data
    saveFormData();
}

function createThankYouMessage() {
    const resultsContent = document.getElementById('results-content');
    
    // Create thank you message with sparks
    resultsContent.innerHTML = `
        <div class="thank-you-container">
            <div class="sparks-container">
                <div class="spark spark-1">✨</div>
                <div class="spark spark-2">✨</div>
                <div class="spark spark-3">✨</div>
                <div class="spark spark-4">✨</div>
                <div class="spark spark-5">✨</div>
                <div class="spark spark-6">✨</div>
                <div class="spark spark-7">✨</div>
                <div class="spark spark-8">✨</div>
            </div>
            <h2 class="thank-you-title">Thank You!</h2>
            <p class="thank-you-message">Your responses have been recorded. The compatibility dance is complete!</p>
        </div>
    `;
}

function generateSectionSummary(sectionTitle, questionKeys) {
    let summary = `<div class="section-summary">
        <h4>${sectionTitle}</h4>
        <div class="responses">`;
    
    questionKeys.forEach(key => {
        if (formData[key] && formData[key].length > 0) {
            const questionText = getQuestionText(key);
            summary += `<div class="response-group">
                <strong>${questionText}:</strong>
                <ul>`;
            
            formData[key].forEach(value => {
                summary += `<li>${getResponseText(value)}</li>`;
            });
            
            summary += `</ul></div>`;
        }
    });
    
    summary += `</div></div>`;
    return summary;
}

function generateCompatibilityInsights() {
    let insights = `<div class="compatibility-insights">
        <h4>💕 Your Compatibility Insights</h4>
        <div class="insights-content">`;
    
    // Analyze responses and provide insights
    const insights_list = [];
    
    // Communication style insight
    if (formData['communication-style']) {
        const commStyle = formData['communication-style'][0];
        if (commStyle === 'constant-connection') {
            insights_list.push('You value deep, constant connection - perfect for someone who loves frequent communication and emotional intimacy.');
        } else if (commStyle === 'low-communication') {
            insights_list.push("You appreciate independence and space - ideal for someone who values personal time and isn't clingy.");
        }
    }
    
    // Love language insight
    if (formData['love-language']) {
        const loveLang = formData['love-language'][0];
        if (loveLang === 'physical-touch') {
            insights_list.push("Physical touch is your love language - you'll thrive with someone who's naturally affectionate and comfortable with PDA.");
        } else if (loveLang === 'acts-service') {
            insights_list.push('You show love through actions - perfect for someone who appreciates thoughtful gestures and practical support.');
        }
    }
    
    // Lifestyle compatibility
    if (formData['vacation-style'] && formData['hobbies']) {
        const vacation = formData['vacation-style'][0];
        const hobbies = formData['hobbies'][0];
        
        if (vacation === 'homebody' && hobbies === 'homebody') {
            insights_list.push('You\'re a cozy homebody - perfect match for someone who loves quiet nights in and intimate conversations.');
        } else if (vacation === 'backpacker' && hobbies === 'active-adventurous') {
            insights_list.push('You\'re an adventure seeker - ideal for someone who loves spontaneous trips and outdoor activities.');
        }
    }
    
    // Financial compatibility
    if (formData['spending-philosophy'] && formData['financial-responsibility']) {
        const spending = formData['spending-philosophy'][0];
        const responsibility = formData['financial-responsibility'][0];
        
        if (spending === 'saver' && responsibility === 'budgeting-pro') {
            insights_list.push("You're financially responsible and future-focused - great for someone who shares similar money values.");
        } else if (spending === 'experience-spender' && responsibility === 'balanced') {
            insights_list.push('You balance saving with experiences - perfect for someone who loves adventures but stays grounded.');
        }
    }
    
    // Default insights if none match
    if (insights_list.length === 0) {
        insights_list.push("Your responses show a complex, multi-faceted personality - you'll find someone who appreciates your unique blend of traits.");
        insights_list.push('Your honesty in answering these questions shows emotional maturity - a quality that will attract the right person.');
    }
    
    insights_list.forEach(insight => {
        insights += `<div class="insight-item">${insight}</div>`;
    });
    
    insights += '</div></div>';
    return insights;
}

// Helper functions
function getQuestionText(key) {
    const questionMap = {
        'addictions': 'Addictions (Past or Present)',
        'chronic-illness': 'Chronic Illness (Self or Family)',
        'religion': 'Religion & Spirituality',
        'gender-equality': 'Views on Gender & Equality',
        'lgbtq-rights': 'Views on LGBTQIA+ Rights',
        'political-alignment': 'Your Political Alignment',
        'current-relationship-status': 'Current Relationship Status',
        'cheating-history': 'Cheating History',
        'relationship-goals': 'Relationship Goals',
        'emotional-closure': 'Emotional Closure from Past Relationships',
        'communication-style': 'Communication Style',
        'conflict-style': 'Conflict Style',
        'love-language': 'How You Show Love',
        'chivalry': 'Chivalry & Gestures',
        'drinking': 'Drinking Frequency & Style',
        'fitness': 'Your Fitness Attitude',
        'hygiene': 'Your Routine & Hygiene',
        'organization': 'How Organized Are You',
        'grooming': 'Your General Grooming & Style',
        'vacation-style': 'Vacation Style',
        'itinerary': 'Itinerary Type',
        'accommodation': 'Accommodation Preference',
        'financial-responsibility': 'Financial Responsibility',
        'spending-philosophy': 'Spending Philosophy',
        'paying-dates': 'Paying for Dates',
        'living-expenses': 'Shared Living Expenses',
        'vacation-expenses': 'Vacation Expenses',
        'desire-children': 'Desire for Children',
        'reproductive-rights': 'Views on Reproductive Rights',
        'settling-down': 'Timeline for Settling Down',
        'career-drive': 'Career Drive',
        'therapy': 'Therapy & Self-Reflection',
        'life-alignment': 'Ideal Life Alignment',
        'hobbies': 'Hobbies & Free Time',
        'music': 'Music Vibes'
    };
    
    return questionMap[key] || key;
}

function getResponseText(value) {
    // This would normally map values back to their display text
    // For now, we'll use the value as-is or create a simple mapping
    return value.replace(/-/g, ' ').replace(/\b\w/g, l => l.toUpperCase());
}

// Keyboard navigation
document.addEventListener('keydown', function(e) {
    // Only handle keyboard navigation on questionnaire screen
    if (!document.getElementById('questionnaire-screen').classList.contains('active')) {
        return;
    }
    
    if (e.key === 'ArrowLeft' || e.key === 'ArrowUp') {
        e.preventDefault();
        document.getElementById('prev-section').click();
    } else if (e.key === 'ArrowRight' || e.key === 'ArrowDown') {
        e.preventDefault();
        if (currentSection < sections.length - 1) {
            document.getElementById('next-section').click();
        } else {
            document.getElementById('submit-questionnaire').click();
        }
    }
});

// Auto-save functionality
setInterval(function() {
    if (document.getElementById('questionnaire-screen').classList.contains('active')) {
        collectFormData();
        saveFormData();
    }
}, 10000); // Auto-save every 10 seconds

// Check for saved session on page load
window.addEventListener('load', function() {
    const savedName = localStorage.getItem('compatibilityUserName');
    if (savedName && !userName) {
        // Ask user if they want to continue previous session
        if (confirm(`Welcome back, ${savedName}! Do you want to continue where you left off?`)) {
            userName = savedName;
            showScreen('questionnaire-screen');
            loadSavedData();
        } else {
            // Clear saved data
            localStorage.removeItem('compatibilityUserName');
            localStorage.removeItem('compatibilityFormData');
        }
    }
});