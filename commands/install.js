const { bold } = require('chalk')
const { spawn } = require('child_process')
const { spawnOptions } = require('../config')
const listServices = require('../lib/list-services')

exports.command = 'install'
exports.describe = 'Installs all the services\' dependencies'

exports.handler = async function install () {
  console.log(`Will ${bold('install')}…`)

  const servicesList = await listServices()
  servicesList.forEach(({ serviceName, servicePath }) => {
    console.log(`… ${bold(serviceName)} dependencies`)
    spawn('npm', ['install'], spawnOptions(servicePath))
  })
}
