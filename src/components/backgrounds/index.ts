import { alignment } from './alignment';
import { alternate } from './alternate';
import { centralDogma } from './centralDogma';
import { circos } from './circos';
import { classifier } from './classifier';
import { clusters } from './clusters';
import { codeEditor } from './codeEditor';
import { convNet } from './convNet';
import { diffusion } from './diffusion';
import { embeddings } from './embeddings';
import { gitGraph } from './gitGraph';
import { helix } from './helix';
import { histogram } from './histogram';
import { landscape } from './landscape';
import { layerStack } from './layerStack';
import { neuralNet } from './neuralNet';
import { phyloTree } from './phyloTree';
import { proteinRibbon } from './proteinRibbon';
import { proteinCut, proteinFold, proteinHinge, proteinPair } from './proteinVariants';
import { readPileup } from './readPileup';
import { regression } from './regression';
import { schema } from './schema';
import { sorting } from './sorting';
import { system } from './system';
import { timeSeries } from './timeSeries';
import { transformer } from './transformer';
import type { Scene } from './types';

export type BackgroundKind = 'neural' | 'data' | 'system' | 'protein' | 'helix';

export const SCENES: Record<BackgroundKind, Scene> = {
  neural: alternate('neural', [neuralNet, embeddings, diffusion, transformer, convNet, landscape]),
  data: alternate('data', [regression, classifier, clusters, histogram, timeSeries]),
  system: alternate('system', [system, gitGraph, codeEditor, schema, layerStack, sorting]),
  protein: alternate('protein', [proteinRibbon, proteinCut, proteinHinge, proteinFold, proteinPair]),
  helix: alternate('helix', [helix, alignment, readPileup, centralDogma, circos, phyloTree]),
};
