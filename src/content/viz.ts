import Viz from 'viz.js';
import { Module, render } from 'viz.js/full.render.js';
import FSA from '../classes/FSA';

export const vizNfaDrawingContainer = document.querySelector(
   '.viz.nfa-drawing'
) as HTMLDivElement;
export const vizDfaDrawingContainer = document.querySelector(
   '.viz.dfa-drawing'
) as HTMLDivElement;

let viz = new Viz({ Module, render });

// ========================================
// FUNCTIONS
// ========================================
// render given FSA to the DOM using Viz
export function renderVizToDOM(fsa: FSA, vizContainer: HTMLDivElement): void {
   viz.renderString(convertFsaToVizString(fsa))
      .then(result => {
         vizContainer.innerHTML = result;
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
   let finalStatesArr = fsa.finalStates;

   finalStatesArr = finalStatesArr.map(str => `"${str}"`);
   for (let str of fsa.finalStates) {
      str = `"${str}"`;
   }
   const finalStatesStr = finalStatesArr.join(',');

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
         vizStrEnd += `\t"${state.id}" -> "${dest.targetId}" [label="${dest.input}"]\n`;
      });
   });
   vizStrEnd += `}`;

   return vizStrStart + vizStrEnd;
}
