var fs = require('fs');
var path = require('path');
var { getDependencies } = require('./getDependencies');
// const depcruise = require('dependency-cruiser').cruise;

var id = 0;
function getDir(filePath, Vnode) {
  var files = fs.readdirSync(filePath);
  files.forEach(function (filename) {
    var filedir = path.join(filePath, filename);
    var stats = fs.statSync(filedir);

    var isFile = stats.isFile(); //是文件
    var isDir = stats.isDirectory(); //是文件夹
    let type = filename.split(".")[1] ? filename.split(".").pop() : 'dir';
    if (isFile && filename !== ".DS_Store"
      && filename !== 'node_modules'
        && filename !== '.git'
          && filename !== '.vscode') {
      Vnode.files.push({
        type: type,
        fileTpye: 'file',
        filedir: filedir,
        parent: Vnode,
        name: filename,
        id: String(id++),
        dependencies: getDependencies(filedir)
      });
    }
    if (isDir && filename !== ".DS_Store"
      && filename !== 'node_modules'
        && filename !== '.git'
          && filename !== '.vscode') {
      let TNode = {
        type: type,
        fileTpye: 'dir',
        filedir: filedir,
        parent: Vnode,
        name: filename,
        files: [],
        dirs: [],
        id: String(id++)
      };
      Vnode.dirs.push(TNode);
      getDir(filedir, TNode);
    }
  });
}

function getmodules(filePath) {
  var files = fs.readdirSync(filePath);
  return files.filter(item => fs.statSync(path.join(filePath, item)).isDirectory()
    && item !== 'node_modules'
      && item !== '.git'
        && item !== '.vscode');
}

module.exports = {
  getDir,
  getmodules
}
