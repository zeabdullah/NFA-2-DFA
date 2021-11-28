import FSA from './classes/FSA';
import State from './classes/State';

import testStringWithDFA from './helpers/testStringWithDFA';
import { renderVizToDOM, vizDfaDrawingContainer, vizNfaDrawingContainer } from './content/viz';

// HTML elements
const NfaTableBody = document.querySelector('#nfa-table tbody') as HTMLTableSectionElement;
const DfaTableBody = document.querySelector('#dfa-table tbody') as HTMLTableSectionElement;
const newStateForm = document.querySelector('#new-state-form') as HTMLFormElement;
const newStateInput = document.querySelector('#new-state-input') as HTMLInputElement;
const newStateFinalCheckbox = document.querySelector(
   '#new-state-checkbox'
) as HTMLInputElement;
const alphabetStrForm = document.querySelector('#new-alphabet-str-form') as HTMLFormElement;
const alphabetStrInput = document.querySelector('#new-alphabet-str-input') as HTMLInputElement;
const testStringForm = document.querySelector('#test-str-form') as HTMLFormElement;
const testStringInput = document.querySelector('#test-str-input') as HTMLInputElement;
const convertButton = document.querySelector('#btn-convert') as HTMLButtonElement;

// Variables
let nfa: FSA;
let dfa: FSA;

// Initialize some things in the page
init();

function init(): void {
   initChips();

   nfa = new FSA();
   updateStatesTable(nfa, NfaTableBody, false);
   preventFormsFromSubmitting();

   newStateForm.addEventListener('submit', newStateSubmitHandler);
   alphabetStrForm.addEventListener('submit', newAlphabetStrSubmitHandler);
   testStringForm.addEventListener('submit', testStringSubmitHandler);
   NfaTableBody.addEventListener('click', iconClickHandler);
   convertButton.addEventListener('click', convertButtonHandler);
}
function initChips(): void {
   const chips = document.querySelectorAll('.chips');
   const instances = M.Chips.init(chips);

   instances.forEach(chip => {
      chip.options.onChipAdd = chipAddHandler;
      chip.options.onChipDelete = chipDeleteHandler;
   });

   function chipAddHandler(this: M.Chips, element: any, chip: Element) {
      const el = element[0] as Element;
      const parentInput = el.parentElement as HTMLInputElement;
      const parentStateRow = el.parentElement?.parentElement as HTMLElement;
      const parentState = nfa.findState(parentStateRow.getAttribute('data-id')!) as State;

      const inputStr = parentInput.getAttribute('data-input-str') as string;
      const chipValue = chip.childNodes[0].textContent as string;

      nfa.addDestinationToState(parentState.id, { input: inputStr, targetId: chipValue });

      renderVizToDOM(nfa, vizNfaDrawingContainer);
   }
   function chipDeleteHandler(this: M.Chips, element: any, chip: Element) {
      const el = element[0] as Element;
      const parentInput = el.parentElement as HTMLInputElement;
      const parentStateRow = el.parentElement?.parentElement as HTMLElement;
      const parentState = nfa.findState(parentStateRow.getAttribute('data-id')!);

      const inputStr = parentInput.getAttribute('data-input-str') as string;
      const chipValue = chip.childNodes[0].textContent as string;

      parentState?.removeDestination({ input: inputStr, targetId: chipValue });

      renderVizToDOM(nfa, vizNfaDrawingContainer);
   }
}

function iconClickHandler(e: MouseEvent): void {
   const target = e.target as HTMLElement;

   if (target.matches('i.delete'))
      deleteStateRow(target.parentElement!.parentElement as HTMLTableRowElement);
   else if (target.matches('i.edit'))
      EditStateRow(target.parentElement!.parentElement as HTMLTableRowElement);
   else if (target.matches('i.save'))
      saveStateRowChanges(target.parentElement!.parentElement as HTMLTableRowElement);
}

function convertButtonHandler(): void {
   if (!nfa.startingStateId) {
      alert('Cannot convert. NFA is null');
      console.warn('Cannot convert. NFA is null');
      return;
   }

   dfa = nfa.convertToDFA();
   console.log(dfa);

   updateStatesTable(dfa, DfaTableBody, true);
   renderVizToDOM(dfa, vizDfaDrawingContainer);
}

function newStateSubmitHandler(): void {
   const newState = new State(newStateInput.value, newStateFinalCheckbox.checked);
   nfa.addState(newState);

   updateStatesTable(nfa, NfaTableBody, false);
   initChips();

   renderVizToDOM(nfa, vizNfaDrawingContainer);
   resetNewStateForm();
}

function newAlphabetStrSubmitHandler(): void {
   nfa.alphabet.set(alphabetStrInput.value, alphabetStrInput.value);

   updateStatesTable(nfa, NfaTableBody, false);
   initChips();

   renderVizToDOM(nfa, vizNfaDrawingContainer);
   resetAlphabetStrForm();
}

function testStringSubmitHandler(): void {
   const testStr: string = testStringInput.value;

   if (!dfa) {
      alert('CANNOT TEST STRING. DFA is null');
      return;
   }

   if (testStringWithDFA(dfa, testStr)) {
      alert('ACCEPTED');
   } else alert('REJECTED');
}

function updateStatesTable(
   fsa: FSA,
   tableBody: HTMLTableSectionElement,
   isDFA: boolean
): void {
   // 1. update column count based on alphabet size
   updateColumnCount(fsa, tableBody);
   // 2. have a row for each state in the nfa
   updateRowCount(fsa, tableBody, isDFA);
}

// update column count based on alphabet size
function updateColumnCount(fsa: FSA, tableBody: HTMLTableSectionElement): void {
   const stateStartingColumn =
      tableBody.parentElement!.querySelector<HTMLTableCellElement>('.th-state-starting')!;

   // clear table from previously inserted alphabet strings
   clearPrevInputStrColumns(tableBody);
   // for each input string in alphabet, create a new {th}
   fsa.alphabet.forEach(inputStr => {
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
   function clearPrevInputStrColumns(tableBody: HTMLTableSectionElement) {
      tableBody.parentElement!.querySelectorAll('.th-input-str').forEach(el => el.remove());
   }
}

function updateRowCount(fsa: FSA, tableBody: HTMLTableSectionElement, isDFA: boolean): void {
   // select {tbody}, the container of all state rows and initialize it
   tableBody.innerHTML = '';

   // fill {tbody} with the state rows one by one
   fsa.states.forEach(state => {
      const completeStateRow = createRowfromState(state, isDFA);
      tableBody.append(completeStateRow);
   });

   initChips();

   function createRowfromState(state: State, isDFA: boolean): HTMLTableRowElement {
      // create table row
      const stateRow = document.createElement('tr');
      stateRow.className = 'state-row';
      stateRow.setAttribute('data-id', state.id);

      // first cell = id
      const idCell = document.createElement('td');
      idCell.className = 'column-id';
      idCell.innerHTML = `<div><input class="input text-cell" value="${state.id}" disabled></div>`;
      stateRow.append(idCell);

      // middle cells = destinations
      fsa.alphabet.forEach(inputStr => {
         // create table cell
         const inputStrCell = document.createElement('td');
         // set class
         inputStrCell.className = 'column-alphabet-str';
         inputStrCell.setAttribute('data-input-str', inputStr);

         // set innerHTML
         inputStrCell.innerHTML = `<div class="chips"><input class="input text-cell" disabled></div>`;
         // append to parent row
         stateRow.append(inputStrCell);
      });

      // next cell = isStarting radio btn
      const radioCell = document.createElement('td');
      radioCell.className = 'column-starting';
      radioCell.innerHTML = `
      <label>
         <input type="radio" class="with-gap" name="starting" ${
            nfa.startingStateId === state.id && 'checked'
         } disabled>
         <span> </span>
      </label>`;
      stateRow.append(radioCell);

      // next cell = isFinal checkbox
      const checkboxCell = document.createElement('td');
      checkboxCell.className = 'column-isfinal';
      checkboxCell.innerHTML = `
      <label>
         <input type="checkbox" class="filled-in" ${state.isFinal && 'checked'} disabled>
         <span> </span>
      </label>`;
      stateRow.append(checkboxCell);

      // last cell = edit/delete icons
      if (!isDFA) {
         const iconsCell = document.createElement('td');
         iconsCell.className = 'column-icons';
         iconsCell.innerHTML = `
         <td>
         <i href="#" class="fa fa-check save green-text"> </i><i href="#"
            class="fa fa-times delete red-text"></i> <i href="#" class="fa fa-edit edit"></i>
         </td>`;
         stateRow.append(iconsCell);
      }

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

function preventFormsFromSubmitting(): void {
   document
      .querySelectorAll('form')
      .forEach(formEl => formEl.addEventListener('submit', e => e.preventDefault()));
}

function deleteStateRow(stateRow: HTMLTableRowElement) {
   const idInput = stateRow.querySelector('.column-id input') as HTMLInputElement;

   nfa.removeState(idInput!.value);
   renderVizToDOM(nfa, vizNfaDrawingContainer);
   stateRow.remove(); // removes stateRow from the DOM
}
function EditStateRow(stateRow: HTMLTableRowElement): void {
   const cellInputs = stateRow.querySelectorAll('input') as NodeListOf<HTMLInputElement>;

   const isFinalCheckboxes = document.querySelectorAll('#nfa-table input[type="checkbox"]');
   isFinalCheckboxes.forEach(checkbox => {
      checkbox.removeEventListener('change', isFinalCheckboxChangeHandler);
      checkbox.addEventListener('change', isFinalCheckboxChangeHandler);
   });

   stateRow.classList.add('editing');

   cellInputs.forEach(cell => cell.removeAttribute('disabled'));
}

function saveStateRowChanges(stateRow: HTMLTableRowElement) {
   const cellInputs = stateRow.querySelectorAll('input') as NodeListOf<HTMLInputElement>;

   stateRow.classList.remove('editing');
   cellInputs.forEach(cell => cell.setAttribute('disabled', 'true'));
}

function isFinalCheckboxChangeHandler(e: Event) {
   const target = e.target as HTMLInputElement;
   const parentStateRow = target.parentElement?.parentElement?.parentElement as HTMLElement;
   const parentState = nfa.findState(parentStateRow.getAttribute('data-id')!) as State;

   nfa.setStateFinal(parentState.id, target.checked);

   renderVizToDOM(nfa, vizNfaDrawingContainer);
}
