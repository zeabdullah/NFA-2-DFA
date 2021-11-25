import FSA from '../classes/FSA';
import State from '../classes/State';

// html elements
const newStateForm = document.querySelector<HTMLFormElement>('#new-state-form')!;
const newStateInput = document.querySelector<HTMLInputElement>('#new-state-input')!;
const thead = document.querySelector<HTMLTableSectionElement>('.thead')!;
const tbAllStates = document.querySelector<HTMLTableSectionElement>('.all-states')!;

// init NFA
const nfa = new FSA();

newStateForm.addEventListener('submit', event => {
   event.preventDefault();

   // store new id
   const newId = newStateInput.value;
   // name newState with new id
   const newState = new State(newId, false);
   // add newState to our NFA
   if (nfa.addState(newState)) {
      updateNfaTable();
   }

   newStateInput.value = '';
});

function updateTheadLang(): HTMLTableCellElement[] {
   return nfa.alphabet.map(input => {
      const thInput = document.createElement('th');
      thInput.append(input);

      return thInput;
   });
}

function updateTableRows(): HTMLTableRowElement[] {
   return nfa.states.map(currState => {
      // <td class="state-id">{currState.id}</td>
      function createTdId(): HTMLTableCellElement {
         const tdId = document.createElement('td');
         tdId.classList.add('state-id');

         tdId.append(currState.id);

         return tdId;
      }

      // <td class="state-is-final">
      function createTdIsFinal(): HTMLTableCellElement {
         const tdIsFinal = document.createElement('td');
         tdIsFinal.classList.add('state-is-final');
         // inside it is a checkbox
         const checkbox = document.createElement('input');
         checkbox.setAttribute('type', 'checkbox');
         currState.isFinal && checkbox.setAttribute('checked', 'true');

         tdIsFinal.append(checkbox);

         return tdIsFinal;
      }

      // <td class="state-is-starting"><input type="radio" name="is-starting"/></td>
      function createTdIsStarting(): HTMLTableCellElement {
         const tdIsStarting = document.createElement('td');
         tdIsStarting.classList.add('state-is-starting');
         // inside it is a checkbox
         const radio = document.createElement('input');

         radio.setAttribute('type', 'radio');
         radio.setAttribute('name', 'is-starting');

         tdIsStarting.append(radio);

         return tdIsStarting;
      }

      // MAIN ELEMENT
      const trState = document.createElement('tr');
      trState.classList.add('state-row');

      trState.append(createTdId());

      // <td class="state-transition">{currDestination.id}</td> for each destination
      trState.append(
         // TODO: replace with myNfa.language.map
         ...nfa.alphabet.map(input => {
            const tdDestination = document.createElement('td');
            tdDestination.classList.add('state-transition');

            const matchingDestination = currState.destinations.find(
               dest => dest.input === input
            );
            matchingDestination && tdDestination.append(matchingDestination.id);

            return tdDestination;
         })
      );

      trState.append(createTdIsFinal());
      trState.append(createTdIsStarting());

      return trState;
   });
}

function updateNfaTable() {
   thead.replaceChildren(...updateTheadLang()); // TODO: html needs fixing
   tbAllStates.replaceChildren(...updateTableRows());
}

nfa.alphabet = ['0', '1', 'a'];
updateNfaTable();
console.log(nfa.alphabet);

// myNfa.addState(new State("q0", true, [{ input: "0", destinationId: "q1" }]));
