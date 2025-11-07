// Elements
const dobInput = document.getElementById('dob');
const calculateBtn = document.getElementById('calculate-btn');
const resetBtn = document.getElementById('reset-btn');
const resultDiv = document.getElementById('age-result');

// Calculate Age Function
function calculateAge() {
	const dobValue = dobInput.value;
	if (!dobValue) {
		resultDiv.textContent = "Please enter your date of birth!";
		return;
	}

	const dob = new Date(dobValue);
	const today = new Date();

	if (dob > today) {
		resultDiv.textContent = "You can't be born in the future 😅";
		return;
	}

	let years = today.getFullYear() - dob.getFullYear();
	let months = today.getMonth() - dob.getMonth();
	let days = today.getDate() - dob.getDate();

	// Adjust if current month/day is before birthday
	if (days < 0) {
		months--;
		days += new Date(today.getFullYear(), today.getMonth(), 0).getDate();
	}

	if (months < 0) {
		years--;
		months += 12;
	}

	resultDiv.textContent = `You are ${years} year(s), ${months} month(s), and ${days} day(s) old 🎉`;
}

// Reset Function
function resetAgeCalc() {
	dobInput.value = '';
	resultDiv.textContent = "Your age will appear here...";
}

// Event Listeners
calculateBtn.addEventListener('click', calculateAge);
resetBtn.addEventListener('click', resetAgeCalc);

// Optional: Enter key triggers calculation
dobInput.addEventListener('keypress', e => {
	if (e.key === 'Enter') calculateAge();
});

// Back to dashboard function
function goBack() {
	window.location.href = '../index.html'; // Adjust path as needed
}
