import State, { Destination } from './State';

export default class FSA {
   // Properties
   states: State[] | []; // was thinking of type: Map<string, State>;
   startingStateId?: string;
   finalStates: string[] | [];
   alphabet: string[] | [];

   // Constructor(s)
   constructor(
      states: State[] = [],
      startingStateId?: string,
      finalStates: string[] = [],
      alphabet: string[] = []
   ) {
      this.states = states;
      this.startingStateId = startingStateId;
      this.finalStates = finalStates;
      this.alphabet = alphabet;
   }

   // add a new state to FSM
   addState({ id, isFinal = false, destinations = [] }: State): boolean {
      const newState = { id, isFinal, destinations } as State;

      if (this.states.length === 0) {
         this.startingStateId = id;
         this.states = [newState];
         return true;
      }

      if (this.states.find((state: State) => state.id === id)) {
         alert(`Duplicate state '${id}' already found. new state NOT added.`);
         return false;
      }

      this.states = [...this.states, newState];

      if (newState.isFinal) {
         // push new state to this.finalStates
         this.finalStates = [...this.finalStates, newState.id];
      }

      this.alphabet.forEach(input => {
         newState.destinations.forEach(destination => {
            if (input !== destination.input) {
               this.alphabet = [...this.alphabet, input];
               return;
            }
         });
      });

      return true;
   }

   addDestinationToState(stateId: string, newDestination: Destination): boolean {
      // if the state we want to mutate doesn't exist, don't do anything.
      if (!this.findState(stateId)) return false;

      const { input, id: targetId } = newDestination;

      const chosenState = this.findState(targetId);
      // if target id doesn't exist, create new state with that id
      if (!chosenState) {
         this.addState(new State(targetId));
         return true;
      }

      const alreadyExists = chosenState.destinations.find(
         currDestination =>
            currDestination.input === input && currDestination.id === targetId
      );

      if (!alreadyExists) {
         chosenState.destinations = [...chosenState.destinations, newDestination];
         return true;
      }

      alert(
         `Duplicate destination [${input}, ${targetId}] found. new destination NOT added.`
      );
      return false;
   }

   // find state by its ID
   findState(id: string): State | undefined {
      return this.states.find((state: State) => state.id === id);
   }

   // convert NFA to DFA
   convertToDFA(): void {
      // 1. merge destinations of same input to a single object
      // 2.
      // TODO implementation...
   }
}
