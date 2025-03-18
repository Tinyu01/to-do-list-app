document.addEventListener('DOMContentLoaded', () => {
  // Elements
  const tasksList = document.getElementById('tasks-list');
  const newTaskInput = document.getElementById('new-task');
  const addTaskBtn = document.getElementById('add-task');
  const searchInput = document.getElementById('search');
  const emptyState = document.getElementById('empty-state');
  const filterBtns = document.querySelectorAll('.filter-btn');
  const themeToggle = document.querySelector('.theme-toggle');
  const themeIcon = document.getElementById('theme-icon');
  const priorityDots = document.querySelectorAll('.priority-dot');
  
  // Stats elements
  const totalTasksEl = document.getElementById('total-tasks');
  const completedTasksEl = document.getElementById('completed-tasks');
  const pendingTasksEl = document.getElementById('pending-tasks');
  
  // App state
  let tasks = JSON.parse(localStorage.getItem('tasks')) || [];
  let currentFilter = 'all';
  let selectedPriority = 'low';
  
  // Check for saved theme
  if (localStorage.getItem('darkTheme') === 'true') {
    document.body.classList.add('dark-theme');
    themeIcon.classList.replace('fa-moon', 'fa-sun');
  }
  
  // Initialize app
  renderTasks();
  updateStats();
  
  // Event Listeners
  addTaskBtn.addEventListener('click', addTask);
  newTaskInput.addEventListener('keypress', (e) => {
    if (e.key === 'Enter') addTask();
  });
  searchInput.addEventListener('input', filterTasks);
  
  filterBtns.forEach(btn => {
    btn.addEventListener('click', () => {
      filterBtns.forEach(b => b.classList.remove('active'));
      btn.classList.add('active');
      currentFilter = btn.dataset.filter;
      renderTasks();
    });
  });
  
  themeToggle.addEventListener('click', toggleTheme);
  
  priorityDots.forEach(dot => {
    dot.addEventListener('click', () => {
      priorityDots.forEach(d => d.classList.remove('active'));
      dot.classList.add('active');
      selectedPriority = dot.dataset.priority;
    });
  });
  
  // Display the current year in the footer
  const currentYearEl = document.getElementById('current-year');
  currentYearEl.textContent = new Date().getFullYear();
  
  // Functions
  function addTask() {
    const taskText = newTaskInput.value.trim();
    if (taskText === '') return;
    
    const newTask = {
      id: Date.now(),
      text: taskText,
      completed: false,
      date: new Date().toLocaleDateString('en-US', {
        month: 'short',
        day: 'numeric',
        year: 'numeric'
      }),
      priority: selectedPriority
    };
    
    tasks.unshift(newTask);
    saveTasks();
    newTaskInput.value = '';
    renderTasks();
    updateStats();
    
    // Add a little animation to the add button
    addTaskBtn.classList.add('animate-pulse');
    setTimeout(() => {
      addTaskBtn.classList.remove('animate-pulse');
    }, 300);
  }
  
  function renderTasks() {
    let filteredTasks = tasks;
    
    if (currentFilter === 'completed') {
      filteredTasks = tasks.filter(task => task.completed);
    } else if (currentFilter === 'pending') {
      filteredTasks = tasks.filter(task => !task.completed);
    }
    
    // Apply search filter if there's a search term
    const searchTerm = searchInput.value.toLowerCase().trim();
    if (searchTerm) {
      filteredTasks = filteredTasks.filter(task => 
        task.text.toLowerCase().includes(searchTerm)
      );
    }
    
    tasksList.innerHTML = '';
    
    if (filteredTasks.length === 0) {
      emptyState.style.display = 'block';
    } else {
      emptyState.style.display = 'none';
      
      filteredTasks.forEach(task => {
        const taskItem = document.createElement('li');
        taskItem.className = 'task-item';
        taskItem.dataset.id = task.id;
        
        // Add task priority class
        taskItem.classList.add(`priority-${task.priority}`);
        
        taskItem.innerHTML = `
          <input type="checkbox" class="task-checkbox" ${task.completed ? 'checked' : ''}>
          <div class="task-content">
            <div class="task-text">${task.text}</div>
            <div class="task-date">${task.date}</div>
          </div>
          <div class="task-priority">
            <span class="priority-indicator priority-${task.priority}"></span>
          </div>
          <div class="task-actions">
            <button class="task-btn edit-btn">
              <i class="fas fa-edit"></i>
            </button>
            <button class="task-btn delete-btn">
              <i class="fas fa-trash"></i>
            </button>
          </div>
        `;
        
        // Add event listeners to task item elements
        const checkbox = taskItem.querySelector('.task-checkbox');
        checkbox.addEventListener('change', () => toggleTaskComplete(task.id));
        
        const editBtn = taskItem.querySelector('.edit-btn');
        editBtn.addEventListener('click', () => editTask(task.id));
        
        const deleteBtn = taskItem.querySelector('.delete-btn');
        deleteBtn.addEventListener('click', () => deleteTask(task.id));
        
        tasksList.appendChild(taskItem);
      });
    }
  }
  
  function toggleTaskComplete(id) {
    tasks = tasks.map(task => {
      if (task.id === id) {
        return { ...task, completed: !task.completed };
      }
      return task;
    });
    
    saveTasks();
    updateStats();
    
    // If we're filtering by completion status, we need to re-render
    if (currentFilter !== 'all') {
      setTimeout(() => {
        renderTasks();
      }, 300); // Small delay for animation
    }
  }
  
  function editTask(id) {
    const task = tasks.find(task => task.id === id);
    if (!task) return;
    
    const newText = prompt('Edit task:', task.text);
    if (newText === null || newText.trim() === '') return;
    
    tasks = tasks.map(task => {
      if (task.id === id) {
        return { ...task, text: newText.trim() };
      }
      return task;
    });
    
    saveTasks();
    renderTasks();
  }
  
  function deleteTask(id) {
    if (!confirm('Are you sure you want to delete this task?')) return;
    
    tasks = tasks.filter(task => task.id !== id);
    saveTasks();
    renderTasks();
    updateStats();
  }
  
  function filterTasks() {
    renderTasks();
  }
  
  function updateStats() {
    const totalTasks = tasks.length;
    const completedTasks = tasks.filter(task => task.completed).length;
    const pendingTasks = totalTasks - completedTasks;
    
    totalTasksEl.textContent = totalTasks;
    completedTasksEl.textContent = completedTasks;
    pendingTasksEl.textContent = pendingTasks;
  }
  
  function saveTasks() {
    localStorage.setItem('tasks', JSON.stringify(tasks));
  }
  
  function toggleTheme() {
    const isDarkTheme = document.body.classList.toggle('dark-theme');
    localStorage.setItem('darkTheme', isDarkTheme);
    
    if (isDarkTheme) {
      themeIcon.classList.replace('fa-moon', 'fa-sun');
    } else {
      themeIcon.classList.replace('fa-sun', 'fa-moon');
    }
  }
});

// Add smooth animations on page load
window.addEventListener('load', () => {
  document.querySelector('.app-container').style.opacity = '0';
  document.querySelector('.app-container').style.transform = 'translateY(20px)';
  
  setTimeout(() => {
    document.querySelector('.app-container').style.transition = 'opacity 0.5s ease, transform 0.5s ease';
    document.querySelector('.app-container').style.opacity = '1';
    document.querySelector('.app-container').style.transform = 'translateY(0)';
  }, 200);
});