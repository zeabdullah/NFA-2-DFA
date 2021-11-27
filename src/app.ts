import FSA from './classes/FSA';
import State from './classes/State';

// HTML elements
const tableDataRows = document.querySelectorAll<HTMLTableRowElement>('.data-row'),
   newStateForm = document.querySelector<HTMLFormElement>('#new-state-form')!,
   alphabetStrForm = document.querySelector<HTMLFormElement>('#new-alphabet-str-form')!,
   alphabetStrInput = document.querySelector<HTMLInputElement>('#new-alphabet-str-input')!,
   newStateInput = document.querySelector<HTMLInputElement>('#new-state-input')!,
   isFinalCheckbox = document.querySelector<HTMLInputElement>('#new-state-checkbox')!,
   alphabetCols = document.querySelector<HTMLDivElement>('.alphabet-cols')!;
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
   newStateForm?.addEventListener('submit', newStateSubmitHandler);
   newStateForm?.addEventListener('submit', newAlphabetStrSubmitHandler);
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
   // 3.
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
      newInputStrColumn.textContent = inputStr;
      newInputStrColumn.className = 'th-input-str';

      stateStartingColumn.before(newInputStrColumn);
   }
   function clearPrevInputStrColumns() {
      document.querySelectorAll('.th-input-str').forEach(el => el.remove());
   }
}

// TODO: Stopped here
function updateRowCount() {
   nfa.states.forEach(state => createStateTableRow);
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
