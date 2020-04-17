import moment from 'moment'
import { ProcessingError, ProcessingErrorCode } from './exceptions'
import { EmpiricalData } from '../types/Param.types'

// These are the columns we got from currently exported files.
// They my not be present in the user results.
enum ImportFileDataColumn {
  Time = 'time',
  Cases = 'cases',
  Deaths = 'deaths',
  Hospitalized = 'hospitalized',
  ICU = 'icu',
  Recovered = 'recovered',
}

function formatData(rawData: string): number | null {
  const parsed: number = +rawData

  if (Number.isNaN(parsed)) {
    throw new ProcessingError(ProcessingErrorCode.InvalidField, rawData)
  }

  return parsed
}

// TODO needs tests
/**
 * Build a {UserResult} from the raw file data.
 * @param rawUserResult Result of the parsed CSV file, containing an array of objects representing each row, with headers as keys.
 *    This is typically the format generated by Papa.parse with option 'headers' enabled.
 */
export function processImportedData(rawUserResult: Record<ImportFileDataColumn, string>[]): EmpiricalData {
  const data: EmpiricalData = []

  for (const row of rawUserResult) {
    if (!row.time) {
      throw new ProcessingError(ProcessingErrorCode.MissingTimeField)
    }

    const rowTime = moment(row.time)

    if (!rowTime.isValid()) {
      throw new ProcessingError(ProcessingErrorCode.InvalidField, row.time)
    }

    data.push({
      time: rowTime.toDate(),
      cases: formatData(row.cases),
      deaths: formatData(row.deaths),
      hospitalized: formatData(row.hospitalized),
      icu: formatData(row.icu),
      recovered: formatData(row.recovered),
    })
  }

  return data
}
