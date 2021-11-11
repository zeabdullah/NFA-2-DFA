// Imports
import FSA from "./classes/FSA";
import State from "./classes/State";

// HTML elements
// const canvas = document.querySelector<HTMLCanvasElement>('#canvas')!;
const myNfa = new FSA();

myNfa.addState(new State("q1"));
myNfa.addDestinationToState("q0", {
  input: "0",
  id: "q5",
});

const anId = "q1";

// myNfa.states.find(state => state.id === anId)?.addDestination({ id: "q3", input: "0" });

console.log(myNfa.states);

// myNfa.states.forEach(state => {
//    state.id === "q1" && state.setIsFinal(true);
// });
