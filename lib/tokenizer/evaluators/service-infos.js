const debug = require('debug')('stdlib:token:serviceinfos')

const textToValue = [
  {
    matches: 'Authenticated as',
    type: 'authentication',
    value: ({ time, fn, text }) => {
      return {
        fn,
        time,
        as: text.match(/"(.*?)"/)[1]
      }
    }
  },
  {
    matches: 'Compiling package with environment',
    type: 'compileWithEnvironment',
    value: ({ time, fn, text }) => {
      return {
        fn,
        time,
        environment: text.match(/"(.*?)"/)[1]
      }
    }
  },
  {
    matches: 'Compiling package (',
    type: 'compileRelease',
    value: ({ time, fn, text }) => {
      return {
        fn,
        time,
        version: text.match(/\((.*?)\)/)[1]
      }
    }
  },
  {
    matches: 'Removing package with environment',
    type: 'removeFromEnvironment',
    value: ({ time, fn, text }) => {
      return {
        fn,
        time,
        environment: text.match(/"(.*?)"/)[1]
      }
    }
  },
  {
    matches: 'Removing package (',
    type: 'removeRelease',
    value: ({ time, fn, text }) => {
      return {
        fn,
        time,
        version: text.match(/\((.*?)\)/)[1]
      }
    }
  },
  {
    matches: 'Extracting package contents',
    type: 'extractContents',
    value: ({ time, fn, text }) => {
      return {
        fn,
        time,
        size: text.match(/\(size (.*?)\)/)[1]
      }
    }
  },
  {
    matches: 'Installing package dependencies',
    type: 'installDependencies',
    value: ({ time, fn }) => {
      return {
        fn,
        time
      }
    }
  },
  {
    matches: 'Preparing compilation package',
    type: 'prepareCompilation',
    value: ({ time, fn }) => {
      return {
        fn,
        time
      }
    }
  },
  {
    matches: 'Uploading compiled package',
    type: 'upload',
    value: ({ time, fn }) => {
      return {
        fn,
        time
      }
    }
  },
  {
    matches: 'Registering compiled package',
    type: 'register',
    value: ({ time, fn }) => {
      return {
        fn,
        time
      }
    }
  },
  {
    matches: 'Starting service',
    type: 'start',
    value: ({ time, fn }) => {
      return {
        fn,
        time
      }
    }
  },
  {
    matches: 'now available',
    type: 'available',
    value: ({ time, fn, text }) => {
      return {
        fn,
        time,
        fullName: text.match(/"(.*?)"/)[1]
      }
    }
  },
  {
    matches: 'has been removed',
    type: 'removed',
    value: ({ time, fn, text }) => {
      return {
        fn,
        time,
        fullName: text.match(/"(.*?)"/)[1]
      }
    }
  },
  {
    matches: 'Cleaning up registry',
    type: 'cleanUp',
    value: ({ time, fn }) => {
      return {
        fn,
        time
      }
    }
  },
  {
    matches: 'No such package',
    type: 'packageNotFound',
    value: ({ time, fn, text }) => {
      return {
        fn,
        time,
        fullName: text.match(/"(.*?)"/)[1],
        error: text
      }
    }
  },
  {
    matches: 'has already been removed',
    type: 'packageAlreadyRemoved',
    value: ({ time, fn, text }) => {
      return {
        fn,
        time,
        fullName: text.match(/"(.*?)"/)[1],
        error: text
      }
    }
  },
  {
    matches: 'Bad Request: Conflict',
    type: 'packageVersionConflicts',
    value: ({ time, fn, text }) => {
      const [ , newVersion, oldVersion ] = text.match(/"(.*?)".*"(.*?)"/)
      return {
        fn,
        time,
        newVersion,
        oldVersion,
        error: text
      }
    }
  }
]

module.exports = {
  type: 'service-infos',
  test: ({ currentLine }) => /^[\d-/\s:.]{20,}\[(.*?)\]/g.test(currentLine),
  value: ({ currentLine }) => {
    let [ , time, fn, text ] = currentLine.match(/^(\d{4}\/\d{2}\/\d{2}\s\d{2}:\d{2}:\d{2}\.\d{3})\s\[(.*?)\]\s(.*?)(?:!|\.)?$/)
    debug('type', time, fn, text)
    const { type, value } = textToValue.find(({ matches, type, value }) => text.includes(matches)) || {}

    if (type && value) {
      return {
        type,
        value: value({ time, fn, text })
      }
    } else {
      return {}
    }
  },
  belongsTo: 'service'
}
