// Elements
const newTaskInput = document.getElementById('new-task');
const addTaskBtn = document.getElementById('add-task-btn');
const taskList = document.getElementById('task-list');
const clearCompletedBtn = document.getElementById('clear-completed');
const clearAllBtn = document.getElementById('clear-all');

// Load tasks from localStorage
let tasks = JSON.parse(localStorage.getItem('tasks')) || [];

function saveTasks() {
	localStorage.setItem('tasks', JSON.stringify(tasks));
}

// Render tasks
function renderTasks() {
	taskList.innerHTML = '';
	tasks.forEach((task, index) => {
		const li = document.createElement('li');
		li.classList.toggle('completed', task.completed);

		// Task text
		const span = document.createElement('span');
		span.textContent = task.text;
		span.className = 'task-text';
		span.addEventListener('click', () => toggleComplete(index));

		// Delete button
		const delBtn = document.createElement('button');
		delBtn.textContent = 'Delete';
		delBtn.className = 'delete-btn';
		delBtn.addEventListener('click', () => deleteTask(index));

		li.appendChild(span);
		li.appendChild(delBtn);
		taskList.appendChild(li);
	});
}

// Add task
function addTask() {
	const text = newTaskInput.value.trim();
	if (text === '') return;
	tasks.push({ text, completed: false });
	newTaskInput.value = '';
	saveTasks();
	renderTasks();
}

// Toggle completed
function toggleComplete(index) {
	tasks[index].completed = !tasks[index].completed;
	saveTasks();
	renderTasks();
}

// Delete task
function deleteTask(index) {
	tasks.splice(index, 1);
	saveTasks();
	renderTasks();
}

// Clear completed with fade animation
function clearCompleted() {
	const completedTasks = document.querySelectorAll('#task-list li.completed');

	completedTasks.forEach((li) => {
		li.classList.add('fading');
		const text = li.querySelector('.task-text').textContent;

		setTimeout(() => {
			tasks = tasks.filter(task => task.text !== text || !task.completed);
			saveTasks();
			renderTasks();
		}, 500); // matches CSS transition
	});
}

// Clear all
function clearAll() {
	tasks = [];
	saveTasks();
	renderTasks();
}

// Event listeners
addTaskBtn.addEventListener('click', addTask);
newTaskInput.addEventListener('keypress', e => {
	if (e.key === 'Enter') addTask();
});
clearCompletedBtn.addEventListener('click', clearCompleted);
clearAllBtn.addEventListener('click', clearAll);

// Initial render
renderTasks();

function goBack() {
	window.location.href = '../index.html';  // Adjust path as needed
}