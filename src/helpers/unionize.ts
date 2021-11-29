import { Destination } from '../classes/State';

// Function to unionize an array of destinations
export default function unionize(destinations: Destination[]): Destination[] {
   let newDestinations: Destination[] = [];

   destinations.forEach(oldDest => {
      const destIndex = newDestinations.findIndex(newDest => oldDest.input === newDest.input);

      // if oldDest has no commonality with any of the new existing destinations,
      // push oldDest
      if (destIndex === -1) {
         newDestinations = newDestinations.concat(oldDest);
         return;
      }

      // else, only modify the targetId to be concatenated with the next id (e.g: 1 => 'q1' BECOMES 1 => 'q1,q2')
      if (newDestinations[destIndex])
         newDestinations[destIndex] = {
            ...newDestinations[destIndex], // input string never changes
            targetId: `${newDestinations[destIndex].targetId},${oldDest.targetId}` // 'q1' becomes 'q1, q2'
         };
      else newDestinations[destIndex] = oldDest;
   });

   return newDestinations;
}
