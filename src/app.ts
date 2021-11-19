// Imports
import FSA from './classes/FSA';
import State from './classes/State';

// HTML elements
// const canvas = document.querySelector<HTMLCanvasElement>('#canvas')!;
const myNfa = new FSA();
myNfa.addState(new State('q1', false));
myNfa.addDestinationToState('q1', { input: '0', targetId: 'q1' });
myNfa.addDestinationToState('q1', { input: '1', targetId: 'q1' });
myNfa.addDestinationToState('q1', { input: '1', targetId: 'q2' });
myNfa.addDestinationToState('q2', { input: '1', targetId: 'q1' });

console.log(myNfa);

const dfa = myNfa.convertToDFA();
console.log(dfa);
