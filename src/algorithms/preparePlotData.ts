import { pickBy, mapValues } from 'lodash'

import type { Trajectory, PlotDatum } from './types/Result.types'
import { verifyPositive, verifyTuple } from '../components/Main/Results/Utils'

import { sortPair } from './utils/sortPair'
// import { linesToPlot, areasToPlot, DATA_POINTS } from '../components/Main/Results/ChartCommon'

export function filterPositiveValues<T extends { [key: string]: number }>(obj: T) {
  return pickBy(obj, (value) => value > 0) as T
}

export function roundValues<T extends { [key: string]: number }>(obj: T) {
  return mapValues(obj, verifyPositive) as T
}

export function preparePlotData(trajectory: Trajectory): PlotDatum[] {
  const { lower, middle, upper } = trajectory

  return middle.map((_0, day) => {
    const previousDay = day > 6 ? day - 7 : 0

    const weeklyFatalityMiddle = middle[day].cumulative.fatality.total - middle[previousDay].cumulative.fatality.total // prettier-ignore
    let weeklyFatalityLower  = lower[day].cumulative.fatality.total  - lower[previousDay].cumulative.fatality.total // prettier-ignore
    let weeklyFatalityUpper  = upper[day].cumulative.fatality.total  - upper[previousDay].cumulative.fatality.total // prettier-ignore

    ;[weeklyFatalityLower, weeklyFatalityUpper] = sortPair([weeklyFatalityLower, weeklyFatalityUpper]) // prettier-ignore

    let lines = {
      susceptible: middle[day].current.susceptible.total,
      infectious: middle[day].current.infectious.total,
      severe: middle[day].current.severe.total,
      critical: middle[day].current.critical.total,
      overflow: middle[day].current.overflow.total,
      recovered: middle[day].cumulative.recovered.total,
      fatality: middle[day].cumulative.fatality.total,
      weeklyFatality: weeklyFatalityMiddle,
    }

    lines = filterPositiveValues(lines)
    lines = roundValues(lines)

    let areas = {
      susceptible:    verifyTuple(verifyPositive(lower[day].current.susceptible.total),  verifyPositive(upper[day].current.susceptible.total),  verifyPositive(middle[day].current.susceptible.total)), // prettier-ignore
      infectious:     verifyTuple(verifyPositive(lower[day].current.infectious.total),   verifyPositive(upper[day].current.infectious.total),   verifyPositive(middle[day].current.infectious.total)), // prettier-ignore
      severe:         verifyTuple(verifyPositive(lower[day].current.severe.total),       verifyPositive(upper[day].current.severe.total),       verifyPositive(middle[day].current.severe.total)), // prettier-ignore
      critical:       verifyTuple(verifyPositive(lower[day].current.critical.total),     verifyPositive(upper[day].current.critical.total),     verifyPositive(middle[day].current.critical.total)), // prettier-ignore
      overflow:       verifyTuple(verifyPositive(lower[day].current.overflow.total),     verifyPositive(upper[day].current.overflow.total),     verifyPositive(middle[day].current.overflow.total)), // prettier-ignore
      recovered:      verifyTuple(verifyPositive(lower[day].cumulative.recovered.total), verifyPositive(upper[day].cumulative.recovered.total), verifyPositive(middle[day].cumulative.recovered.total)), // prettier-ignore
      fatality:       verifyTuple(verifyPositive(lower[day].cumulative.fatality.total),  verifyPositive(upper[day].cumulative.fatality.total),  verifyPositive(middle[day].cumulative.fatality.total)), // prettier-ignore
      weeklyFatality: verifyTuple(verifyPositive(weeklyFatalityLower),                   verifyPositive(weeklyFatalityUpper),                   verifyPositive(weeklyFatalityMiddle)) // prettier-ignore
    }

    return { time: middle[day].time, lines, areas }
  })
}
