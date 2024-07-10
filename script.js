const tasksList = document.getElementById('tasks-list');
const newTaskInput = document.getElementById('new-task');
const searchInput = document.getElementById('search');
const addTaskButton = document.getElementById('add-task');

function getTasksFromStorage() {
  const tasksJSON = localStorage.getItem('tasks');
  return tasksJSON ? JSON.parse(tasksJSON) : [];
}

function setTasksToStorage(tasks) {
  localStorage.setItem('tasks', JSON.stringify(tasks));
}

function displayTasks(tasks) {
  tasksList.innerHTML = '';
  tasks.forEach((task) => {
    const listItem = document.createElement('li');
    const taskInput = document.createElement('input');
    taskInput.type = 'text';
    taskInput.value = task;
    taskInput.readOnly = true;

    const editButton = document.createElement('button');
    editButton.textContent = 'Edit';
    editButton.addEventListener('click', () => {
      taskInput.readOnly = false;
      taskInput.focus();
      editButton.textContent = 'Save';
      editButton.addEventListener('click', () => {
        const updatedTasks = tasks.map((t) => (t === task ? taskInput.value : t));
        setTasksToStorage(updatedTasks);
        displayTasks(updatedTasks);
      });
    });

    const deleteButton = document.createElement('button');
    deleteButton.textContent = 'Delete';
    deleteButton.addEventListener('click', () => {
      const updatedTasks = tasks.filter((t) => t !== task);
      setTasksToStorage(updatedTasks);
      displayTasks(updatedTasks);
    });

    listItem.appendChild(taskInput);
    listItem.appendChild(editButton);
    listItem.appendChild(deleteButton);
    tasksList.appendChild(listItem);
  });
}

function addTask() {
  const newTask = newTaskInput.value.trim();
  if (!newTask) return;

  const tasks = getTasksFromStorage();
  tasks.push(newTask);
  setTasksToStorage(tasks);
  displayTasks(tasks);
  newTaskInput.value = '';
}

addTaskButton.addEventListener('click', addTask);

function searchTasks() {
  const searchTerm = searchInput.value.toLowerCase().trim();
  const tasks = getTasksFromStorage();
  const filteredTasks = tasks.filter((task) => task.toLowerCase().includes(searchTerm));
  displayTasks(filteredTasks);
}

searchInput.addEventListener('keyup', searchTasks);

// Load tasks from storage on page load
displayTasks(getTasksFromStorage());