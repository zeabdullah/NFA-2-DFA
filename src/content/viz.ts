const vizDrawingContainer = document.querySelector('.viz') as HTMLDivElement;

import Viz from 'viz.js';
import { Module, render } from 'viz.js/full.render.js';

let viz = new Viz({ Module, render });

viz.renderString('graph {B -- A [taillabel = "tail"]}')
   .then(result => {
      vizDrawingContainer.innerHTML = result;
   })
   .catch(error => {
      // Create a new Viz instance (@see Caveats page for more info)
      viz = new Viz({ Module, render });

      // Possibly display the error
      console.error(error);
   });
