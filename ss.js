const loadTasks = () => JSON.parse(localStorage.getItem('tasks') || '[]');
const saveTasks = tasks => localStorage.setItem('tasks', JSON.stringify(tasks));
let tasks = loadTasks();
let currentFilter = 'all';
let editIndex = null;
let deleteAction = null;

const el = {
  taskInput: document.getElementById('taskInput'),
  addBtn: document.getElementById('addBtn'),
  inputError: document.getElementById('inputError'),
  suggestionsList: document.getElementById('suggestionsList'),
  filterBtns: document.querySelectorAll('.filters__button'),
  taskTableBody: document.getElementById('taskTableBody'),
  noTasksMsg: document.getElementById('noTasksMsg'),
  deleteDoneBtn: document.getElementById('deleteDoneBtn'),
  deleteAllBtn: document.getElementById('deleteAllBtn'),
  renameModal: document.getElementById('renameModal'),
  renameInput: document.getElementById('renameInput'),
  renameError: document.getElementById('renameError'),
  renameConfirmBtn: document.getElementById('renameConfirmBtn'),
  renameCancelBtn: document.getElementById('renameCancelBtn'),
  deleteModal: document.getElementById('deleteModal'),
  deleteModalHeader: document.getElementById('deleteModalHeader'),
  deleteConfirmBtn: document.getElementById('deleteConfirmBtn'),
  deleteCancelBtn: document.getElementById('deleteCancelBtn')
};

const formatDate = () => new Date().toISOString().split('T')[0];
const validateInput = value => {
  if (!value.trim()) return 'Cannot be empty.';
  if (/^\d/.test(value)) return 'Must not start with a number.';
  if (value.trim().length < 5) return 'At least 5 characters.';
  return '';
};
const toggleDeleteButtons = () => {
  const hasAny = tasks.length > 0;
  const hasDone = tasks.some(t => t.done);
  el.deleteAllBtn.disabled = !hasAny;
  el.deleteDoneBtn.disabled = !hasDone;
};
const closeModals = () => {
  el.renameModal.classList.add('hidden');
  el.deleteModal.classList.add('hidden');
  el.renameError.textContent = '';
};

const render = () => {
  saveTasks(tasks);
  el.taskTableBody.innerHTML = '';
  const filtered = tasks.filter(t =>
    currentFilter === 'all' ||
    (currentFilter === 'done' && t.done) ||
    (currentFilter === 'todo' && !t.done)
  );
  el.noTasksMsg.style.display = filtered.length ? 'none' : 'block';

  filtered.forEach((task, index) => {
    const row = document.createElement('tr');
    row.innerHTML = `
      <td class="task-table__cell">${task.desc}</td>
      <td class="task-table__actions">
        <input
          type="checkbox"
          class="task-table__checkbox"
          ${task.done ? 'checked' : ''}
          data-index="${index}"
        />
        <i
          class="fa-solid fa-pen task-table__icon task-table__icon--edit"
          data-index="${index}"
        ></i>
        <i
          class="fa-solid fa-trash task-table__icon task-table__icon--delete"
          data-index="${index}"
        ></i>
      </td>`;
    el.taskTableBody.appendChild(row);
  });

  toggleDeleteButtons();
};

render();

el.taskInput.addEventListener('input', () => {
  const error = validateInput(el.taskInput.value);
  el.inputError.textContent = error;
  el.addBtn.disabled = !!error;
  el.suggestionsList.innerHTML = '';

  if (!error) {
    tasks
      .filter(t => t.desc.toLowerCase().includes(el.taskInput.value.toLowerCase()))
      .forEach(t => {
        const li = document.createElement('li');
        li.className = 'suggestions__item';
        li.textContent = t.desc;
        li.addEventListener('click', () => (el.taskInput.value = t.desc));
        el.suggestionsList.appendChild(li);
      });
  }

  el.suggestionsList.classList.toggle('hidden', !el.suggestionsList.children.length);
});

el.addBtn.addEventListener('click', () => {
  const desc = el.taskInput.value.trim();
  if (validateInput(desc)) return;
  tasks.push({ desc, date: formatDate(), done: false });
  el.taskInput.value = '';
  el.inputError.textContent = '';
  render();
});

el.filterBtns.forEach(btn =>
  btn.addEventListener('click', () => {
    el.filterBtns.forEach(b => b.classList.remove('filters__button--active'));
    btn.classList.add('filters__button--active');
    currentFilter = btn.dataset.filter;
    render();
  })
);

document.addEventListener('click', e => {
  const idx = e.target.dataset.index;

  if (e.target.classList.contains('task-table__checkbox')) {
    tasks[idx].done = e.target.checked;
    render();
  }

  if (e.target.classList.contains('task-table__icon--edit')) {
    editIndex = Number(idx);
    el.renameInput.value = tasks[editIndex].desc;
    el.renameModal.classList.remove('hidden');
  }

  if (e.target.classList.contains('task-table__icon--delete')) {
    deleteAction = () => tasks.splice(idx, 1);
    el.deleteModalHeader.textContent = 'Delete this task?';
    el.deleteModal.classList.remove('hidden');
  }
});

el.deleteDoneBtn.addEventListener('click', () => {
  deleteAction = () => (tasks = tasks.filter(t => !t.done));
  el.deleteModalHeader.textContent = 'Delete all done tasks?';
  el.deleteModal.classList.remove('hidden');
});
el.deleteAllBtn.addEventListener('click', () => {
  deleteAction = () => (tasks = []);
  el.deleteModalHeader.textContent = 'Delete all tasks?';
  el.deleteModal.classList.remove('hidden');
});

el.deleteConfirmBtn.addEventListener('click', () => {
  deleteAction(); closeModals(); render();
});
el.deleteCancelBtn.addEventListener('click', closeModals);

el.renameConfirmBtn.addEventListener('click', () => {
  const newVal = el.renameInput.value.trim();
  const err = validateInput(newVal);
  el.renameError.textContent = err;
  if (!err && editIndex !== null) {
    tasks[editIndex].desc = newVal;
    closeModals(); render();
  }
});

el.renameCancelBtn.addEventListener('click', closeModals);
