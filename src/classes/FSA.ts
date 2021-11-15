import State, { Destination } from './State';

interface FSAInterface {
   states: Map<string, State>;
   startingStateId?: string;
   finalStates: string[];
   alphabet: Map<string, string>;

   addState(newState: State): boolean;
   // removeState(id: string): State | undefined;
   // renameState(oldId: String, newId: string): State;
   findState(id: string): State | undefined;

   addDestinationToState(stateId: string, newDestination: Destination): boolean;
   // removeDestinationFromState(stateId: string, destinationToDrop: Destination): Destination;

   // The Big Mann
   convertToDFA(): FSA;
   unionizeStateDestinations(stateId: string): State;
}

class FSA implements FSAInterface {
   states: Map<string, State>;
   startingStateId?: string;
   finalStates: string[];
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

      if (this.findState(id)) {
         alert(`Duplicate state '${id}' already found. new state NOT added.`);
         return false;
      }

      this.states.set(id, newState);

      if (this.states.size === 1) {
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

      const { input, targetId: targetId } = newDestination;

      const chosenState = this.findState(targetId);

      // if chosen state doesn't exist, create new state with the targetId
      if (!chosenState) return this.addState(new State(targetId)); // will always return true

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

   unionizeStateDestinations(stateId: string): State {
      // TODO: make sure to make this work
      // TODO: you need to test your code

      let newDestinations: Destination[] = [];

      // step: combine all destinations from states sharing the id (id: 'q1,q2' means combine q1 destinations with q2 destinations)

      this.alphabet.forEach(inputStr => {
         const dest: Destination = { input: inputStr, targetId: '' };
         newDestinations = [...newDestinations, dest];
      });

      // assuming we have all the destinations now,
      const oldState = this.findState(stateId) as State;
      const newState = new State(stateId, oldState.isFinal, oldState.unionizeDestinations());
      this.states.set(stateId, newState);

      return newState;
   }

   // converts NFA to DFA
   convertToDFA(): FSA {
      // TODO: implementation...
      // - create new FSA, modifying only the new one
      const dfa = new FSA();

      const oldStartingState = this.findState(this.startingStateId!) as State;

      dfa.addState(
         new State(
            oldStartingState.id,
            oldStartingState.isFinal,
            oldStartingState.destinations
         )
      );

      // dfa.states.get(this.startingStateId)?.destinations = unionizeDestinations(
      //    oldStartingState.destinations
      // );

      // this.states.forEach(currState => {
      //    if (currState.id === dfa.startingStateId) return;
      //    dfa.addState(new State(currState.id))
      // });

      // - merge destinations of same input to a single object
      // -
      // ...
      // - return it

      return dfa;
   }
}
