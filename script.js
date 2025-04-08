let notes = []; // store each note's ID, type, and X position
let count = 1;
let tempo = 1;

document.addEventListener('DOMContentLoaded', function () {
  const gridContainer = document.getElementById('grid-container');
  const Gdiv = document.getElementById('G');
  const Cdiv = document.getElementById('C');
  const Ediv = document.getElementById('E');
  const Adiv = document.getElementById('A');
  const nuty = document.getElementById('nuty');
  const line = document.getElementById('linia');


  document.getElementById('tempo').addEventListener('input', function () {
    tempo = 60000 / this.value;
  });

  // Create grid
  var cols = 20;
   rows = 20;
  for (let i = 0; i < rows * cols; i++) {
    const cell = document.createElement('div');
    cell.setAttribute('class', 'cell');
    gridContainer.appendChild(cell);
  }

  function makeNote(note, container) {
    const div = document.createElement('div');
    div.setAttribute('id', note + count);
    div.setAttribute('class', note);
    div.setAttribute('draggable', 'true');
    div.innerHTML = note;

    div.addEventListener('dragstart', dragStart);
    div.addEventListener('dragend', () => {
      if (!div.dataset.placed) {
        count++;
        makeNote(note, container);
        div.dataset.placed = "true";
      }
    });

    container.appendChild(div);
  }

  // Initial notes
  makeNote('G', Gdiv);
  makeNote('C', Cdiv);
  makeNote('E', Ediv);
  makeNote('A', Adiv);

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
    const cellSize = 5 * window.innerHeight / 100;
    const y = Math.floor((ev.clientY - gridRect.top) / cellSize);
    const gridCols = 20;
    const cellIndex = y * gridCols;

    const cells = document.querySelectorAll('#grid-container .cell');
    const targetCell = cells[cellIndex];

    draggedElement.style.top = targetCell.offsetTop + "px";
    draggedElement.style.left = ev.clientX - gridRect.left - draggedElement.offsetWidth / 2 + "px";

    ev.target.appendChild(draggedElement);
    draggedElement.classList.add('placed');

    // Get pitch directly from the slider
    

    const noteId = draggedElement.id;
    const noteType = draggedElement.classList[0];
    const notePosition = draggedElement.getBoundingClientRect().left;

    // Push note with updated pitch value
    notes.push({
        id: noteId,
        type: noteType,
        position: notePosition,
        pitch: document.getElementById('pitch-slider').value
    });

    updateNotePosition(draggedElement);
}


  function updateNotePosition(draggedElement) {
    const noteId = draggedElement.id;
    const noteType = draggedElement.classList[0];
    const notePosition = draggedElement.getBoundingClientRect().left;

    // Remove any old entry for this note
    notes = notes.filter(n => n.id !== noteId);

    notes.push({
      id: noteId,
      type: noteType,
      position: notePosition,
      pitch: document.getElementById('pitch-slider').value
    });
  }

  document.addEventListener('keydown', (ev) => {
    if (ev.key === 'p') {
      Play();
      Move();
      
    } else if (ev.key === 'b') {
      Note_Opening(mouse_x, mouse_y);
    }
    else if (ev.key === 'c') {
      console.log(notes);
    }
  });

  function Play() {
    for (let i = 0; i < notes.length; i++) {
      setTimeout(() => {
        const note = notes[i];
        // Create the path based on note type and pitch
        const audio = new Audio(`${note.type}/${note.type}${note.pitch}.mp3`);
        console.log(`${note.type}/${note.type}${note.pitch}.mp3`);
        audio.play();
      }, (notes[i].position / gridContainer.offsetWidth) * tempo * 20);
    }
  }
  
  

  function Move() {
    const bpm = document.getElementById('tempo').value;
    const beatDuration = 60 / bpm; // seconds per beat
    const gridCols = 20;
    const totalTime = gridCols * beatDuration * 1000; // convert to ms
  
    line.style.transition = `none`; // reset previous animation
    line.style.left = "0px";
  
    // Force a reflow so browser registers left = 0
    void line.offsetWidth;
  
    line.style.transition = `left ${totalTime}ms linear`;
    line.style.left = "50%";
  }

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
  document.getElementById('pitch-slider').addEventListener('input', function () {
    updateNoteLabels();
  });
  
  updateNoteLabels();  
  
  function updateNoteLabels() {
    const pitch = document.getElementById('pitch-slider').value;
    const baseNotes = ['G', 'C', 'E', 'A'];
  
    baseNotes.forEach(note => {
      const noteDivs = document.querySelectorAll(`.${note}:not(.placed)`);
      noteDivs.forEach(div => {
        div.innerHTML = pitch == 0 ? note : note + pitch;
      });
    });
  }
  
});