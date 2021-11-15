// old file for some references, just in case.

import State, { Destination } from './State';

interface FSAInterface {
   states: State[] | []; // was thinking of type: Map<string, State>;
   startingStateId?: string;
   finalStates: string[] | [];
   alphabet: string[] | [];

   addState(newState: State): boolean;
   dropState(id: string): State | undefined;
   renameState(oldId: String, newId: string): State;
   findState(id: string): State | undefined;

   setStartingState(id: string): any; // idk yet

   addDestinationToState(stateId: string, newDestination: Destination): boolean;
   dropDestinationFromState(stateId: string, destinationToDrop: Destination): Destination;

   // The Big Mann
   convertToDFA(): FSA;
}

export default class FSA implements FSAInterface {
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

   // find state by its ID
   findState(id: string): State | undefined {
      return this.states.find((state: State) => state.id === id);
   }

   addDestinationToState(stateId: string, newDestination: Destination): boolean {
      // if the state we want to mutate doesn't exist, don't do anything.
      if (!this.findState(stateId)) return false;

      const { input, targetId: targetId } = newDestination;

      const chosenState = this.findState(targetId);
      // if target id doesn't exist, create new state with that id
      if (!chosenState) {
         this.addState(new State(targetId));
         return true;
      }

      const alreadyExists = chosenState.destinations.find(
         currDestination =>
            currDestination.input === input && currDestination.targetId === targetId
      );

      if (!alreadyExists) {
         chosenState.destinations = [...chosenState.destinations, newDestination];
         return true;
      }

      alert(`Duplicate destination [${input}, ${targetId}] found. new destination NOT added.`);
      return false;
   }
   // returns result DFA from this NFA
   convertToDFA(): FSA {
      // - create new FSA, modifying only the new one
      // - merge destinations of same input to a single object
      // -
      // ...
      // - return it
      // NOTE: i would either reassign my nfa to a dfa, or create a new variable referencing the new dfa
      // TODO: implementation...
   }
}
