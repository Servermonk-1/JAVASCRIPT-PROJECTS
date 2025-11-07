class ScientificCalculator {
	constructor() {
		this.currentOperand = '0';
		this.previousOperand = '';
		this.operation = undefined;
		this.memory = 0;
		this.shouldResetScreen = false;

		this.initializeEventListeners();
		this.updateDisplay();
	}

	initializeEventListeners() {
		// Number buttons
		document.querySelectorAll('.num-btn').forEach(button => {
			button.addEventListener('click', () => {
				this.appendNumber(button.textContent);
			});
		});

		// Operation buttons
		document.querySelectorAll('.op-btn').forEach(button => {
			button.addEventListener('click', () => {
				this.chooseOperation(button.textContent);
			});
		});

		// Scientific function buttons
		document.querySelectorAll('.sci-btn').forEach(button => {
			button.addEventListener('click', () => {
				this.handleScientificFunction(button.dataset.operation);
			});
		});

		// Memory buttons
		document.querySelectorAll('.mem-btn').forEach(button => {
			button.addEventListener('click', () => {
				this.handleMemoryFunction(button.dataset.operation);
			});
		});

		// Clear button
		document.querySelector('[data-operation="clear"]').addEventListener('click', () => {
			this.clear();
		});

		// Equals button
		document.querySelector('[data-operation="="]').addEventListener('click', () => {
			this.compute();
		});

		// Keyboard support
		document.addEventListener('keydown', (event) => {
			this.handleKeyboardInput(event);
		});
	}

	appendNumber(number) {
		if (this.shouldResetScreen) {
			this.currentOperand = '';
			this.shouldResetScreen = false;
		}

		if (number === '.' && this.currentOperand.includes('.')) return;

		if (this.currentOperand === '0' && number !== '.') {
			this.currentOperand = number;
		} else {
			this.currentOperand += number;
		}

		this.updateDisplay();
	}

	chooseOperation(op) {
		if (this.currentOperand === '') return;

		if (this.previousOperand !== '') {
			this.compute();
		}

		switch (op) {
			case '+':
			case '-':
			case '×':
			case '÷':
			case '%':
				this.operation = op;
				this.previousOperand = this.currentOperand;
				this.shouldResetScreen = true;
				break;
			case '±':
				this.currentOperand = (parseFloat(this.currentOperand) * -1).toString();
				break;
			case '(':
			case ')':
				this.currentOperand += op;
				break;
		}

		this.updateDisplay();
	}

	handleScientificFunction(func) {
		let result;
		const current = parseFloat(this.currentOperand);

		switch (func) {
			case 'sin':
				result = Math.sin(current * Math.PI / 180);
				break;
			case 'cos':
				result = Math.cos(current * Math.PI / 180);
				break;
			case 'tan':
				result = Math.tan(current * Math.PI / 180);
				break;
			case 'log':
				result = Math.log10(current);
				break;
			case 'ln':
				result = Math.log(current);
				break;
			case 'π':
				result = Math.PI;
				break;
			case 'e':
				result = Math.E;
				break;
			case '√':
				result = Math.sqrt(current);
				break;
			case 'x²':
				result = Math.pow(current, 2);
				break;
			case 'x³':
				result = Math.pow(current, 3);
				break;
		}

		if (result !== undefined) {
			this.currentOperand = result.toString();
			this.shouldResetScreen = true;
			this.updateDisplay();
		}
	}

	handleMemoryFunction(func) {
		switch (func) {
			case 'mc':
				this.memory = 0;
				break;
			case 'mr':
				this.currentOperand = this.memory.toString();
				this.shouldResetScreen = true;
				break;
			case 'm+':
				this.memory += parseFloat(this.currentOperand);
				break;
			case 'm-':
				this.memory -= parseFloat(this.currentOperand);
				break;
		}
		this.updateDisplay();
	}

	compute() {
		let computation;
		const prev = parseFloat(this.previousOperand);
		const current = parseFloat(this.currentOperand);

		if (isNaN(prev) || isNaN(current)) return;

		switch (this.operation) {
			case '+':
				computation = prev + current;
				break;
			case '-':
				computation = prev - current;
				break;
			case '×':
				computation = prev * current;
				break;
			case '÷':
				computation = prev / current;
				break;
			case '%':
				computation = prev % current;
				break;
			default:
				return;
		}

		this.currentOperand = computation.toString();
		this.operation = undefined;
		this.previousOperand = '';
		this.shouldResetScreen = true;
		this.updateDisplay();
	}

	clear() {
		this.currentOperand = '0';
		this.previousOperand = '';
		this.operation = undefined;
		this.updateDisplay();
	}

	updateDisplay() {
		const currentOperationElement = document.getElementById('current-operation');
		const previousOperationElement = document.getElementById('previous-operation');

		currentOperationElement.textContent = this.currentOperand;

		if (this.operation != null) {
			previousOperationElement.textContent =
				`${this.previousOperand} ${this.operation}`;
		} else {
			previousOperationElement.textContent = '';
		}
	}

	handleKeyboardInput(event) {
		if (event.key >= '0' && event.key <= '9') {
			this.appendNumber(event.key);
		} else if (event.key === '.') {
			this.appendNumber('.');
		} else if (event.key === '+' || event.key === '-' || event.key === '*' || event.key === '/') {
			const operations = {
				'+': '+',
				'-': '-',
				'*': '×',
				'/': '÷'
			};
			this.chooseOperation(operations[event.key]);
		} else if (event.key === 'Enter' || event.key === '=') {
			event.preventDefault();
			this.compute();
		} else if (event.key === 'Escape' || event.key === 'Delete') {
			this.clear();
		} else if (event.key === 'Backspace') {
			this.currentOperand = this.currentOperand.toString().slice(0, -1);
			if (this.currentOperand === '') this.currentOperand = '0';
			this.updateDisplay();
		}
	}
}

// Initialize calculator when page loads
document.addEventListener('DOMContentLoaded', () => {
	new ScientificCalculator();
});

// Back to dashboard function
function goBack() {
	window.location.href = '../index.html'; // Adjust path as needed
}