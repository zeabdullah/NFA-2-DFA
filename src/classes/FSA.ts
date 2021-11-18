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

export default class FSA implements FSAInterface {
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
      const newState = new State(id, isFinal, destinations);

      // exit if state already exists
      if (this.findState(id)) {
         alert(`Duplicate state '${id}' already found. new state NOT added.`);
         return false;
      }

      this.states.set(id, newState);

      // if state size is 1, it means only newState exists; hence, make it starting
      if (this.states.size === 1) {
         this.startingStateId = id;
         return true;
      }

      // if new state is final
      if (newState.isFinal) {
         this.finalStates = this.finalStates.concat(newState.id);
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
      // if the state we want to mutate doesn't exist, exit.
      const stateToMutate = this.findState(stateId);
      if (!stateToMutate) return false;

      const { input, targetId: targetId } = newDestination;

      const chosenState = this.findState(targetId);
      // if chosen state doesn't exist, create new state with the targetId
      if (!chosenState) {
         stateToMutate.addDestination(newDestination);
         this.alphabet.set(newDestination.input, newDestination.input);
         return this.addState(new State(targetId));
      } // will always return true

      const alreadyExists = stateToMutate.destinations.find(
         currDestination =>
            currDestination.input === input && currDestination.targetId === targetId
      );

      if (!alreadyExists) {
         stateToMutate.destinations = stateToMutate.destinations.concat(newDestination);
         this.alphabet.set(newDestination.input, newDestination.input);
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
         newDestinations = newDestinations.concat(dest);
      });

      // assuming we have all the destinations now,
      const oldState = this.findState(stateId) as State;
      const newState = new State(
         oldState.id,
         oldState.isFinal,
         oldState.unionizeDestinations()
      );
      // replace oldState of same id with newState
      this.states.set(stateId, newState);

      return newState;
   }

   // converts NFA to DFA
   convertToDFA(): FSA {
      // if there isn't even a starting state, then DFA is empty; return the same FSA
      if (!this.startingStateId) return this;

      // TODO: implementation...

      // create new FSA, with only the starting state of the old FSA
      // we modify only the new one
      const dfa: FSA = new FSA(undefined, this.startingStateId, undefined, this.alphabet);

      const nfaStartingState = this.findState(this.startingStateId) as State;

      dfa.addState(
         new State(
            nfaStartingState.id,
            nfaStartingState.isFinal,
            nfaStartingState.unionizeDestinations()
         )
      );

      // 1. loop new FSA to find if each of the states' destinations' targetId is found
      // 2. if not found, create new state with that not found id

      // dfa.states.get(this.startingStateId)?.destinations = unionizeDestinations(
      //    oldStartingState.destinations
      // );

      // TODO: im stuck here...

      dfa.states.forEach(state => {
         /* for each (destination.targetId) {
            if(!dfa.findState(destination.targetId)) {
               const newState = new State(destination.targetId, false)
               newState.destinations = getDestinationsOfConcatentatedIdState(q1q2)
               newState.unionizeDestinations()
            } 
         }        
         */
      });

      // this.states.forEach(currState => {
      //    if (currState.id === dfa.startingStateId) return;
      //    dfa.addState(new State(currState.id))
      // });

      return dfa;
   }
}
