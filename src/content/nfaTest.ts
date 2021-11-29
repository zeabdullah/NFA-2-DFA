import FSA from '../classes/FSA';
import State from '../classes/State';

const myNfa = new FSA();
myNfa.addState(
   new State('q1', false, [
      { input: '0', targetId: 'q1' },
      { input: '0', targetId: 'q2' },
      { input: '1', targetId: 'q1' }
   ])
);
myNfa.addState(new State('q2', false, [{ input: '1', targetId: 'q3' }]));
myNfa.addState(new State('q3', true));

console.log(myNfa);
const dfa = myNfa.convertToDFA();
console.log(dfa);
