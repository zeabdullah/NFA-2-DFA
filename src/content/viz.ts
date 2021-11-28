import Viz from 'viz.js';
import { Module, render } from 'viz.js/full.render.js';
import FSA from '../classes/FSA';
import State from '../classes/State';

export const vizNfaDrawingContainer = document.querySelector(
   '.viz.nfa-drawing'
) as HTMLDivElement;
export const vizDfaDrawingContainer = document.querySelector(
   '.viz.dfa-drawing'
) as HTMLDivElement;

let viz = new Viz({ Module, render });

// const nfa = new FSA();
// configFsa(nfa);
// renderVizToDOM(nfa);

// ========================================
// FUNCTIONS
// ========================================
// configure your nfa changes here
function configFsa(fsa: FSA) {
   const q1 = new State('q1', false, [{ input: '0', targetId: 'q1' }]);
   fsa.addState(q1);
   fsa.addDestinationToState('q1', { input: '1', targetId: 'q2' });

   const q3 = new State('q3', true, [
      { input: '0', targetId: 'q3' },
      { input: '1', targetId: 'q2' }
   ]);
   fsa.addState(q3);

   fsa.addDestinationToState('q2', { input: '1', targetId: 'q3' });
   fsa.setStateFinal('q2', true);
}

// render given FSA to the DOM using Viz
export function renderVizToDOM(fsa: FSA) {
   viz.renderString(convertFsaToVizString(fsa))
      .then(result => {
         vizNfaDrawingContainer.innerHTML = result;
      })
      .catch(error => {
         // Create a new Viz instance (@see Caveats page for more info)
         viz = new Viz({ Module, render });

         // Possibly display the error
         console.error(error);
      });
}

// convert given FSA to a string parsable by Viz
function convertFsaToVizString(fsa: FSA): string {
   // converts finalStates array to a string separating them with commas
   const finalStatesStr = fsa.finalStates.join(',');
   // The top half of the Viz digraph code
   const vizStrStart = `digraph FSA {
   rankdir=LR
   node[shape=point] init
   node [shape=doublecircle] ${finalStatesStr}
   node [shape=circle]

   init -> ${fsa.startingStateId}\n`;

   // the second half of the diraph code where we write a new line for each transition in the FSA
   let vizStrEnd = ``;
   fsa.states.forEach(state => {
      state.destinations.forEach(dest => {
         vizStrEnd += `\t${state.id} -> ${dest.targetId} [label="${dest.input}"]\n`;
      });
   });
   vizStrEnd += `}`;

   console.log(vizStrStart + vizStrEnd);
   return vizStrStart + vizStrEnd;
}
