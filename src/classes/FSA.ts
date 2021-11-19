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

   setStateFinal(stateId: string, newIsFinal: boolean): State | undefined;

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
      const stateToMutate = this.findState(stateId);
      // if the state we want to mutate doesn't exist, exit.
      if (!stateToMutate) {
         console.warn(`State with ID ${stateId} not found. new destination NOT added.`);
         return false;
      }

      const { input, targetId: targetId } = newDestination;

      const chosenState = this.findState(targetId);
      // if chosen state doesn't exist, create new state with the targetId
      if (!chosenState) {
         if (!stateToMutate.addDestination(newDestination)) return false;

         this.alphabet.set(input, input);
         console.log(
            `Added new state ${targetId} to ${stateId}, because destination didn't exist`
         );
         return this.addState(new State(targetId)); // will always return true
      }

      const alreadyExists = stateToMutate.destinations.find(
         currDestination =>
            currDestination.input === input && currDestination.targetId === targetId
      );

      if (!alreadyExists) {
         if (!stateToMutate.addDestination(newDestination)) return false;

         this.alphabet.set(input, input);
         return true;
      }

      console.warn(
         `Duplicate destination [${input}, ${targetId}] found. new destination NOT added.`
      );

      return false;
   }

   setStateFinal(stateId: string, newIsFinal: boolean): State | undefined {
      const stateToMutate = this.findState(stateId);
      return stateToMutate ? stateToMutate.setIsFinal(newIsFinal) : undefined;
   }

   unionizeStateDestinations(stateId: string): State {
      let newDestinations: Destination[] = [];

      // step: combine all destinations from states sharing the id (id: 'q1,q2' means combine q1 destinations with q2 destinations)

      // TODO: know what to do with this.
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
      const getDestinationsOfconcattedState = (
         dest: Destination
      ): [Destination[], boolean] => {
         let hasFinal = false;
         const combinedDests = new Set<Destination>();

         const splitIds: string[] = dest.targetId.split(',');
         splitIds.forEach((stateId: string) => {
            const currState = this.states.get(stateId);
            if (currState?.isFinal) hasFinal = true;

            const stateIdDests = currState?.destinations;
            stateIdDests?.forEach(dest => {
               combinedDests.add(dest);
            });
         });
         return [Array.from(combinedDests), hasFinal];
      };

      // if there isn't even a starting state, then DFA is empty; return the same FSA
      if (!this.startingStateId) return this;

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

      // TODO: 50% working, still added 'q2' after 'q1, q2'
      dfa.states.forEach(state => {
         state.destinations.forEach(dest => {
            if (!dfa.findState(dest.targetId)) {
               // TODO: ☝️ condition is the problem; maybe 'dfa.findIfPartOfStateId()'

               const [combinedDests, hasFinal]: [Destination[], boolean] =
                  getDestinationsOfconcattedState(dest);

               const newState = new State(dest.targetId, hasFinal, combinedDests);
               newState.unionizeDestinations();
               dfa.addState(newState);
            }
         });
      });

      // this.states.forEach(currState => {
      //    if (currState.id === dfa.startingStateId) return;
      //    dfa.addState(new State(currState.id))
      // });

      return dfa;
   }
}
