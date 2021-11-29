import unionize from '../helpers/unionize';

export interface Destination {
   input: string;
   targetId: string;
}

interface StateInterface {
   id: string;
   isFinal: boolean;
   destinations: Destination[];

   renameId(newId: string): State;
   setIsFinal(val: boolean): State;

   addDestination(newDestination: Destination): boolean;
   removeDestination(destinationToRemove: Destination): void;
   unionizeDestinations(): Destination[];
}

export default class State implements StateInterface {
   // Properties
   id: string;
   isFinal: boolean;
   destinations: Destination[];

   // Constructor(s)
   constructor(id: string, isFinal = false, destinations: Destination[] = []) {
      this.id = id;
      this.isFinal = isFinal;
      this.destinations = [];

      // Using addDestination() for error handling
      destinations.forEach(dest => this.addDestination(dest));
   }

   // Methods
   renameId(newId: string): State {
      this.id = newId;
      return this;
   }

   setIsFinal(newIsFinal: boolean): State {
      this.isFinal = newIsFinal;
      return this;
   }

   // add a destination to state node
   addDestination(newDestination: Destination): boolean {
      if (!newDestination.input) {
         console.warn(`invalid input string. new destination NOT added`);
         return false;
      }
      if (!newDestination.targetId) {
         console.warn(`invalid target id. new destination NOT added`);
         return false;
      }

      this.destinations = this.destinations.concat(newDestination);
      return true;
   }

   // remove destination from state node
   removeDestination(destinationToRemove: Destination): void {
      const { input, targetId } = destinationToRemove;

      this.destinations = this.destinations.filter(
         currDestination =>
            currDestination.input !== input || currDestination.targetId !== targetId
      );
   }

   unionizeDestinations(): Destination[] {
      let newDestinations = unionize(this.destinations);
      return newDestinations;
   }
}
