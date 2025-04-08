let notes = []; // store each note's ID, type, and X position
let count = 1;
let tempo = 120; // Default tempo in BPM
let isPlaying = false;
let animationId = null;
let gridExpandTimeout = null;

document.addEventListener('DOMContentLoaded', function () {
  const landingOverlay = document.getElementById('landing-overlay');
  const playButton = document.getElementById('play-button');
  const helpButton = document.getElementById('help-button');
  const helpContent = document.getElementById('help-content');
  const mainHeader = document.getElementById('main-header');
  const gridContainer = document.getElementById('grid-container');
  const Gdiv = document.getElementById('G');
  const Cdiv = document.getElementById('C');
  const Ediv = document.getElementById('E');
  const Adiv = document.getElementById('A');
  const nuty = document.getElementById('nuty');
  const line = document.getElementById('linia');
  const tempoInput = document.getElementById('tempo');
  const pitchSlider = document.getElementById('pitch-slider');
  const pitchValue = document.getElementById('pitch-value');
  
  
 
  // Set default tempo value
  tempoInput.value = tempo;

  // Landing page interactions
  playButton.addEventListener('click', function() {
    landingOverlay.style.opacity = '0';
    setTimeout(() => {
      landingOverlay.style.display = 'none';
      mainHeader.classList.add('visible');
    }, 500);
  });

  helpButton.addEventListener('click', function() {
    helpContent.classList.toggle('hidden');
    helpButton.textContent = helpContent.classList.contains('hidden') ? 'How to Use' : 'Hide Help';
  });

  tempoInput.addEventListener('input', function () {
    tempo = parseFloat(this.value) || 120;
    // Update any playing animation
    if (isPlaying) {
      stopPlayback();
      Play();
      Move();
    }
  });
  
  pitchSlider.addEventListener('input', function() {
    pitchValue.textContent = this.value;
  updateNoteLabels();
  });
  
  
  // Create grid
  var cols = 20;
  var rows = 20;
  for (let i = 0; i < rows * cols; i++) {
    const cell = document.createElement('div');
    cell.setAttribute('class', 'cell');
    cell.dataset.index = i;
    gridContainer.appendChild(cell);
  }

  function makeNote(note, container) {
    const div = document.createElement('div');
    div.setAttribute('id', note + count);
    div.setAttribute('class', note);
    div.setAttribute('draggable', 'true');
    div.dataset.pitch = pitchSlider.value;
    div.innerHTML = note + (div.dataset.pitch == "0" ? "" : div.dataset.pitch);

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
    checkAndExpandGrid(ev.clientX, ev.clientY);
  }

  function dragStart(ev) {
    ev.dataTransfer.setData("text", ev.target.id);
  }
  
  function checkAndExpandGrid(x, y) {
    const gridRect = gridContainer.getBoundingClientRect();
    const buffer = 50; // pixels from edge to trigger expansion
    
    // Clear any existing timeout to prevent multiple expansions
    if (gridExpandTimeout) clearTimeout(gridExpandTimeout);
    
    gridExpandTimeout = setTimeout(() => {
      // Check right edge
      if (x > gridRect.right - buffer) {
        addGridColumn();
      }
      
      // Check bottom edge
      if (y > gridRect.bottom - buffer) {
        addGridRow();
      }
      
      // Check top edge (expand upward if needed)
      if (y < gridRect.top + buffer) {
        addGridRow('top');
      }
    }, 200); // Small delay to prevent too rapid expansion
  }
  
  function addGridColumn() {
    const currentCols = getComputedStyle(gridContainer).getPropertyValue('grid-template-columns').split(' ').length;
    gridContainer.style.gridTemplateColumns = `repeat(${currentCols + 1}, minmax(50px, 1fr))`;
    
    // Add cells for the new column
    const rowCount = getComputedStyle(gridContainer).getPropertyValue('grid-auto-rows').split(' ').length;
    for (let i = 0; i < rowCount; i++) {
      const cell = document.createElement('div');
      cell.setAttribute('class', 'cell');
      gridContainer.appendChild(cell);
    }
  }
  
  function addGridRow(position = 'bottom') {
    const currentRows = Math.ceil(gridContainer.childElementCount / 
                                 getComputedStyle(gridContainer).getPropertyValue('grid-template-columns').split(' ').length);
    
    // Add new row worth of cells
    const colCount = getComputedStyle(gridContainer).getPropertyValue('grid-template-columns').split(' ').length;
    
    for (let i = 0; i < colCount; i++) {
      const cell = document.createElement('div');
      cell.setAttribute('class', 'cell');
      
      if (position === 'top') {
        gridContainer.prepend(cell);
        
        // Adjust positions of existing notes
        const placedNotes = document.querySelectorAll('.placed');
        placedNotes.forEach(note => {
          const currentTop = parseInt(note.style.top || '0');
          note.style.top = (currentTop + 50) + 'px'; // Shift down by row height
        });
      } else {
        gridContainer.appendChild(cell);
      }
    }
  }

  function drop(ev) {
    ev.preventDefault();
    const data = ev.dataTransfer.getData("text");
    const draggedElement = document.getElementById(data);
  
    // Get the grid container position
    const gridRect = gridContainer.getBoundingClientRect();
    
    // Calculate position
    const x = ev.clientX - gridRect.left;
    const rawY = ev.clientY - gridRect.top;
    
    // Get cell size for snapping
    const cellHeight = 50; // Base cell height from your CSS
    
    // Calculate snapped Y position - round to nearest cell
    const snappedY = Math.round(rawY / cellHeight) * cellHeight;
    
    // Position the element at exact drop position for X, but snapped for Y
    draggedElement.style.top = snappedY + "px";
    draggedElement.style.left = x + "px";
    
    // Add to the grid and mark as placed
    gridContainer.appendChild(draggedElement);
    draggedElement.classList.add('placed');
  
    // Get note info and store the note data
    updateNotePosition(draggedElement);
    
    // Sort notes by position
    sortNotes();
  }

  function updateNotePosition(draggedElement) {
    const noteId = draggedElement.id;
    const noteType = draggedElement.classList[0];
    const notePosition = parseFloat(draggedElement.style.left);
    const pitch = draggedElement.dataset.pitch || pitchSlider.value;

    // Remove any old entry for this note
    notes = notes.filter(n => n.id !== noteId);

    // Add the updated note
    notes.push({
      id: noteId,
      type: noteType,
      position: notePosition,
      pitch: pitch
    });
    
    // Update the note element to display current pitch
    draggedElement.dataset.pitch = pitch;
  }
  
  // Sort notes by position
  function sortNotes() {
    notes.sort((a, b) => a.position - b.position);
  }

  document.addEventListener('keydown', (ev) => {
    if (ev.key === 'p') {
      if (isPlaying) {
        stopPlayback();
      } else {
        Play();
        Move();
      }
    } else if (ev.key === 'b') {
      Note_Opening(mouse_x, mouse_y);
    } else if (ev.key === 'c') {
      console.log(notes);
    } else if (ev.key === 's') {
      stopPlayback();
    }
  });

  function stopPlayback() {
    isPlaying = false;
    line.style.transition = 'none';
    line.style.left = "0px";
    // Clear any pending timeouts
    if (animationId) {
      cancelAnimationFrame(animationId);
      animationId = null;
      
    }
  }

  function Play() {
    if (notes.length === 0) return;
    
    isPlaying = true;
    sortNotes(); // Ensure notes are sorted
    
    // Calculate total playback duration based on tempo
    const beatDuration = 60 / tempo; // seconds per beat
    const gridWidth = gridContainer.scrollWidth;
    const gridCols = parseInt(getComputedStyle(gridContainer).getPropertyValue('grid-template-columns').split(' ').length);
    const totalDuration = gridCols * beatDuration * 1000; // in ms
    
    // Start playback for each note
    notes.forEach(note => {
      // Calculate when to play this note based on its position
      const noteDelay = (note.position / gridWidth) * totalDuration;
      
      setTimeout(() => {
        if (!isPlaying) return; // Skip if playback was stopped
        
        // Play the audio
        try {
          const audio = new Audio(`${note.type}/${note.type}${note.pitch}.mp3`);
          audio.play().catch(err => console.error("Error playing audio:", err));
          
          // Visual feedback - pulse the note
          const noteElement = document.getElementById(note.id);
          if (noteElement) {
            noteElement.classList.add('playing');
            setTimeout(() => noteElement.classList.remove('playing'), 200);
          }
          
        } catch (e) {
          console.error("Failed to play audio for note:", note, e);
        }
      }, noteDelay);
    });
  }

  function Move() {
    if (!isPlaying) return;
    
    const totalTime = (60 / tempo) * 
                     parseInt(getComputedStyle(gridContainer).getPropertyValue('grid-template-columns').split(' ').length) * 
                     1000; // duration in ms
    
    line.style.transition = `none`;
    line.style.left = "0px";
    
    // Force a reflow so browser registers left = 0
    void line.offsetWidth;
    
    line.style.transition = `left ${totalTime}ms linear`;
    line.style.left = gridContainer.scrollWidth + "px";
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
    const pitch = pitchSlider.value;
    const baseNotes = ['G', 'C', 'E', 'A'];
  
    baseNotes.forEach(note => {
      const noteDivs = document.querySelectorAll(`.${note}:not(.placed)`);
      noteDivs.forEach(div => {
        div.dataset.pitch = pitch;
        div.innerHTML = pitch == 0 ? note : note + pitch;
      });
    });
  }
  
  // Close note palette when clicking outside
  document.addEventListener('click', function(event) {
    if (!nuty.contains(event.target) && event.target.id !== 'nuty') {
      nuty.style.visibility = 'hidden';
    }
  });
  
  // Add CSS class for playing note animation
  const style = document.createElement('style');
  style.textContent = `
    .playing {
      transform: scale(1.1);
      box-shadow: 0 0 15px rgba(255, 255, 255, 0.8);
      transition: all 0.1s ease;
    }
  `;
  document.head.appendChild(style);
  
  // Initialize grid to make sure it's 100% width
  gridContainer.style.width = '100%';
  
  // Add drag functionality to placed notes for repositioning
  function enableNoteDragging() {
    const placedNotes = document.querySelectorAll('.placed');
    placedNotes.forEach(note => {
      note.addEventListener('mousedown', startDrag);
    });
    
    let draggedNote = null;
    let offsetX, offsetY;
    
    function startDrag(e) {
      if (isPlaying) return; // Don't allow dragging during playback
      
      draggedNote = this;
      const rect = draggedNote.getBoundingClientRect();
      offsetX = e.clientX - rect.left;
      offsetY = e.clientY - rect.top;
      
      document.addEventListener('mousemove', onDrag);
      document.addEventListener('mouseup', stopDrag);
      
      e.preventDefault(); // Prevent text selection
    }
    
    function onDrag(e) {
      if (!draggedNote) return;
      
      const gridRect = gridContainer.getBoundingClientRect();
      const x = e.clientX - gridRect.left - offsetX;
      const rawY = e.clientY - gridRect.top - offsetY;
      
      // Get cell size and calculate snapped Y position
      const cellHeight = 50; // Base cell height from your CSS
      const snappedY = Math.round(rawY / cellHeight) * cellHeight;
      
      // Keep note within grid bounds
      const noteWidth = draggedNote.offsetWidth;
      const noteHeight = draggedNote.offsetHeight;
      const maxX = gridContainer.scrollWidth - noteWidth;
      const maxY = gridContainer.scrollHeight - noteHeight;
      
      draggedNote.style.left = Math.max(0, Math.min(maxX, x)) + 'px';
      draggedNote.style.top = Math.max(0, Math.min(maxY, snappedY)) + 'px';
      
      // Check if we need to expand the grid
      checkAndExpandGrid(e.clientX, e.clientY);
      
      // Update note position in our notes array
      updateNotePosition(draggedNote);
    }
    
    function stopDrag() {
      document.removeEventListener('mousemove', onDrag);
      document.removeEventListener('mouseup', stopDrag);
      draggedNote = null;
      
      // Resort notes
      sortNotes();
    }
  }
  
  // Call this initially and whenever notes are added
  enableNoteDragging();
  
  // Create a MutationObserver to watch for new notes being added
  const observer = new MutationObserver(mutations => {
    mutations.forEach(mutation => {
      if (mutation.type === 'childList' && mutation.addedNodes.length > 0) {
        // Check if any added nodes are notes
        mutation.addedNodes.forEach(node => {
          if (node.classList && 
              (node.classList.contains('G') || 
               node.classList.contains('C') || 
               node.classList.contains('E') || 
               node.classList.contains('A'))) {
            // New note added, enable dragging
            enableNoteDragging();
          }
        });
      }
    });
  });
  
  // Start observing the grid container
  observer.observe(gridContainer, { childList: true });
  
  // Double-click to remove placed notes
  gridContainer.addEventListener('dblclick', function(e) {
    if (e.target.classList.contains('G') || 
        e.target.classList.contains('C') || 
        e.target.classList.contains('E') || 
        e.target.classList.contains('A')) {
      
      const noteId = e.target.id;
      
      // Remove from notes array
      notes = notes.filter(note => note.id !== noteId);
      
      // Remove from DOM
      e.target.remove();
    }
  });
});
