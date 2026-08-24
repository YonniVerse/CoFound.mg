import * as XLSX from 'xlsx'

export const IMPORT_FIELDS = [
  'email',
  'firstName',
  'lastName',
  'fieldOfStudy',
  'level',
  'entryYear',
  'gender',
  'studentNumber',
] as const

export type ImportField = (typeof IMPORT_FIELDS)[number]

export type NormalizedStudent = {
  email: string
  firstName: string
  lastName: string
  fieldOfStudy: string
  level: string
  entryYear: number
  gender?: string
  studentNumber?: string
}

export type ImportRowAnalysis = {
  lineNumber: number
  raw: Record<string, string>
  normalized: Partial<NormalizedStudent>
  errors: string[]
}

export type ImportAnalysis = {
  fileType: 'CSV' | 'XLSX'
  sheetName: string
  headers: string[]
  columnMapping: Partial<Record<ImportField, string>>
  unknownColumns: string[]
  missingRequiredFields: ImportField[]
  rows: ImportRowAnalysis[]
  warnings: string[]
}

const REQUIRED_FIELDS: readonly ImportField[] = [
  'email',
  'firstName',
  'lastName',
  'fieldOfStudy',
  'level',
  'entryYear',
]

const FIELD_ALIASES: Record<ImportField, readonly string[]> = {
  email: ['email', 'e-mail', 'mail', 'adresse email', 'adresse e-mail', 'courriel'],
  firstName: ['prenom', 'prénom', 'first name', 'firstname', 'given name'],
  lastName: ['nom', 'nom de famille', 'lastname', 'last name', 'family name'],
  fieldOfStudy: ['filiere', 'filière', 'domaine', 'formation', 'parcours', 'field of study', 'major'],
  level: ['niveau', 'classe', 'annee detude', "année d'étude", 'niveau detude', "niveau d'étude", 'level'],
  entryYear: [
    'annee dentree',
    "année d'entrée",
    'annee entree',
    "année entrée",
    'annee dinscription',
    "année d'inscription",
    'entry year',
    'cohort year',
  ],
  gender: ['genre', 'sexe', 'gender'],
  studentNumber: ['matricule', 'numero matricule', 'numéro matricule', 'student number', 'student id', 'id etudiant'],
}

const HEADER_SEPARATOR = /[\s_./:-]+/g

function canonicalizeHeader(value: string): string {
  return value
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLocaleLowerCase('fr-FR')
    .replace(/[’']/gu, ' ')
    .trim()
    .replace(HEADER_SEPARATOR, ' ')
}

function cleanText(value: unknown): string {
  return String(value ?? '')
    .normalize('NFC')
    .replace(/\s+/gu, ' ')
    .trim()
}

function normalizeEmail(value: string): string {
  return value.replace(/\s+/gu, '').toLocaleLowerCase('en-US')
}

function normalizeHeaderMap(headers: string[]): {
  columnMapping: Partial<Record<ImportField, string>>
  unknownColumns: string[]
  errors: string[]
} {
  const aliases = new Map<string, ImportField>()
  for (const field of IMPORT_FIELDS) {
    for (const alias of FIELD_ALIASES[field]) {
      aliases.set(canonicalizeHeader(alias), field)
    }
  }

  const columnMapping: Partial<Record<ImportField, string>> = {}
  const unknownColumns: string[] = []
  const errors: string[] = []

  for (const header of headers) {
    const field = aliases.get(canonicalizeHeader(header))
    if (!field) {
      unknownColumns.push(header)
      continue
    }
    if (columnMapping[field]) {
      errors.push(`Plusieurs colonnes correspondent au champ « ${field} ».`)
      continue
    }
    columnMapping[field] = header
  }

  return { columnMapping, unknownColumns, errors }
}

function decodeCsv(buffer: Buffer): string {
  if (buffer[0] === 0xff && buffer[1] === 0xfe) {
    return new TextDecoder('utf-16le').decode(buffer)
  }
  if (buffer[0] === 0xfe && buffer[1] === 0xff) {
    return new TextDecoder('utf-16be').decode(buffer)
  }
  if (buffer[0] === 0xef && buffer[1] === 0xbb && buffer[2] === 0xbf) {
    return new TextDecoder('utf-8').decode(buffer)
  }

  const utf8 = new TextDecoder('utf-8', { fatal: false }).decode(buffer)
  if (!utf8.includes('\ufffd')) return utf8
  return new TextDecoder('windows-1252').decode(buffer)
}

function parseEntryYear(value: string): number | undefined {
  if (!/^\d{4}$/u.test(value)) return undefined
  const year = Number(value)
  const currentYear = new Date().getFullYear()
  if (year < 1900 || year > currentYear + 2) return undefined
  return year
}

function getCell(row: Record<string, unknown>, header: string | undefined): string {
  return header ? cleanText(row[header]) : ''
}

function normalizeRow(
  row: Record<string, unknown>,
  lineNumber: number,
  columnMapping: Partial<Record<ImportField, string>>,
): ImportRowAnalysis {
  const raw = Object.fromEntries(Object.entries(row).map(([key, value]) => [key, cleanText(value)]))
  const errors: string[] = []
  const email = normalizeEmail(getCell(row, columnMapping.email))
  const firstName = getCell(row, columnMapping.firstName)
  const lastName = getCell(row, columnMapping.lastName)
  const fieldOfStudy = getCell(row, columnMapping.fieldOfStudy)
  const level = getCell(row, columnMapping.level)
  const entryYearText = getCell(row, columnMapping.entryYear)
  const entryYear = parseEntryYear(entryYearText)

  if (!email) errors.push('Adresse email absente.')
  else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/u.test(email)) errors.push('Adresse email invalide.')
  if (!firstName) errors.push('Prénom absent.')
  if (!lastName) errors.push('Nom absent.')
  if (!fieldOfStudy) errors.push('Filière absente.')
  if (!level) errors.push('Niveau absent.')
  if (!entryYearText) errors.push("Année d'entrée absente.")
  else if (entryYear === undefined) errors.push("Année d'entrée invalide.")

  const normalized: Partial<NormalizedStudent> = {
    email,
    firstName,
    lastName,
    fieldOfStudy,
    level,
  }
  if (entryYear !== undefined) normalized.entryYear = entryYear

  const gender = getCell(row, columnMapping.gender)
  if (gender) normalized.gender = gender
  const studentNumber = getCell(row, columnMapping.studentNumber)
  if (studentNumber) normalized.studentNumber = studentNumber

  return { lineNumber, raw, normalized, errors }
}

function inferFileType(fileName: string, buffer: Buffer): 'CSV' | 'XLSX' {
  const extension = fileName.toLocaleLowerCase('en-US').split('.').pop()
  if (extension === 'csv') return 'CSV'
  if (extension === 'xlsx' || extension === 'xls') return 'XLSX'
  if (buffer.subarray(0, 2).toString('hex') === '504b') return 'XLSX'
  return 'CSV'
}

export function analyzeImportFile(buffer: Buffer, fileName: string): ImportAnalysis {
  const fileType = inferFileType(fileName, buffer)
  const workbook = fileType === 'CSV'
    ? XLSX.read(decodeCsv(buffer), { type: 'string', raw: false, cellDates: false })
    : XLSX.read(buffer, { type: 'buffer', raw: false, cellDates: false })
  const sheetName = workbook.SheetNames[0]

  if (!sheetName) {
    return {
      fileType,
      sheetName: '',
      headers: [],
      columnMapping: {},
      unknownColumns: [],
      missingRequiredFields: [...REQUIRED_FIELDS],
      rows: [],
      warnings: ['Le fichier ne contient aucune feuille exploitable.'],
    }
  }

  const sheet = workbook.Sheets[sheetName]
  if (!sheet) {
    return {
      fileType,
      sheetName,
      headers: [],
      columnMapping: {},
      unknownColumns: [],
      missingRequiredFields: [...REQUIRED_FIELDS],
      rows: [],
      warnings: ['La feuille principale est illisible.'],
    }
  }

  const rows = XLSX.utils.sheet_to_json(sheet, {
    header: 1,
    defval: '',
    raw: false,
    blankrows: false,
  }) as unknown[][]
  const headerValues = (rows[0] ?? []).map(cleanText)
  const headers = headerValues.filter(Boolean)
  const mappingResult = normalizeHeaderMap(headers)
  const missingRequiredFields = REQUIRED_FIELDS.filter((field) => !mappingResult.columnMapping[field])
  const warnings = [...mappingResult.errors]

  if (mappingResult.unknownColumns.length > 0) {
    warnings.push(`Colonnes ignorées : ${mappingResult.unknownColumns.join(', ')}.`)
  }
  if (missingRequiredFields.length > 0) {
    warnings.push(`Colonnes obligatoires absentes : ${missingRequiredFields.join(', ')}.`)
  }

  const dataRows = rows.slice(1).map((values) => {
    const row = Object.fromEntries(headers.map((header, index) => [header, values[index] ?? '']))
    return row
  })
  const analyzedRows = dataRows.map((row, index) => normalizeRow(row, index + 2, mappingResult.columnMapping))

  return {
    fileType,
    sheetName,
    headers,
    columnMapping: mappingResult.columnMapping,
    unknownColumns: mappingResult.unknownColumns,
    missingRequiredFields,
    rows: analyzedRows,
    warnings,
  }
}
