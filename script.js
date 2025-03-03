let delay = [];
let notename = [];

document.addEventListener('DOMContentLoaded', function() {
  document.getElementById('tempo').addEventListener('input', function() {
    tempo = this.value*0.01;
  });
  const gridContainer = document.getElementById('grid-container');
  const Gdiv = document.getElementById('G');
  const Cdiv = document.getElementById('C');
  const Ediv = document.getElementById('E');
  const Adiv = document.getElementById('A');
  const nuty = document.getElementById('nuty');
  const cols = 20;
  const rows = 20;
  const line = document.getElementById('linia');

  // Tworzenie siatki
  for (let i = 0; i < rows * cols; i++) {
      const cell = document.createElement('div');
      cell.setAttribute('class', 'cell');
      gridContainer.appendChild(cell);
  }

  // Tworzenie przeciąganych elementów
  let count = 1; // Licznik do tworzenia unikalnych ID
  const G = document.querySelector('.G');

  function Gmake() {
    const div = document.createElement('div');
    div.setAttribute('id', 'G' + count); // Unikalne ID dla każdej nuty
    div.setAttribute('class', 'G');
    div.setAttribute('draggable', 'true');
    div.addEventListener('dragstart', dragStart);
    div.addEventListener('dragend', function() {
      // Po zakończeniu przeciągania, tworzymy nową nutę G
      count++; // Zwiększamy licznik ID
      Gmake();  // Wywołanie funkcji tworzącej kolejną nutę
    });
    div.innerHTML = "G";
    Gdiv.appendChild(div);
  }
  
  Gmake();
  
  const C = document.querySelector('.C');
  function Cmake() {
    const div = document.createElement('div');
    div.setAttribute('id', 'C' + count); // Unikalne ID dla każdej nuty
    div.setAttribute('class', 'C');
    div.setAttribute('draggable', 'true');
    div.addEventListener('dragstart', dragStart);
    div.addEventListener('dragend', function() {
      // Po zakończeniu przeciągania, tworzymy nową nutę C
      count++; // Zwiększamy licznik ID
      Cmake();  // Wywołanie funkcji tworzącej kolejną nutę
    });
    div.innerHTML = "C";
    Cdiv.appendChild(div);
  }
  
  Cmake();
const E = document.querySelector('.E');
function Emake() {
  const div = document.createElement('div');
  div.setAttribute('id', 'E' + count); // Unikalne ID dla każdej nuty
  div.setAttribute('class', 'E');
  div.setAttribute('draggable', 'true');
  div.addEventListener('dragstart', dragStart);
  div.addEventListener('dragend', function() {
    // Po zakończeniu przeciągania, tworzymy nową nutę E
    count++; // Zwiększamy licznik ID
    Emake();  // Wywołanie funkcji tworzącej kolejną nutę
  });
  div.innerHTML = "E";
  Ediv.appendChild(div);
}

Emake();
const A = document.querySelector('.A');

function Amake() {
  const div = document.createElement('div');
  div.setAttribute('id', 'A' + count); // Unikalne ID dla każdej nuty
  div.setAttribute('class', 'A');
  div.setAttribute('draggable', 'true');
  div.addEventListener('dragstart', dragStart);
  div.addEventListener('dragend', function() {
    // Po zakończeniu przeciągania, tworzymy nową nutę A
    count++; // Zwiększamy licznik ID
    Amake();  // Wywołanie funkcji tworzącej kolejną nutę
  });
  div.innerHTML = "A";
  Adiv.appendChild(div);
}

Amake();

  gridContainer.addEventListener('dragover', allowDrop);
  gridContainer.addEventListener('drop', drop);
  
});

function allowDrop(ev) {
  ev.preventDefault();
}

function dragStart(ev) {
  ev.dataTransfer.setData("text", ev.target.id);
 
}

function drop(ev) {
  ev.preventDefault();
  var data = ev.dataTransfer.getData("text");
  var draggedElement = document.getElementById(data);

  let gridRect = document.getElementById('grid-container').getBoundingClientRect();
  let cellSize = 5 * window.innerHeight / 100; // Rozmiar komórki w px

  // Obliczamy pozycję na osi Y (dopasowanie do siatki)
  let y = Math.floor((ev.clientY - gridRect.top) / cellSize);

  // Znajdowanie komórki w siatce
  let gridCols = 20; // liczba kolumn w siatce
  let cellIndex = y * gridCols; // Indeks komórki na podstawie wiersza

  // Pobieramy komórkę siatki, ale tylko na osi Y (na osi X użytkownik może ustawić sam)
  let cells = document.querySelectorAll('#grid-container .cell');
  let targetCell = cells[cellIndex];

  // Ustawiamy pozycję elementu na osi Y
  draggedElement.style.top = targetCell.offsetTop + "px";
  
  // Ustawienie pozycji na osi X (pozycja uzyskiwana z kliknięcia myszą)
  draggedElement.style.left = ev.clientX - gridRect.left - draggedElement.offsetWidth / 2 + "px";
  ev.target.appendChild(draggedElement);
  
  draggedElement.classList.add('placed');
  
  Sound(draggedElement);

}

document.addEventListener('mousemove', (ev) => {
  mouse_x = ev.clientX;
  mouse_y = ev.clientY;
});

document.addEventListener('keydown', (ev) => {
  if (ev.key == 'b') {
    Note_Opening(mouse_x, mouse_y);
  }
});
document.addEventListener('keydown', (ev) => {
  if(ev.key == 'p'){
  Play();  
  Move();
  }
});
function Note_Opening(x, y) {
  nuty.style.display = "block";
  nuty.style.visibility = "visible";
  nuty.style.top = (y - nuty.offsetHeight / 2) + "px";
  nuty.style.left = (x - nuty.offsetWidth / 2) + "px";
}
function Sound(draggedElement){
  if (draggedElement.classList.contains('placed')) {
    let noteclass =draggedElement.className.replace('placed',"").trim();
   let noteposition = draggedElement.getBoundingClientRect();
    delay.push(noteposition.left);
    notename.push(noteclass);
    
}}
function Move(){
  line.style.left = Math.max(...delay) + "px";
}
function Play(){
  for (let i = 0; i < delay.length; i++) {
    setTimeout(() => {
      let audio = new Audio(`${notename[i]}.mp3`);
      audio.play();
    }, delay[i]/tempo); 
  }
}
