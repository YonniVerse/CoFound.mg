import { strict as assert } from 'node:assert'
import { test } from 'node:test'
import * as fs from 'node:fs'
import * as path from 'node:path'
import * as XLSX from 'xlsx'
import { analyzeImportFile, extractStudentFromRow } from '../src/import/import-parser.js'

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

test('extractStudentFromRow résout correctement les champs selon le mapping personnalisé ou direct', () => {
  const rawRow = {
    'Courriel univ': 'mialy@univ.mg',
    'Nom usuel': 'Randria',
    'Prénom': 'Mialy',
    'Parcours': 'Génie Logiciel',
    'Année': '2024',
    'Niveau': 'M1',
  }
  const customMapping = {
    'Courriel univ': 'email',
    'Nom usuel': 'lastName',
    'Prénom': 'firstName',
    'Parcours': 'fieldOfStudy',
    'Année': 'entryYear',
    'Niveau': 'level',
  }

  const { student, errors } = extractStudentFromRow(rawRow, customMapping)

  assert.deepEqual(errors, [])
  assert.equal(student.email, 'mialy@univ.mg')
  assert.equal(student.firstName, 'Mialy')
  assert.equal(student.lastName, 'Randria')
  assert.equal(student.fieldOfStudy, 'Génie Logiciel')
  assert.equal(student.level, 'M1')
  assert.equal(student.entryYear, 2024)
})

test('analyse le fichier d’exemple docs/examples/students-import.csv', () => {
  const csvPath = path.resolve(process.cwd(), '../../docs/examples/students-import.csv')
  if (fs.existsSync(csvPath)) {
    const buffer = fs.readFileSync(csvPath)
    const result = analyzeImportFile(buffer, 'students-import.csv')

    assert.equal(result.fileType, 'CSV')
    assert.equal(result.missingRequiredFields.length, 0)
    assert.equal(result.rows.length, 7)

    // Valid rows
    assert.equal(result.rows[0]?.normalized.email, 'mialy.randria@example.mg')
    assert.equal(result.rows[0]?.errors.length, 0)

    // Invalid email row
    const invalidEmailRow = result.rows[5]
    assert.ok(invalidEmailRow?.errors.some((e) => e.includes('invalide')))

    // Missing first name row
    const missingFirstNameRow = result.rows[6]
    assert.ok(missingFirstNameRow?.errors.some((e) => e.includes('Prénom absent')))
  }
})
