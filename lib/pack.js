const debug = require('debug')('stdlibjs:pack')
const { readFile } = require('fs')
const glob = require('glob')
const { join } = require('path')
const { pack } = require('tar-fs')
const { promisify } = require('util')
const { createGzip } = require('zlib')
const { defaultIgnores } = require('../config')

let ignoreFiles = [
  '.gitignore',
  '.libignore'
]

/**
 * Reads the ignore files, parses them, and returns the list of entries to ignore.
 * @param {String} baseDirectory Base directory path
 */
async function getIgnores (baseDirectory) {
  let ignores = []
  const read = promisify(readFile)
  const ignoreFilesWithAbsolutePath = ignoreFiles.map(ignoreFile => join(baseDirectory, ignoreFile))
  debug('will ignore (defualt)', defaultIgnores)
  for (let ignoreFile of ignoreFilesWithAbsolutePath) {
    try {
      const fileContent = (await read(ignoreFile, 'utf8'))
        .split('\n')
        .filter(entry => !!entry)
      debug('ok', fileContent)
      ignores = ignores.concat(fileContent)
    } catch (e) {
      debug(`error reading ${ignoreFile}. Missing file?`, e)
    }
  }
  debug('will ignore (collected)', ignores)
  return defaultIgnores.concat(ignores)
}

/**
 * Gets all the relevant files, without directories, and ignored files.
 * @param {String} cwd Base directory path
 * @returns {PromiseLike<String[]>} List of allowed files
 */
async function getEntries (cwd) {
  const ignore = await getIgnores(cwd)
  debug('will ignore', ignore)
  return promisify(glob)('**/*', {
    cwd,
    dot: true,
    ignore,
    nodir: true
  })
}

/**
 * Given a function directory, it returns a stream of the tar'ed and gzip'ed folder
 * @param {String} functionDir Directory hosting the function
 * @returns {ReadableStream} .tar.gz package as a Readable Stream
 */
async function getPackageStream (functionDir) {
  debug('pack start', functionDir)

  const entries = await getEntries(functionDir)
  debug(entries)
  return pack(functionDir, {
    entries
  })
    .pipe(createGzip())
}

module.exports = getPackageStream
