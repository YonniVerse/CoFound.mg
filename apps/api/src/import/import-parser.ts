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

export const REQUIRED_FIELDS: readonly ImportField[] = [
  'email',
  'firstName',
  'lastName',
  'fieldOfStudy',
  'level',
  'entryYear',
]

export const FIELD_ALIASES: Record<ImportField, readonly string[]> = {
  email: ['email', 'e-mail', 'mail', 'adresse email', 'adresse e-mail', 'courriel', 'adresse mail', 'contact email'],
  firstName: ['prenom', 'prénom', 'first name', 'firstname', 'given name', 'nom de bapteme'],
  lastName: ['nom', 'nom de famille', 'lastname', 'last name', 'family name', 'patronyme'],
  fieldOfStudy: ['filiere', 'filière', 'domaine', 'formation', 'parcours', 'field of study', 'major', 'etudes', 'études', 'departement', 'département'],
  level: ['niveau', 'classe', 'annee detude', "année d'étude", 'annee d etude', 'niveau detude', "niveau d'étude", 'level', 'grade', 'promotion'],
  entryYear: [
    'annee dentree',
    "année d'entrée",
    'annee d entree',
    'annee entree',
    'année entrée',
    'annee dinscription',
    "année d'inscription",
    'entry year',
    'cohort year',
    'annee',
    'année',
    'annee promotion',
    'promo',
  ],
  gender: ['genre', 'sexe', 'gender', 'sex'],
  studentNumber: ['matricule', 'numero matricule', 'numéro matricule', 'student number', 'student id', 'id etudiant', 'num etudiant', 'n° matricule'],
}

const HEADER_SEPARATOR = /[\s_./:-]+/g

export function canonicalizeHeader(value: string): string {
  return value
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLocaleLowerCase('fr-FR')
    .replace(/[’']/gu, ' ')
    .trim()
    .replace(HEADER_SEPARATOR, ' ')
}

export function cleanText(value: unknown): string {
  return String(value ?? '')
    .normalize('NFC')
    .replace(/\s+/gu, ' ')
    .trim()
}

export function normalizeEmail(value: string): string {
  return value.replace(/\s+/gu, '').toLocaleLowerCase('en-US')
}

export function parseEntryYear(value: unknown): number | undefined {
  if (typeof value === 'number' && Number.isInteger(value)) {
    const currentYear = new Date().getFullYear()
    if (value >= 1900 && value <= currentYear + 5) return value
    return undefined
  }
  const str = cleanText(value).replace(/[^\d]/g, '')
  if (!/^\d{4}$/u.test(str)) return undefined
  const year = Number(str)
  const currentYear = new Date().getFullYear()
  if (year < 1900 || year > currentYear + 5) return undefined
  return year
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

function getCell(row: Record<string, unknown>, header: string | undefined): string {
  return header && header in row ? cleanText(row[header]) : ''
}

export function extractStudentFromRow(
  raw: Record<string, unknown>,
  columnMapping?: unknown,
): { student: Partial<NormalizedStudent>; errors: string[] } {
  const mapping = typeof columnMapping === 'object' && columnMapping !== null
    ? (columnMapping as Record<string, unknown>)
    : {}

  function resolveHeader(field: ImportField): string | undefined {
    // Check if mapping is { field: headerName }
    if (typeof mapping[field] === 'string' && (mapping[field] as string) in raw) {
      return mapping[field] as string
    }
    // Check if mapping is { headerName: field }
    for (const [header, mappedField] of Object.entries(mapping)) {
      if (mappedField === field && header in raw) {
        return header
      }
    }
    // Check direct key on raw
    if (field in raw) return field
    // Check aliases on raw
    for (const alias of FIELD_ALIASES[field]) {
      if (alias in raw) return alias
      const canonAlias = canonicalizeHeader(alias)
      for (const rawKey of Object.keys(raw)) {
        if (canonicalizeHeader(rawKey) === canonAlias) return rawKey
      }
    }
    return undefined
  }

  const emailRaw = getCell(raw, resolveHeader('email'))
  const email = emailRaw ? normalizeEmail(emailRaw) : ''
  const firstName = getCell(raw, resolveHeader('firstName'))
  const lastName = getCell(raw, resolveHeader('lastName'))
  const fieldOfStudy = getCell(raw, resolveHeader('fieldOfStudy'))
  const level = getCell(raw, resolveHeader('level'))
  const entryYearText = getCell(raw, resolveHeader('entryYear'))
  const entryYear = parseEntryYear(entryYearText)
  const gender = getCell(raw, resolveHeader('gender'))
  const studentNumber = getCell(raw, resolveHeader('studentNumber'))

  const errors: string[] = []
  if (!email) errors.push('Adresse email absente.')
  else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/u.test(email)) errors.push('Adresse email invalide.')
  if (!firstName) errors.push('Prénom absent.')
  if (!lastName) errors.push('Nom absent.')
  if (!fieldOfStudy) errors.push('Filière absente.')
  if (!level) errors.push('Niveau absent.')
  if (!entryYearText) errors.push("Année d'entrée absente.")
  else if (entryYear === undefined) errors.push("Année d'entrée invalide.")

  const student: Partial<NormalizedStudent> = {
    email,
    firstName,
    lastName,
    fieldOfStudy,
    level,
  }
  if (entryYear !== undefined) student.entryYear = entryYear
  if (gender) student.gender = gender
  if (studentNumber) student.studentNumber = studentNumber

  return { student, errors }
}

function normalizeRow(
  row: Record<string, unknown>,
  lineNumber: number,
  columnMapping: Partial<Record<ImportField, string>>,
): ImportRowAnalysis {
  const raw = Object.fromEntries(Object.entries(row).map(([key, value]) => [key, cleanText(value)]))
  const { student, errors } = extractStudentFromRow(raw, columnMapping)
  return { lineNumber, raw, normalized: student, errors }
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
