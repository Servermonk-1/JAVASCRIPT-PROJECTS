class QuizApp {
constructor() {
	this.questions = [];
	this.currentQuestionIndex = 0;
	this.score = 0;
	this.timer = null;
	this.timeLeft = 60;
	this.userAnswers = [];

	this.initializeEventListeners();
}

initializeEventListeners() {
	// Setup screen
	document.getElementById('start-quiz').addEventListener('click', () => this.startQuiz());

	// Quiz screen
	document.getElementById('next-btn').addEventListener('click', () => this.nextQuestion());
	document.getElementById('quit-btn').addEventListener('click', () => this.quitQuiz());

	// Results screen
	document.getElementById('play-again-btn').addEventListener('click', () => this.playAgain());
	document.getElementById('new-quiz-btn').addEventListener('click', () => this.showSetupScreen());

	// Error screen
	document.getElementById('retry-btn').addEventListener('click', () => this.startQuiz());
}

    async startQuiz() {
	const category = document.getElementById('category').value;
	const difficulty = document.getElementById('difficulty').value;
	const amount = document.getElementById('amount').value;
	const type = document.getElementById('type').value;

	this.showLoadingScreen();

	try {
		const questions = await this.fetchQuestions(category, difficulty, amount, type);
		this.questions = questions;
		this.currentQuestionIndex = 0;
		this.score = 0;
		this.userAnswers = [];

		this.showQuizScreen();
		this.displayQuestion();
		this.startTimer();

	} catch (error) {
		this.showErrorScreen(error.message);
	}
}

    async fetchQuestions(category, difficulty, amount, type) {
	let url = `https://opentdb.com/api.php?amount=${amount}`;

	if (category) url += `&category=${category}`;
	if (difficulty) url += `&difficulty=${difficulty}`;
	if (type) url += `&type=${type}`;

	const response = await fetch(url);
	const data = await response.json();

	if (data.response_code !== 0) {
		throw new Error('Failed to fetch questions. Please try different settings.');
	}

	return data.results.map(q => ({
		question: this.decodeHTML(q.question),
		correctAnswer: this.decodeHTML(q.correct_answer),
		incorrectAnswers: q.incorrect_answers.map(a => this.decodeHTML(a)),
		type: q.type
	}));
}

decodeHTML(html) {
	const txt = document.createElement('textarea');
	txt.innerHTML = html;
	return txt.value;
}

displayQuestion() {
	if (this.currentQuestionIndex >= this.questions.length) {
		this.showResults();
		return;
	}

	const question = this.questions[this.currentQuestionIndex];
	const options = this.shuffleArray([...question.incorrectAnswers, question.correctAnswer]);

	// Update UI
	document.getElementById('question-text').textContent = question.question;
	document.getElementById('current-question').textContent = this.currentQuestionIndex + 1;
	document.getElementById('total-questions').textContent = this.questions.length;
	document.getElementById('score').textContent = this.score;

	// Update progress bar
	const progress = ((this.currentQuestionIndex) / this.questions.length) * 100;
	document.getElementById('progress-fill').style.width = `${progress}%`;

	// Create options
	const optionsContainer = document.getElementById('options-container');
	optionsContainer.innerHTML = '';

	options.forEach((option, index) => {
		const optionElement = document.createElement('div');
		optionElement.className = 'option';
		optionElement.textContent = option;
		optionElement.addEventListener('click', () => this.selectAnswer(option));
		optionsContainer.appendChild(optionElement);
	});

	// Reset next button
	document.getElementById('next-btn').disabled = true;
	this.resetTimer();
}

selectAnswer(selectedAnswer) {
	const question = this.questions[this.currentQuestionIndex];
	const options = document.querySelectorAll('.option');

	// Disable all options
	options.forEach(option => {
		option.classList.add('disabled');
		option.style.pointerEvents = 'none';
	});

	// Mark correct and incorrect answers
	options.forEach(option => {
		if (option.textContent === question.correctAnswer) {
			option.classList.add('correct');
		} else if (option.textContent === selectedAnswer && selectedAnswer !== question.correctAnswer) {
			option.classList.add('incorrect');
		}

		if (option.textContent === selectedAnswer) {
			option.classList.add('selected');
		}
	});

	// Update score
	if (selectedAnswer === question.correctAnswer) {
		this.score += 10;
		document.getElementById('score').textContent = this.score;
	}

	// Store user answer
	this.userAnswers.push({
		question: question.question,
		userAnswer: selectedAnswer,
		correctAnswer: question.correctAnswer,
		isCorrect: selectedAnswer === question.correctAnswer
	});

	// Enable next button
	document.getElementById('next-btn').disabled = false;
}

nextQuestion() {
	this.currentQuestionIndex++;
	this.displayQuestion();
}

startTimer() {
	this.resetTimer();
	this.timer = setInterval(() => {
		this.timeLeft--;
		document.getElementById('timer').textContent = this.timeLeft;

		if (this.timeLeft <= 0) {
			this.timeUp();
		}
	}, 1000);
}

resetTimer() {
	this.timeLeft = 60;
	document.getElementById('timer').textContent = this.timeLeft;

	if (this.timer) {
		clearInterval(this.timer);
	}
}

timeUp() {
	clearInterval(this.timer);
	this.userAnswers.push({
		question: this.questions[this.currentQuestionIndex].question,
		userAnswer: 'Time Up',
		correctAnswer: this.questions[this.currentQuestionIndex].correctAnswer,
		isCorrect: false
	});
	this.nextQuestion();
}

showResults() {
	clearInterval(this.timer);
	this.showScreen('results-screen');

	const correctAnswers = this.userAnswers.filter(answer => answer.isCorrect).length;
	const percentage = Math.round((correctAnswers / this.questions.length) * 100);

	// Update results
	document.getElementById('final-score').textContent = this.score;
	document.getElementById('correct-answers').textContent = correctAnswers;
	document.getElementById('total-questions-result').textContent = this.questions.length;
	document.getElementById('percentage').textContent = `${percentage}%`;

	// Set message based on performance
	const messageElement = document.getElementById('results-message');
	if (percentage === 100) {
		messageElement.textContent = 'Perfect! You are a quiz master! 🎉';
		messageElement.style.color = '#48bb78';
	} else if (percentage >= 80) {
		messageElement.textContent = 'Excellent! Great job! 👏';
		messageElement.style.color = '#48bb78';
	} else if (percentage >= 60) {
		messageElement.textContent = 'Good effort! Keep practicing! 💪';
		messageElement.style.color = '#ed8936';
	} else {
		messageElement.textContent = 'Keep learning! You can do better! 📚';
		messageElement.style.color = '#e53e3e';
	}
}

quitQuiz() {
	if (confirm('Are you sure you want to quit? Your progress will be lost.')) {
		this.showSetupScreen();
	}
}

playAgain() {
	this.currentQuestionIndex = 0;
	this.score = 0;
	this.userAnswers = [];
	this.showQuizScreen();
	this.displayQuestion();
	this.startTimer();
}

showSetupScreen() {
	this.resetTimer();
	this.showScreen('setup-screen');
}

showQuizScreen() {
	this.showScreen('quiz-screen');
}

showLoadingScreen() {
	this.showScreen('loading-screen');
}

showErrorScreen(message) {
	document.getElementById('error-message').textContent = message;
	this.showScreen('error-screen');
}

showScreen(screenId) {
	// Hide all screens
	document.querySelectorAll('.screen').forEach(screen => {
		screen.classList.remove('active');
	});

	// Show target screen
	document.getElementById(screenId).classList.add('active');
}

shuffleArray(array) {
	for (let i = array.length - 1; i > 0; i--) {
		const j = Math.floor(Math.random() * (i + 1));
		[array[i], array[j]] = [array[j], array[i]];
	}
	return array;
}
}

// Initialize quiz app when page loads
document.addEventListener('DOMContentLoaded', () => {
	new QuizApp();
});

// Back to dashboard function
function goBack() {
	window.location.href = '../index.html';  // Adjust path as needed
}