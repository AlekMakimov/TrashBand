function allowDrop(ev) {
    ev.preventDefault();
  }
  
  function drag(ev) {
    ev.dataTransfer.setData("text", ev.target.id);
  }
  
  function drop(ev) {
    ev.preventDefault();
    var data = ev.dataTransfer.getData("text");
    ev.target.appendChild(document.getElementById(data));
  }
document.addEventListener('DOMContentLoaded', function() {
const table = document.getElementById('table');
var cols = 20;
var rows = 20;

 

  
        for (let i = 0; i < rows; i++) {

            const row = document.createElement('tr');
            for (let j = 0; j < cols; j++) {

                const cell = document.createElement('td'); 
               cell.setAttribute('ondrop','drop(event)');
               cell.setAttribute('ondragover','allowDrop(event)');
                row.appendChild(cell); 

            }
            
            table.appendChild(row);
            
        }
    
    for (let i = 0; i < 20; i++) {
    const div = document.createElement('div');
    div.setAttribute('id', 'drag' + (i+1));
    div.setAttribute('class', 'drag');
    div.setAttribute('draggable', 'true');
    div.setAttribute('ondrop', 'drop(event)');
    div.setAttribute('ondragover', 'allowDrop(event)');
    div.setAttribute('ondragstart', 'drag(event)');
    document.body.appendChild(div);
    }
}
    )


