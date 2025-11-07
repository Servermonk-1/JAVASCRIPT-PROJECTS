function goBack() {
	window.history.back();
}

const display = document.getElementById('display');
const startBtn = document.getElementById('start-btn');
const pauseBtn = document.getElementById('pause-btn');
const resetBtn = document.getElementById('reset-btn');
const setTimerBtn = document.getElementById('set-timer-btn');
const minutesInput = document.getElementById('minutes');
const secondsInput = document.getElementById('seconds');

let hours = 0, minutes = 0, seconds = 0;
let timerInterval = null;
let isRunning = false;

startBtn.addEventListener('click', () => {
	if (!isRunning) {
		isRunning = true;
		timerInterval = setInterval(updateTime, 1000);
	}
});

pauseBtn.addEventListener('click', () => {
	clearInterval(timerInterval);
	isRunning = false;
});

resetBtn.addEventListener('click', () => {
	clearInterval(timerInterval);
	isRunning = false;
	hours = minutes = seconds = 0;
	updateDisplay();
});

setTimerBtn.addEventListener('click', () => {
	hours = 0;
	minutes = parseInt(minutesInput.value) || 0;
	seconds = parseInt(secondsInput.value) || 0;
	updateDisplay();
	if (timerInterval) clearInterval(timerInterval);
	isRunning = false;
});

function updateTime() {
	seconds++;
	if (seconds >= 60) {
		seconds = 0;
		minutes++;
	}
	if (minutes >= 60) {
		minutes = 0;
		hours++;
	}
	updateDisplay();
}

function updateDisplay() {
	const h = hours.toString().padStart(2, '0');
	const m = minutes.toString().padStart(2, '0');
	const s = seconds.toString().padStart(2, '0');
	display.textContent = `${h}:${m}:${s}`;
}
function goBack() {
	window.location.href = '../index.html';  // Adjust path as needed
}
