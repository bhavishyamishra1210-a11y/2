// --- Global Variables and Setup ---
let assignments = [];
const TASK_KEY = 'homeworkHubAssignments';

// Map subjects to CSS classes
const subjectToClass = {
    'Operating System': 'color-os',
    'Design Thinking': 'color-dt',
    'Web Development': 'color-wd',
    'Java': 'color-java'
};

// --- Data Management (Load, Save, Get Color) ---

function loadData() {
    const data = localStorage.getItem(TASK_KEY);
    if (data) {
        assignments = JSON.parse(data);
    }
    renderDashboard();
}

function saveData() {
    localStorage.setItem(TASK_KEY, JSON.stringify(assignments));
}

function getSubjectColorClass(subject) {
    return subjectToClass[subject] || 'color-default'; // Fallback
}


// --- Rendering and Display ---

function renderDashboard() {
    const taskList = document.getElementById('task-list');
    const noTasksMessage = document.getElementById('no-tasks-message');

    // 1. Filter and Sort
    let activeTasks = assignments.filter(task => !task.isCompleted);
    
    // Sort by deadline (ascending)
    activeTasks.sort((a, b) => new Date(a.deadline) - new Date(b.deadline));

    // 2. Clear and Render
    taskList.innerHTML = '';
    
    if (activeTasks.length === 0) {
        noTasksMessage.style.display = 'block';
    } else {
        noTasksMessage.style.display = 'none';
        
        activeTasks.forEach(task => {
            const taskElement = createTaskElement(task);
            taskList.appendChild(taskElement);
        });
    }

    // 3. Update Stats
    updateStats();
}

function createTaskElement(task) {
    const element = document.createElement('div');
    element.className = `task-item ${getSubjectColorClass(task.subject)}`;
    
    // Convert deadline date for display
    const deadlineDate = new Date(task.deadline);
    const formattedDeadline = deadlineDate.toLocaleString('en-IN', { 
        day: 'numeric', month: 'short', year: 'numeric', 
        hour: '2-digit', minute: '2-digit' 
    });
    
    element.innerHTML = `
        <div class="task-details">
            <span class="task-subject">${task.subject}</span>
            <h3 class="task-name">${task.name}</h3>
            <p class="task-deadline">Due: ${formattedDeadline}</p>
            <p class="task-description" style="font-size:0.9em; margin-top:5px;">${task.description || ''}</p>
        </div>
        <div class="task-actions">
            <button class="action-edit" onclick="editTask(${task.id})">⚙️ Edit</button>
            <button class="action-complete" onclick="markComplete(${task.id})">✅ Complete</button>
        </div>
    `;
    return element;
}

// --- Stats and Motivation ---

function updateStats() {
    const completedTasks = assignments.filter(task => task.isCompleted);
    const totalTasks = assignments.length;
    
    const dueToday = assignments.filter(task => {
        const deadline = new Date(task.deadline).toDateString();
        const today = new Date().toDateString();
        return !task.isCompleted && deadline === today;
    });

    document.getElementById('completed-count').textContent = completedTasks.length;
    document.getElementById('due-today-count').textContent = `Due Today: ${dueToday.length}`;
    
    let rate = 0;
    if (totalTasks > 0) {
        rate = Math.round((completedTasks.length / totalTasks) * 100);
    }
    document.getElementById('completion-rate').textContent = `${rate}%`;
}


// --- Task Actions (Add, Edit, Complete) ---

document.getElementById('task-form').addEventListener('submit', function(e) {
    e.preventDefault();
    
    const id = document.getElementById('task-id').value;
    const name = document.getElementById('name').value;
    const subject = document.getElementById('subject').value;
    const deadline = document.getElementById('deadline').value;
    const description = document.getElementById('description').value;
    
    if (id) {
        // Edit existing task
        const taskIndex = assignments.findIndex(t => t.id === parseInt(id));
        if (taskIndex !== -1) {
            assignments[taskIndex] = {
                ...assignments[taskIndex],
                name,
                subject,
                deadline,
                description
            };
        }
    } else {
        // Add new task
        const newTask = {
            id: Date.now(), // Use timestamp as unique ID
            name,
            subject,
            deadline,
            description,
            isCompleted: false,
            completionDate: null
        };
        assignments.push(newTask);
    }

    saveData();
    renderDashboard();
    closeModal();
});

function markComplete(taskId) {
    const taskIndex = assignments.findIndex(t => t.id === taskId);
    if (taskIndex !== -1) {
        assignments[taskIndex].isCompleted = true;
        assignments[taskIndex].completionDate = new Date().toISOString();
        saveData();
        renderDashboard();
    }
}

function editTask(taskId) {
    const task = assignments.find(t => t.id === taskId);
    if (task) {
        document.getElementById('task-id').value = task.id;
        document.getElementById('name').value = task.name;
        document.getElementById('subject').value = task.subject;
        document.getElementById('deadline').value = task.deadline.substring(0, 16); // Format for datetime-local input
        document.getElementById('description').value = task.description;
        document.getElementById('form-submit-btn').textContent = 'Update Assignment';
        openModal();
    }
}


// --- Modal Functions ---

function openModal() {
    document.getElementById('task-modal').style.display = 'block';
    // Reset form for new task if not editing
    if (!document.getElementById('task-id').value) {
         document.getElementById('task-form').reset();
         document.getElementById('task-id').value = '';
         document.getElementById('form-submit-btn').textContent = 'Save Assignment';
    }
}

function closeModal() {
    document.getElementById('task-modal').style.display = 'none';
}

function viewCompleted() {
    // In a full application, this would redirect to a 'completed.html' page.
    // For this simple example, we'll just alert the list.
    const completedList = assignments
        .filter(t => t.isCompleted)
        .map(t => `${t.name} (${t.subject}) - Completed on: ${new Date(t.completionDate).toLocaleDateString()}`)
        .join('\n');
        
    alert("Completed Assignments:\n\n" + (completedList || "No completed tasks yet!"));
}

// Close the modal if the user clicks outside of it
window.onclick = function(event) {
    const modal = document.getElementById('task-modal');
    if (event.target == modal) {
        closeModal();
    }
}


// --- Initialize Application ---
// Call loadData when the page finishes loading
window.addEventListener('load', loadData);

// Note: Deadline reminders need a server-side component to send actual notifications (like email/push).
// In this front-end only code, the 'Due Today' count serves as the reminder display.