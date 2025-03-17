let delay = [];
let notename = [];
let count = 1; // Keep track of unique IDs
let tempo = 1; // Default tempo

document.addEventListener('DOMContentLoaded', function () {
  const gridContainer = document.getElementById('grid-container');
  const Gdiv = document.getElementById('G');
  const Cdiv = document.getElementById('C');
  const Ediv = document.getElementById('E');
  const Adiv = document.getElementById('A');
  const nuty = document.getElementById('nuty');
  const line = document.getElementById('linia');

  // Handle tempo changes
  document.getElementById('tempo').addEventListener('input', function () {
    tempo = this.value * 0.01;
  });

  // Create grid
  const cols = 20;
  const rows = 20;
  for (let i = 0; i < rows * cols; i++) {
    const cell = document.createElement('div');
    cell.setAttribute('class', 'cell');
    gridContainer.appendChild(cell);
  }

  // General function to create draggable notes
  function makeNote(note, container) {
    const div = document.createElement('div');
    div.setAttribute('id', note + count); // Unique ID for each note
    div.setAttribute('class', note);
    div.setAttribute('draggable', 'true');
    div.innerHTML = note;

    // Attach drag events
    div.addEventListener('dragstart', dragStart);
    div.addEventListener('dragend', (e) => {
      if (!div.dataset.placed) {
        count++;
        makeNote(note, container); // Create new note only once
        div.dataset.placed = "true"; // Mark note as placed to prevent duplication
      }
    });

    container.appendChild(div);
  }

  // Create initial notes
  makeNote('G', Gdiv);
  makeNote('C', Cdiv);
  makeNote('E', Ediv);
  makeNote('A', Adiv);

  // Drag and Drop events
  gridContainer.addEventListener('dragover', allowDrop);
  gridContainer.addEventListener('drop', drop);

  function allowDrop(ev) {
    ev.preventDefault();
  }

  function dragStart(ev) {
    ev.dataTransfer.setData("text", ev.target.id);
  }

  function drop(ev) {
    ev.preventDefault();
    const data = ev.dataTransfer.getData("text");
    const draggedElement = document.getElementById(data);

    const gridRect = gridContainer.getBoundingClientRect();
    const cellSize = 5 * window.innerHeight / 100; // Grid cell size
    const y = Math.floor((ev.clientY - gridRect.top) / cellSize);
    const gridCols = 20;
    const cellIndex = y * gridCols;

    const cells = document.querySelectorAll('#grid-container .cell');
    const targetCell = cells[cellIndex];

    // Set note position
    draggedElement.style.top = targetCell.offsetTop + "px";
    draggedElement.style.left = ev.clientX - gridRect.left - draggedElement.offsetWidth / 2 + "px";

    // Ensure the element is placed inside the grid
    ev.target.appendChild(draggedElement);
    draggedElement.classList.add('placed');

    // Update position for playback
    updateNotePosition(draggedElement);
  }

  // Update note position and sound list
  function updateNotePosition(draggedElement) {
    const noteName = draggedElement.classList[0];
    const notePosition = draggedElement.getBoundingClientRect();

    // Find and update existing note position
    const index = notename.indexOf(noteName);
    if (index !== -1) {
      delay[index] = notePosition.left; // Update position
    } else {
      delay.push(notePosition.left);
      notename.push(noteName);
    }
  }

  // Handle playback and line movement
  document.addEventListener('keydown', (ev) => {
    if (ev.key === 'p') {
      Play();
      Move();
    }
  });

  function Play() {
    for (let i = 0; i < delay.length; i++) {
      setTimeout(() => {
        const audio = new Audio(`${notename[i]}.mp3`);
        audio.play();
      }, delay[i] / tempo);
    }
  }

  function Move() {
    const maxPosition = Math.max(...delay);
    line.style.transition = `left ${maxPosition / tempo}ms linear`;
    line.style.left = maxPosition + "px";
  }

  // Handle note menu (b key)
  document.addEventListener('keydown', (ev) => {
    if (ev.key === 'b') {
      Note_Opening(mouse_x, mouse_y);
    }
  });

  let mouse_x = 0, mouse_y = 0;
  document.addEventListener('mousemove', (ev) => {
    mouse_x = ev.clientX;
    mouse_y = ev.clientY;
  });

  function Note_Opening(x, y) {
    nuty.style.display = "block";
    nuty.style.visibility = "visible";
    nuty.style.top = (y - nuty.offsetHeight / 2) + "px";
    nuty.style.left = (x - nuty.offsetWidth / 2) + "px";
  }
});
//https://codepen.io/tomhermans/pen/vYQpwwy