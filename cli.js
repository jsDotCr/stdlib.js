#!/usr/bin/env node
require('dotenv').config()
const { bold, magenta } = require('chalk')
const yargs = require('yargs')

console.log(bold(magenta('Welcome to the StdLib.js service hub!')))

yargs // eslint-disable-line no-unused-expressions
  .commandDir('commands')
  .demandCommand()
  .help()
  .argv
