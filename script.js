document.addEventListener('DOMContentLoaded', () => {
    // --- TASK PLANNER LOGIC ---
    const taskForm = document.getElementById('task-form');
    const taskList = document.getElementById('task-list');

    // Load tasks on page load
    loadTasks();

    taskForm.addEventListener('submit', addTask);

    function addTask(e) {
        e.preventDefault();

        const subject = document.getElementById('task-subject').value;
        const topic = document.getElementById('task-topic').value;
        const dueDate = document.getElementById('task-due-date').value;
        
        if (!subject || !topic || !dueDate) {
            alert("Please fill out all task fields.");
            return;
        }

        const task = {
            id: Date.now(),
            subject,
            topic,
            dueDate,
            completed: false
        };

        saveTask(task);
        renderTask(task);

        taskForm.reset();
    }

    function renderTask(task) {
        const li = document.createElement('li');
        li.setAttribute('data-id', task.id);
        if (task.completed) {
            li.classList.add('completed');
        }

        const dueDateText = task.dueDate || 'No Date';
        
        li.innerHTML = `
            <div class="task-details">
                <p><strong>${task.subject}:</strong> ${task.topic}</p>
                <small>Due: ${dueDateText}</small>
            </div>
            <div class="task-actions">
                <button class="complete-btn">${task.completed ? 'Undo' : 'Complete'}</button>
                <button class="delete-btn">Delete</button>
            </div>
        `;

        taskList.appendChild(li);
    }

    // Event delegation for complete/delete buttons
    taskList.addEventListener('click', (e) => {
        const li = e.target.closest('li');
        if (!li) return;

        const taskId = parseInt(li.getAttribute('data-id'));

        if (e.target.classList.contains('complete-btn')) {
            toggleTaskCompletion(taskId);
        } else if (e.target.classList.contains('delete-btn')) {
            deleteTask(taskId);
        }
    });

    function getTasks() {
        const tasks = localStorage.getItem('focusFlowTasks');
        return tasks ? JSON.parse(tasks) : [];
    }

    function saveTask(task) {
        const tasks = getTasks();
        tasks.push(task);
        localStorage.setItem('focusFlowTasks', JSON.stringify(tasks));
    }

    function loadTasks() {
        const tasks = getTasks();
        // Clear existing list before rendering
        taskList.innerHTML = ''; 
        tasks.forEach(task => renderTask(task));
    }

    function toggleTaskCompletion(taskId) {
        let tasks = getTasks();
        const taskIndex = tasks.findIndex(t => t.id === taskId);

        if (taskIndex > -1) {
            tasks[taskIndex].completed = !tasks[taskIndex].completed;
            localStorage.setItem('focusFlowTasks', JSON.stringify(tasks));
            loadTasks(); // Re-render the list
        }
    }

    function deleteTask(taskId) {
        let tasks = getTasks();
        tasks = tasks.filter(t => t.id !== taskId);
        localStorage.setItem('focusFlowTasks', JSON.stringify(tasks));
        
        // Remove from DOM
        const liToRemove = document.querySelector(`li[data-id="${taskId}"]`);
        if (liToRemove) {
            liToRemove.remove();
        }
    }

    // --- POMODORO TIMER LOGIC ---
    const display = document.getElementById('timer-display');
    const modeDisplay = document.getElementById('timer-mode');
    const startBtn = document.getElementById('start-btn');
    const pauseBtn = document.getElementById('pause-btn');
    const resetBtn = document.getElementById('reset-btn');

    const studyTime = 25 * 60; // 25 minutes
    const breakTime = 5 * 60;  // 5 minutes
    
    let timer;
    let isStudyMode = true;
    let timeLeft = studyTime;
    let isPaused = true;

    function updateDisplay() {
        const minutes = Math.floor(timeLeft / 60);
        const seconds = timeLeft % 60;
        display.textContent = `${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
    }

    function startTimer() {
        if (!isPaused) return; 
        isPaused = false;
        startBtn.textContent = 'Continue';
        
        timer = setInterval(() => {
            if (timeLeft <= 0) {
                clearInterval(timer);
                isPaused = true;
                
                // Switch mode
                isStudyMode = !isStudyMode;
                timeLeft = isStudyMode ? studyTime : breakTime;
                
                const modeText = isStudyMode ? "Study Time" : "Break Time";
                alert(`Time's up! Starting ${modeText}.`);
                modeDisplay.textContent = modeText;
                
                // Automatically start the next session
                startTimer();
                return;
            }

            timeLeft--;
            updateDisplay();
        }, 1000);
    }

    function pauseTimer() {
        clearInterval(timer);
        isPaused = true;
        startBtn.textContent = 'Resume';
    }

    function resetTimer() {
        pauseTimer();
        isStudyMode = true;
        timeLeft = studyTime;
        modeDisplay.textContent = "Study Time";
        startBtn.textContent = 'Start';
        updateDisplay();
    }

    startBtn.addEventListener('click', startTimer);
    pauseBtn.addEventListener('click', pauseTimer);
    resetBtn.addEventListener('click', resetTimer);

    // Initialize timer display
    updateDisplay();
});