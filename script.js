(() => {
  const STORAGE_KEY = 'todo_items_v1';

  /** @type {HTMLFormElement} */
  const form = document.getElementById('todo-form');
  /** @type {HTMLInputElement} */
  const input = document.getElementById('todo-input');
  /** @type {HTMLUListElement} */
  const list = document.getElementById('todo-list');
  /** @type {HTMLButtonElement} */
  const clearCompletedBtn = document.getElementById('clear-completed');
  const filters = document.querySelectorAll('.filter');
  const emptyState = document.getElementById('empty-state');

  /** @typedef {{ id: string, title: string, completed: boolean }} Todo */
  /** @type {Todo[]} */
  let todos = loadTodos();
  let currentFilter = 'all';

  function loadTodos() {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      return raw ? JSON.parse(raw) : [];
    } catch {
      return [];
    }
  }

  function saveTodos() {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(todos));
  }

  function createTodo(title) {
    return { id: crypto.randomUUID ? crypto.randomUUID() : String(Date.now() + Math.random()), title, completed: false };
  }

  function addTodo(title) {
    const trimmed = title.trim();
    if (!trimmed) return;
    todos.unshift(createTodo(trimmed));
    saveTodos();
    render();
  }

  function toggleTodo(id) {
    todos = todos.map(t => t.id === id ? { ...t, completed: !t.completed } : t);
    saveTodos();
    render();
  }

  function deleteTodo(id) {
    todos = todos.filter(t => t.id !== id);
    saveTodos();
    render();
  }

  function clearCompleted() {
    const hadCompleted = todos.some(t => t.completed);
    if (!hadCompleted) return;
    todos = todos.filter(t => !t.completed);
    saveTodos();
    render();
  }

  function setFilter(filter) {
    currentFilter = filter;
    filters.forEach(btn => {
      const isActive = btn.dataset.filter === filter;
      btn.classList.toggle('is-active', isActive);
      btn.setAttribute('aria-pressed', String(isActive));
    });
    render();
  }

  function getFilteredTodos() {
    if (currentFilter === 'active') return todos.filter(t => !t.completed);
    if (currentFilter === 'completed') return todos.filter(t => t.completed);
    return todos;
  }

  function render() {
    const items = getFilteredTodos();
    list.innerHTML = '';
    emptyState.style.display = items.length ? 'none' : 'block';

    for (const t of items) {
      const li = document.createElement('li');
      li.className = 'todo-item' + (t.completed ? ' completed' : '');
      li.setAttribute('data-id', t.id);

      const checkbox = document.createElement('input');
      checkbox.type = 'checkbox';
      checkbox.checked = t.completed;
      checkbox.setAttribute('aria-label', 'Mark as completed');

      const title = document.createElement('span');
      title.className = 'title';
      title.textContent = t.title;

      const delBtn = document.createElement('button');
      delBtn.className = 'icon';
      delBtn.setAttribute('aria-label', 'Delete todo');
      delBtn.textContent = '✕';

      checkbox.addEventListener('change', () => toggleTodo(t.id));
      delBtn.addEventListener('click', () => deleteTodo(t.id));

      li.appendChild(checkbox);
      li.appendChild(title);
      li.appendChild(delBtn);
      list.appendChild(li);
    }
  }

  // Events
  form.addEventListener('submit', (e) => {
    e.preventDefault();
    addTodo(input.value);
    input.value = '';
    input.focus();
  });

  clearCompletedBtn.addEventListener('click', clearCompleted);
  filters.forEach(btn => btn.addEventListener('click', () => setFilter(btn.dataset.filter)));

  // Init
  render();
})();


