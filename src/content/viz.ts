import Viz from 'viz.js';
import { Module, render } from 'viz.js/full.render.js';
import FSA from '../classes/FSA';
import State from '../classes/State';

const vizDrawingContainer = document.querySelector('.viz') as HTMLDivElement;

let viz = new Viz({ Module, render });

const nfa = new FSA();
const q1 = new State('q1', false, [{ input: '0', targetId: 'q1' }]);
nfa.addState(q1);
const q3 = new State('q3', true, [
   { input: '0', targetId: 'q3' },
   { input: '1', targetId: 'q2' }
]);

nfa.addDestinationToState('q1', { input: '1', targetId: 'q2' });
nfa.addDestinationToState('q2', { input: '1', targetId: 'q3' });
nfa.addState(q3);

console.log(nfa);

const finalStatesStr = nfa.finalStates.join(',');
console.log(finalStatesStr);

// TODO: dynamically create renderString
viz.renderString(
   `digraph FSA {
      rankdir=LR
      node[shape=point] init
      node [shape=doublecircle] ${finalStatesStr}
      node [shape=circle]
      init -> q1
      q1 -> q2 [label="1"]
      q2 -> q2 [label="1"]
   }`
)
   .then(result => {
      vizDrawingContainer.innerHTML = result;
   })
   .catch(error => {
      // Create a new Viz instance (@see Caveats page for more info)
      viz = new Viz({ Module, render });

      // Possibly display the error
      console.error(error);
   });
[].join(',');
