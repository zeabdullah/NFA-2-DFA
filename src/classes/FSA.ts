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
   dropDestinationFromState(
      stateId: string,
      destinationToDrop: Destination
   ): Destination;

   // The Big Mann
   convertToDFA(): FSA;
}

interface FSAInterface2 {
   states: Map<string, State>;
   startingStateId?: string;
   finalStates: string[] | [];
   alphabet: Map<string, string>;

   addState(newState: State): boolean;
   removeState(id: string): State | undefined;
   renameState(oldId: String, newId: string): State;
   findState(id: string): State | undefined;

   addDestinationToState(stateId: string, newDestination: Destination): boolean;
   removeDestinationFromState(
      stateId: string,
      destinationToDrop: Destination
   ): Destination;

   // The Big Mann
   convertToDFA(): FSA2;
}

class FSA2 implements FSAInterface2 {
   states: Map<string, State>;
   startingStateId?: string;
   finalStates: string[] | [];
   alphabet: Map<string, string>;

   constructor(
      states = new Map<string, State>(),
      startingStateId?: string,
      finalStates: string[] = [],
      alphabet = new Map<string, string>()
   ) {
      this.states = states;
      this.startingStateId = startingStateId;
      this.finalStates = finalStates;
      this.alphabet = alphabet;
   }

   // -------- methods ---------
   //
   addState({ id, isFinal = false, destinations = [] }: State): boolean {
      const newState = { id, isFinal, destinations } as State;

      if (this.states.get(id)) {
         alert(`Duplicate state '${id}' already found. new state NOT added.`);
         return false;
      }

      this.states.set(id, newState);

      if (this.states.length === 1) {
         this.startingStateId = id;
         return true;
      }

      if (newState.isFinal) {
         // push new state to this.finalStates
         this.finalStates = [...this.finalStates, newState.id];
      }

      // check if any of the target destinations are new,
      // so that we add it to the alphabet
      newState.destinations.forEach(destination => {
         if (!this.alphabet.get(destination.input)) {
            this.alphabet.set(destination.input, destination.input);
         }
      });

      return true;
   }

   findState(id: string): State | undefined {
      return this.states.get(id);
   }

   addDestinationToState(stateId: string, newDestination: Destination): boolean {
      // if the state we want to mutate doesn't exist, don't do anything.
      if (!this.findState(stateId)) return false;

      const { input, id: targetId } = newDestination;

      const chosenState = this.findState(targetId);

      // if chosen state doesn't exist, create new state with the targetId
      if (!chosenState) return this.addState(new State(targetId)); // will always return true

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

   // converts NFA to DFA
   convertToDFA(): FSA2 {
      // - create new FSA, modifying only the new one
      // const dfa = new FSA2();
      // const oldStartingState: State = this.states.get(this.startingStateId);
      // dfa.addState({ oldStartingState.id, false})
      // - merge destinations of same input to a single object
      // -
      // ...
      // - return it
      // NOTE: i would either reassign my nfa to a dfa, or create a new variable referencing the new dfa
      // TODO: implementation...
   }
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
