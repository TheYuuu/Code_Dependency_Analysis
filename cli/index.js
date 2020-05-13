#!/usr/bin/env node

const program = require('commander')
const { up } = require('../server/index')

program
  .version('1.0.0')
  .option('-d, --dir [path]', 'The directory where the code locates', '')
  .option('-p, --port [value]', 'The port of server', 3002)
  .parse(process.argv)

const { dir, port } = program;

up({ dir, port })

let url = `http://localhost:${port}`
let start =
  process.platform === 'darwin'
    ? 'open'
    : process.platform === 'win32'
    ? 'start'
    : 'xdg-open'
require('child_process').exec(start + ' ' + url)
