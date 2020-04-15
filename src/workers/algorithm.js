/* TODO: fix this: Eslint must be disabled for this file because of an issue between worker-plugin and eslint-plugin. The issue causes the linter to be run twice, which breaks the build. At this point the fix is elusive... */
/* eslint-disable */

import 'regenerator-runtime'
import { run } from '../algorithms/run'

addEventListener('message', async (event) => {
  const { paramsFlat, severity, ageDistribution, containment } = event.data

  const result = await run(paramsFlat, severity, ageDistribution, containment)

  // Delete function properties, because they cannot be cloned by the structured clone algorithm:
  // https://developer.mozilla.org/en-US/docs/Web/API/Web_Workers_API/Structured_clone_algorithm
  // TODO: Revisit this hack.
  delete result.params.rate.infection

  postMessage(result)
})
