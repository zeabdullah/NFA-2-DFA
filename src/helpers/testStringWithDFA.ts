import FSA from '../classes/FSA';

export default function testStringWithDFA(dfa: FSA, str: string): boolean {
   let accepted = false;
   let atDeadState = false;

   let currStateId = dfa.startingStateId as string;
   let currState = dfa.findState(currStateId);

   for (const char of str) {
      if (!dfa.alphabet.has(char)) return false;

      currState?.destinations.forEach(dest => {
         if (dest.input === char) {
            currStateId = dest.targetId;

            if (currStateId === 'qdead') {
               atDeadState = true;
               return;
            }

            currState = dfa.findState(currStateId);
            return;
         }
      });
      if (atDeadState) return false;
   }
   return accepted;
}
