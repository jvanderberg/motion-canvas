import {parser} from '@lezer/javascript';
import {Code, LezerHighlighter} from '@motion-canvas/2d';
import {makeProject} from '@motion-canvas/core';
import scene from './scenes/code?scene';

Code.defaultHighlighter = new LezerHighlighter(parser);

export default makeProject({
  scenes: [scene],
});
