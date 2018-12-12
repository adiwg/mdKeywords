#!/usr/bin/env node

/* jshint node:true */
/* jshint esversion:6 */

'use strict'

let fs = require('fs')
let buildify = require('buildify')
let rimraf = require('rimraf')
let mkdirp = require('mkdirp')
let path = 'lib/js'

if (fs.existsSync(path)) {
  rimraf.sync(path)
  console.log('Removed existing resources/js files.')
}

mkdirp.sync(path)
console.log('Created resources/js')

let files = fs.readdirSync('resources/json')

for (let file of files) {
  let name = path + '/' + file.split('.')[0] + '.js'

  buildify()
    .load('resources/json/' + file)
    .perform(function (content) {
      return 'module.exports = ' + content + ';'
    })
    .save(name)
  console.log('Created ' + name)
}

process.exit()
