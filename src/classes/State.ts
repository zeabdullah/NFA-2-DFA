export interface Destination {
   input: string;
   id: string;
}


interface StateInterface {
   id: string;
   isFinal: boolean;
   destinations: Destination[] | [];
   
   renameId(newId: string): State;
   setIsFinal(val: boolean): State;

   addDestination(newDestination: Destination): boolean;
   removeDestination(destinationToRemove: Destination): Destination;
}

export default class State {
   // Properties
   id: string;
   isFinal: boolean;
   destinations: Destination[] | [];

   // Constructor(s)
   constructor(id: string, isFinal = false, destinations: Destination[] = []) {
      this.id = id;
      this.isFinal = isFinal;
      this.destinations = destinations.map(destination => destination);
   }

   // Methods
   setIsFinal(newIsFinal: boolean) {
      this.isFinal = newIsFinal;
   }

   // add a destination to state node
   addDestination(newDestination: Destination): boolean {
      const { input, id } = newDestination;

      const alreadyExists = this.destinations.find(
         currDestination => currDestination.input === input && currDestination.id === id
      );

      // If destination already exists, exit...
      if (alreadyExists) {
         alert(
            `Duplicate destination [${input}, ${id}] found. new destination NOT added.`
         );
         return false;
      }

      this.destinations = [...this.destinations, newDestination];
      return true;
   }

   // remove destination from state node
   removeDestination(destinationToRemove: Destination) {
      const { input, id } = destinationToRemove;

      this.destinations = this.destinations.filter(
         currDestination => currDestination.input !== input || currDestination.id !== id
      );
   }
}
