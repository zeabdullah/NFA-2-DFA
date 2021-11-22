// Imports
import FSA from './classes/FSA';
import State from './classes/State';

// HTML elements
// const canvas = document.querySelector<HTMLCanvasElement>('#canvas')!;
const myNfa = new FSA();
myNfa.addState(new State('q1', false));
myNfa.addState(new State('q2', false));
myNfa.addState(new State('q3', true));
myNfa.addDestinationToState('q1', { input: '0', targetId: 'q1' });
myNfa.addDestinationToState('q1', { input: '0', targetId: 'q2' });
myNfa.addDestinationToState('q1', { input: '1', targetId: 'q1' });
myNfa.addDestinationToState('q2', { input: '1', targetId: 'q3' });

console.log(myNfa);
const dfa = myNfa.convertToDFA();
console.log(dfa);
