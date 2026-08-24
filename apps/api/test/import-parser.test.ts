import { strict as assert } from 'node:assert'
import { test } from 'node:test'
import * as XLSX from 'xlsx'
import { analyzeImportFile } from '../src/import/import-parser.js'

function csvBuffer(content: string, encoding: BufferEncoding = 'utf8'): Buffer {
  return Buffer.from(content, encoding)
}

test('analyse un CSV UTF-8 avec accents et alias français', () => {
  const result = analyzeImportFile(
    csvBuffer([
      'Adresse e-mail;Prénom;Nom de famille;Filière;Niveau;Année d’entrée;Matricule',
      ' ETU-001@EXAMPLE.MG ; José ; Rakoto ; Informatique ; L3 ; 2024 ; 001 ',
    ].join('\n')),
    'promotion.csv',
  )

  assert.equal(result.fileType, 'CSV')
  assert.deepEqual(result.missingRequiredFields, [])
  assert.equal(result.rows.length, 1)
  assert.deepEqual(result.rows[0]?.normalized, {
    email: 'etu-001@example.mg',
    firstName: 'José',
    lastName: 'Rakoto',
    fieldOfStudy: 'Informatique',
    level: 'L3',
    entryYear: 2024,
    studentNumber: '001',
  })
  assert.deepEqual(result.rows[0]?.errors, [])
})

test('analyse un XLSX et conserve les lignes invalides dans le rapport', () => {
  const worksheet = XLSX.utils.aoa_to_sheet([
    ['Email', 'First Name', 'Last Name', 'Field of Study', 'Level', 'Entry Year', 'Gender'],
    ['fara@example.mg', 'Fara', 'Rakoto', 'Gestion', 'M1', '2023', 'F'],
    ['adresse-invalide', '', 'Rabe', 'Droit', 'L2', '20XX', ''],
  ])
  const workbook = XLSX.utils.book_new()
  XLSX.utils.book_append_sheet(workbook, worksheet, 'Étudiants')
  const buffer = XLSX.write(workbook, { type: 'buffer', bookType: 'xlsx' }) as Buffer

  const result = analyzeImportFile(buffer, 'promotion.xlsx')

  assert.equal(result.fileType, 'XLSX')
  assert.equal(result.sheetName, 'Étudiants')
  assert.equal(result.rows.length, 2)
  assert.deepEqual(result.rows[0]?.errors, [])
  assert.deepEqual(result.rows[1]?.errors, [
    'Adresse email invalide.',
    'Prénom absent.',
    "Année d'entrée invalide.",
  ])
})

test('signale les colonnes obligatoires absentes et ignore les colonnes inconnues', () => {
  const result = analyzeImportFile(
    csvBuffer([
      'email;nom;commentaire interne',
      'student@example.mg;Rakoto;à vérifier',
    ].join('\n')),
    'incomplete.csv',
  )

  assert.deepEqual(result.missingRequiredFields, [
    'firstName',
    'fieldOfStudy',
    'level',
    'entryYear',
  ])
  assert.deepEqual(result.unknownColumns, ['commentaire interne'])
  assert.equal(result.rows[0]?.normalized.email, 'student@example.mg')
  assert.ok(result.warnings.some((warning) => warning.includes('Colonnes obligatoires absentes')))
})

test('décode un CSV Windows-1252 avec accents', () => {
  const content = [
    'email;prénom;nom;filière;niveau;année entrée',
    'eleve@example.mg;Élodie;D\'Amour;Gestion;L1;2025',
  ].join('\r\n')
  const result = analyzeImportFile(csvBuffer(content, 'latin1'), 'promotion.csv')

  assert.equal(result.rows[0]?.normalized.firstName, 'Élodie')
  assert.equal(result.rows[0]?.normalized.lastName, "D'Amour")
  assert.deepEqual(result.rows[0]?.errors, [])
})
