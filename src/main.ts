//Variables
// 0 - Variables
// 1 - Todo functions
// 2 - Style functions
// 3 - Onload functions

import Sortable from 'sortablejs';

// 0 - Variables //////////////////////////////////////////////////////////////////////

//Init types and variables
interface Todo {
  text: string;
  active: boolean;
}
let todoArray: Todo[] = [
  {
    text: 'Your todos are saved in local storage',
    active: true,
  },
  {
    text: 'Your theme is also automatically detected and saved',
    active: true,
  },
  {
    text: 'This is a completed todo',
    active: false,
  },
];

const filterLinks = Array.from(
  document.querySelectorAll('.todos-list__filter a')
) as HTMLAnchorElement[];

// 1 - Todo functions //////////////////////////////////////////////////////////////////////

// Main search bar
const form: HTMLFormElement = document.querySelector('#main-input-form')!;
const completedFilter = document.getElementById('completed-filter') as HTMLAnchorElement;
const mainInputHandler = (event: Event): void => {
  const mainInput: HTMLInputElement = document.querySelector('#main-input')!;
  event.preventDefault();
  if (mainInput.value) {
    const newTodo: Todo = {
      text: mainInput.value,
      active: true,
    };
    todoArray.push(newTodo);
    localStorage.setItem('todo-list', JSON.stringify(todoArray));
    howManyTodosLeft();
    if (!completedFilter.classList.contains('active-filter')) {
      createTodoHTML(newTodo);
    }
    form.reset();
  }
};

// Drag and drop sort
const dragArea = document.getElementById('todos-list') as HTMLElement;
Sortable.create(dragArea, {
  animation: 350,
});

// Update local storage data after drop event
const updateTodoListAfterDrag = (): void => {
  const actualList = Array.from(document.querySelectorAll('#todos-list li')) as HTMLLIElement[];
  let newToDoArray: Todo[] = [];
  actualList.forEach((li) => {
    const liText: string = li.querySelector('p')!.textContent!;
    const liActive: boolean = li.querySelector('p')!.classList.contains('checked');
    newToDoArray.push({ text: liText, active: !liActive });
  });
  localStorage.setItem('todo-list', JSON.stringify(newToDoArray));
};

// Create one todo html
const template: Node = document.querySelector('template')!.content.cloneNode(true);
const todoLI: ChildNode = template.childNodes[1];

const createTodoHTML = (todo: Todo): void => {
  const newLI = todoLI.cloneNode(true) as HTMLLIElement;
  newLI.querySelector('p')!.textContent = todo.text;
  if (!todo.active) {
    newLI.querySelector('.todo__circle')!.classList.add('checked');
    newLI.querySelector('.todo__description')!.classList.add('checked');
  }

  newLI.querySelector('.todo__close')!.addEventListener('click', deleteTodo);
  newLI.querySelector('.todo__circle')!.addEventListener('click', checkTodo);
  newLI.addEventListener('drop', updateTodoListAfterDrag);

  document.querySelector('#todos-list')!.appendChild(newLI);
};

// Delete one todo
const deleteTodo = (event: Event): void => {
  const todoTarget = event.currentTarget as HTMLLIElement;
  const todoText = todoTarget.previousElementSibling!.textContent as string;
  const todoToBeDeleted = todoTarget.parentElement! as HTMLLIElement;
  document.querySelector('.todos-list')!.removeChild(todoToBeDeleted);

  const index: number = todoArray.findIndex((item: Todo) => item.text === todoText);
  todoArray.splice(index, 1);

  localStorage.setItem('todo-list', JSON.stringify(todoArray));
  howManyTodosLeft();
};

// Reset TodoList and update it with new content
const updateTodoList = (array: Todo[] | null): void => {
  document.querySelector('#todos-list')!.innerHTML = '';
  array?.forEach((todo) => createTodoHTML(todo));
};

const clearCompleted = (): void => {
  todoArray = todoArray.filter((todo) => todo.active === true);
  localStorage.setItem('todo-list', JSON.stringify(todoArray));
  updateTodoList(todoArray);

  filterLinks.forEach((item) => item.classList.remove('active-filter'));
  document.querySelectorAll('.todos-list__filter a')[0].classList.add('active-filter');
};

// Filter todo list function
const filterTodoList = (event: Event): void => {
  let filteredArray: Todo[] = [];
  const target = event.target! as HTMLAnchorElement;
  filterLinks.forEach((item) => item.classList.remove('active-filter'));
  target.classList.add('active-filter');
  switch (target.textContent) {
    case 'All':
      filteredArray = todoArray.slice();
      break;
    case 'Active':
      filteredArray = todoArray.filter((todo) => todo.active === true);
      break;
    case 'Completed':
      filteredArray = todoArray.filter((todo) => todo.active === false);
      break;
  }
  updateTodoList(filteredArray);
};

// Check Todo List
const checkTodo = (event: Event): void => {
  const todoCircle = event.currentTarget as HTMLDivElement;
  const todoDescription = todoCircle.nextElementSibling as HTMLParagraphElement;
  const todoText = todoDescription.textContent as string;
  todoCircle.classList.toggle('checked');
  todoDescription.classList.toggle('checked');

  const index: number = todoArray.findIndex((item: Todo) => item.text === todoText);
  todoArray[index].active = !todoArray[index].active;

  localStorage.setItem('todo-list', JSON.stringify(todoArray));
  howManyTodosLeft();
};

// Updates HTML element displaying remaining todos
const howManyTodosLeft = (): void => {
  let counter = 0 as number;
  todoArray.forEach((item) => (item.active ? (counter += 1) : ''));
  const response = todoArray.length === 0 ? 'No items left' : (`${counter} items left` as string);
  document.querySelector('#remaining-todos')!.textContent = response;
};

// 2 - Style functions //////////////////////////////////////////////////////////////////////

// Theme switch

const changeThemeToDark = (): void => {
  document.body.setAttribute('data-theme', 'dark');
  localStorage.setItem('theme', 'dark');
};
const changeThemeToLight = (): void => {
  document.body.setAttribute('data-theme', 'light');
  localStorage.setItem('theme', 'light');
};

const themeToggle = (): void => {
  localStorage.getItem('theme') === 'light' ? changeThemeToDark() : changeThemeToLight();

  document.querySelectorAll('header img')!.forEach((img) => img.classList.toggle('disappear'));
};

// Detects user prefered theme and saves the info
const detectUserPreferedTheme = (): void => {
  if (localStorage.getItem('theme') === 'light') return;
  if (window.matchMedia('(prefers-color-scheme: dark)').matches) {
    localStorage.setItem('theme', 'light');
    themeToggle();
  } else {
    localStorage.setItem('theme', 'light');
  }
};

// Change filter display depending on screen size

const filterCheck = (): void => {
  const filterWrapperInside = document.querySelector('.filter-wrapper-inside');
  const filterWrapperOutside = document.querySelector('.filter-wrapper-outside');
  if (window.innerWidth <= 768) {
    filterWrapperOutside!.appendChild(document.querySelector('.todos-list__filter')!);
  } else {
    filterWrapperInside!.appendChild(document.querySelector('.todos-list__filter')!);
  }
};

// 3 - Onload functions //////////////////////////////////////////////////////////////////////

const addEventListeners = (): void => {
  form.addEventListener('submit', mainInputHandler);
  filterLinks.forEach((link) => link.addEventListener('click', filterTodoList));
  document.querySelector('.todos-list__clear')?.addEventListener('click', clearCompleted);
  document.querySelector('header button')!.addEventListener('click', themeToggle);
  window.addEventListener('resize', filterCheck);
};

//Checks if todo needs to be loaded from localStorage
const loadTodo = (): void => {
  if (
    localStorage.getItem('todo-list') === null ||
    JSON.parse(localStorage.getItem('todo-list')!).length === 0
  ) {
    localStorage.setItem('todo-list', JSON.stringify(todoArray));
  } else {
    todoArray = JSON.parse(localStorage.getItem('todo-list')!);
  }
};

const init = (): void => {
  loadTodo();
  detectUserPreferedTheme();
  addEventListeners();
  updateTodoList(JSON.parse(localStorage.getItem('todo-list')!));
  howManyTodosLeft();
};

init();
