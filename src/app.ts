import FSA from './classes/FSA';
import State from './classes/State';

// HTML elements
const tableDataRows = document.querySelectorAll<HTMLTableRowElement>('.data-row'),
   newStateForm = document.querySelector<HTMLFormElement>('#new-state-form')!,
   newStateInput = document.querySelector<HTMLInputElement>('#new-state-input')!,
   isFinalCheckbox = document.querySelector<HTMLInputElement>('#new-state-checkbox')!,
   alphabetStrForm = document.querySelector<HTMLFormElement>('#new-alphabet-str-form')!,
   alphabetStrInput = document.querySelector<HTMLInputElement>('#new-alphabet-str-input')!;
// Variables
let nfa: FSA;

init();

function init() {
   const chips = document.querySelectorAll('.chips');
   M.Chips.init(chips);
   nfa = new FSA();
   nfa.alphabet.set('b', 'b');
   nfa.alphabet.set('c', 'c');

   preventFormsFromSubmitting();
   initEditRowListeners();

   newStateForm.addEventListener('submit', newStateSubmitHandler);
   alphabetStrForm.addEventListener('submit', newAlphabetStrSubmitHandler);
}

function newStateSubmitHandler() {
   const newState = new State(newStateInput.value, isFinalCheckbox.checked);
   nfa.addState(newState) && console.log('new State added to nfa', nfa);

   updateStatesTable(nfa);

   resetNewStateForm();
}

function newAlphabetStrSubmitHandler() {
   resetAlphabetStrForm();
}

function updateStatesTable(nfa: FSA) {
   // 1. update column count based on alphabet size
   updateColumnCount();

   // 2. have a row for each state in the nfa
   updateRowCount();
}

// 1. update column count based on alphabet size
function updateColumnCount() {
   const stateStartingColumn =
      document.querySelector<HTMLTableCellElement>('.th-state-starting')!;

   clearPrevInputStrColumns();

   // for each input string in alphabet, create a new {th}
   nfa.alphabet.forEach(inputStr => {
      insertInputStrColumn(inputStr);
   });

   // creates a new <th>{inputStr}</th>
   function insertInputStrColumn(inputStr: string) {
      // create the {th}
      const newInputStrColumn = document.createElement('th');
      // fill {th} with {inputStr}
      newInputStrColumn.textContent = inputStr;
      // give it the below class
      newInputStrColumn.className = 'th-input-str';

      // insert this new {th} before the stateStarting {th}
      stateStartingColumn.before(newInputStrColumn);
   }

   // clears table from previously inserted alphabet strings
   function clearPrevInputStrColumns() {
      document.querySelectorAll('.th-input-str').forEach(el => el.remove());
   }
}

function updateRowCount() {
   // select {tbody}, the container of all state rows and initialize it
   const tableBody = document.querySelector('tbody')!;
   tableBody.innerHTML = '';

   // fill {tbody} with the state rows one by one
   nfa.states.forEach(state => {
      const completeStateRow = createRowfromState(state);
      tableBody.append(completeStateRow);
   });

   function createRowfromState(state: State): HTMLTableRowElement {
      // create table row
      const stateRow = document.createElement('tr');

      // first cell = id
      const idCell = document.createElement('td');
      idCell.innerHTML = `<div><input class="input" value="${state.id}"></div>`;
      stateRow.append(idCell);

      // middle cells = destinations
      nfa.alphabet.forEach(inputStr => {
         // create table cell
         const inputStrCell = document.createElement('td');
         // set innerHTML
         inputStrCell.innerHTML = `<div class="chips"><input class="input"></div>`;
         // append to parent row
         stateRow.append(inputStrCell);
      });

      // next cell = isStarting radio btn
      const radioCell = document.createElement('td');
      radioCell.innerHTML = `
      <td class="column-starting">
         <label>
            <input type="radio" class="with-gap" name="starting">
            <span>yes</span>
         </label>
      </td>`;
      stateRow.append(radioCell);

      // next cell = isFinal checkbox
      const checkboxCell = document.createElement('td');
      checkboxCell.innerHTML = `
      <td class="column-isfinal">
         <label>
            <input type="checkbox" class="filled-in" checked="checked">
            <span>yes</span>
         </label>
      </td>`;
      stateRow.append(checkboxCell);

      // last cell = edit/delete icons
      const iconsCell = document.createElement('td');
      iconsCell.innerHTML = `
      <td>
      <i href="#" class="fa fa-check save green-text"> </i><i href="#"
         class="fa fa-times delete red-text"></i> <i href="#" class="fa fa-edit edit"></i>
      </td>`;
      stateRow.append(iconsCell);

      // after appending all cells, return the row
      return stateRow;
   }
}

function resetNewStateForm() {
   newStateInput.value = '';
}
function resetAlphabetStrForm() {
   alphabetStrInput.value = '';
}

function preventFormsFromSubmitting() {
   document
      .querySelectorAll('form')
      .forEach(formEl => formEl.addEventListener('submit', e => e.preventDefault()));
}

function initEditRowListeners() {
   tableDataRows.forEach(dataRow => {
      dataRow.addEventListener('click', (e: MouseEvent) => {
         const target = e.target as HTMLElement;

         if (target.matches('i.delete')) deleteDataRow(dataRow);
         else if (target.matches('i.edit')) editDataRow(dataRow);
      });
   });
}

function deleteDataRow(dataRow: HTMLTableRowElement) {
   dataRow.remove(); // .remove() is a DOM function
}
function editDataRow(dataRow: HTMLTableRowElement) {
   const textCells = dataRow.querySelectorAll<HTMLTableCellElement>('.cell-text');

   dataRow.classList.toggle('editing');
   if (dataRow.classList.contains('editing'))
      textCells.forEach(cell => cell.setAttribute('contenteditable', 'true'));
   else textCells.forEach(cell => cell.setAttribute('contenteditable', 'false'));
}
