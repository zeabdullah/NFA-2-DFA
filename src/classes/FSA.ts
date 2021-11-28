import unionize from '../helpers/unionize';
import State, { Destination } from './State';
import _ from 'lodash';

interface FSAInterface {
   states: Map<string, State>;
   startingStateId?: string;
   finalStates: string[];
   alphabet: Map<string, string>;

   addState(newState: State): boolean;
   removeState(id: string): State | undefined;
   // renameState(oldId: String, newId: string): State;
   findState(id: string): State | undefined;

   addDestinationToState(stateId: string, newDestination: Destination): boolean;
   // removeDestinationFromState(stateId: string, destinationToDrop: Destination): Destination;

   setStateFinal(stateId: string, newIsFinal: boolean): State | undefined;

   convertToDFA(): FSA;
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
      // if number of states is 1, it means only newState exists; hence, make it starting
      const makeFirstStateStarting = () => {
         if (this.states.size === 1) this.startingStateId = id;
      };

      // check if any of the target destinations are new, so that we add it to the alphabet
      const addNewInputStringsToAlphabet = () => {
         destinations.forEach(currDest => {
            if (!this.alphabet.get(currDest.input)) {
               this.alphabet.set(currDest.input, currDest.input);
            }
         });
      };

      // if state already exists, exit
      if (this.findState(id)) {
         console.warn(`Duplicate state '${id}' already found. new state NOT added.`);
         return false;
      }

      const newState = new State(id, isFinal, destinations);
      this.states.set(id, newState);

      // if new state is final, append it to finalStates array
      if (isFinal) this.finalStates = this.finalStates.concat(id);

      makeFirstStateStarting();

      addNewInputStringsToAlphabet();

      return true;
   }

   removeState(id: string): State | undefined {
      const removedState = this.findState(id);
      this.states.delete(id);
      return removedState;
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

   // unionizeStateDestinations(stateId: string): State {
   //    // assuming we have all the destinations now,
   //    const oldState = this.findState(stateId) as State;
   //    const newState = new State(
   //       oldState.id,
   //       oldState.isFinal,
   //       oldState.unionizeDestinations()
   //    );
   //    // replace oldState of same id with newState
   //    this.states.set(stateId, newState);
   //    return newState;
   // }

   // converts NFA to DFA
   convertToDFA(): FSA {
      // loop new DFA to find if each of the states' destinations' targetId is found.
      // if not found, create new state with that id
      const sequentiallyAddDeterministicStates = (dfa: FSA) => {
         dfa.states.forEach(state => {
            state.destinations.forEach(currDest => {
               if (!dfa.findState(currDest.targetId)) {
                  const [combinedDests, hasFinal] = getDestinationsOfconcattedState(currDest);

                  const newState = new State(
                     currDest.targetId,
                     hasFinal,
                     unionize(combinedDests)
                  );
                  dfa.addState(newState);
               }
            });
         });
      };
      const getDestinationsOfconcattedState = (
         dest: Destination
      ): [Destination[], boolean] => {
         let hasFinal = false;
         let combinedDests: Destination[] = [];

         const splitIds: string[] = dest.targetId.split(',');
         splitIds.forEach((stateId: string) => {
            const currState = this.findState(stateId);

            if (currState?.isFinal) hasFinal = true;

            const stateIdDests = currState?.destinations;
            stateIdDests?.forEach(dest => {
               combinedDests = combinedDests.concat(dest);
            });
         });
         return [_.uniqWith(combinedDests, _.isEqual), hasFinal];
      };

      const fillEmptyTransitions = (dfa: FSA) => {
         dfa.alphabet.forEach(inputStr => {
            dfa.states.forEach(state => {
               let inputStrFound = false;

               state.destinations.forEach(currDest => {
                  if (inputStr === currDest.input) {
                     inputStrFound = true;
                     return;
                  }
               });
               if (inputStrFound) return;

               dfa.addDestinationToState(state.id, { input: inputStr, targetId: 'qdead' });
            });
         });
         const deadState = dfa.findState('qdead');
         if (!deadState) return;

         dfa.alphabet.forEach(inputStr => {
            deadState.destinations.push({ input: inputStr, targetId: 'qdead' });
         });
         dfa.findState('qdead')!.destinations = _.uniqWith(deadState.destinations, _.isEqual);
      };

      // if there isn't even a starting state, then DFA is empty; return the same FSA
      if (!this.startingStateId) return this;

      // create new FSA, with only the starting state of the old FSA
      const dfa = new FSA(undefined, this.startingStateId, undefined, this.alphabet);

      const nfaStartingState = this.findState(this.startingStateId) as State;

      dfa.addState(
         new State(
            nfaStartingState.id,
            nfaStartingState.isFinal,
            nfaStartingState.unionizeDestinations()
         )
      );

      sequentiallyAddDeterministicStates(dfa);
      fillEmptyTransitions(dfa);
      return dfa;
   }
}
