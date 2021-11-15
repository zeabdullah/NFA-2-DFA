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
   // unionizeDestinations(): Destination[];
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
      this.destinations = destinations;
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
      const { input, targetId } = newDestination;

      const alreadyExists = this.destinations.find(
         currDestination =>
            currDestination.input === input && currDestination.targetId === targetId
      );

      // If destination already exists, exit...
      if (alreadyExists) {
         alert(
            `Duplicate destination [${input}, ${targetId}] found. new destination NOT added.`
         );
         return false;
      }

      this.destinations = [...this.destinations, newDestination];
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
      // TODO: This implementation

      let newDestinations: Destination[] = [];

      this.destinations.forEach(oldDest => {
         const destIndex = newDestinations.findIndex(
            newDest => oldDest.input === newDest.input
         );
         if (destIndex === -1) {
            // just push new element with input value
            newDestinations = [...newDestinations, oldDest];
         } else {
            // only modify the targetId to be concatenated with the next id (e.g: 1 => 'q1' BECOMES 1 => 'q1,q2')
            newDestinations[destIndex] = {
               ...newDestinations[destIndex],
               targetId: `${newDestinations[destIndex].targetId}, ${oldDest.targetId}`
            };
         }
      });

      return newDestinations;
   }
}
