var nodes = [];
var edges = [];
var fileTypes = [];

function getTarget(name, t) {
  let p = t;
  if (p.fileTpye === 'file') {
    p = p.parent;
  }
  let targetDir = p.dirs.filter(v => v.name.split(".")[0] === name.split(".")[0]);
  let targetFile = p.files.filter(v => v.name.split(".")[0] === name.split(".")[0]);
  if (targetDir.length) {
    p = targetDir[0];
  } else if (targetFile.length) {
    p = targetFile[0];
  }
  return p;
}

function findPre(params) {
  let { node, name } = params;
  let p = node;
  if (p.fileTpye === 'file') {
    p = p.parent;
  }
  if (name) {
    p = getTarget(name, p.parent);
  }
  return p;
}

function findNext(params) {
  let { node, name } = params;
  let t;
  t = getTarget(name, node);

  return t;
}

function findNode(str, node) {
  let t = node;
  let fileReg = /(\.{0,2}\/)([^\/]*)/g;
  let re;
  let lastRe = '';

  let ori = t;
  if (ori.fileTpye === 'file') {
    ori = ori.parent;
  }
  while ((re = fileReg.exec(str)) !== null) {
    lastRe = re[2] || lastRe;
    switch(re[1]) {
      case '../':
        t = findPre({ node: t,  name: re[2] });
        break;
      case './':
        t = findNext({ node: t,  name: re[2] });
        break;
      case '/':
        t = findNext({ node: t,  name: re[2] });
        break;
    }
  }

  // import 文件夹默认 index情况
  if(t && t.fileTpye === 'dir' && lastRe === t.name) {
    t = t.files.filter(v => v.name === 'index.ts')[0] || null;
  }

  // 向上向下找不到依赖情况
  if (t && (t.id === node.id || t.id === ori.id)) {
    t = null;
  }

  return t ? t.id : null;
}

function handleVals(str) {
  let re = str;
  if(!str) {
    return ['*'];
  }

  if (/\{[\s|\r\n]*([0-9|a-z|A-Z]*)[\s|\r\n]*\}/g.exec(str)) {
    re = /\{[\s|\r\n]*([0-9|a-z|A-Z]*)[\s|\r\n]*\}/g.exec(str)[1];
  }

  re = re.split(' as ')[0].split(',').map(
      item => {
        return item.replace(/\s+/, '');
      });

  return re;
}

function analysisRoot(root) {
  if (root.name === 'node_modules'
    || root.name === '.git'
    || root.name === '.vscode') {
      return;
  }
  for (let i = 0; i < root.files.length; i++) {
    if (!root.files[i].record) {
      root.files[i].record = true;
      let fileType = root.files[i].name.split(".")[1] ? root.files[i].name.split(".").pop() : 'dir';
      fileTypes.push(fileType);
      nodes.push({
        fileTpye: fileType,
        filedir: root.files[i].filedir,
        name: root.files[i].name,
        id: String(root.files[i].id)
      });
    }

    let dependencies = root.files[i].dependencies;
    for (let j = 0; j < dependencies.length; j++) {
      let findRe = findNode(dependencies[j].from, root.files[i]);
      if (findRe) {
        edges.push({
          target: String(root.files[i].id),
          source: String(findRe),
          values: handleVals(dependencies[j].vals)
        });
      }
    }
    root.files[i]._dependencies = root.files[i]._dependencies;
    root.files[i].dependencies = [];

    for (let k = 0; k < root.dirs.length; k++) {
      analysisRoot(root.dirs[k]);
    }
  }

  for (let k = 0; k < root.dirs.length; k++) {
    analysisRoot(root.dirs[k]);
  }

  return { nodes, edges, fileTypes};
}


function delAttr(root) {
  root.value = 1;
  delete root.parent;

  if (root.fileTpye === 'dir') {
    root.children = root.files.concat(root.dirs);
  } else {
    root.children = root.files;
  }
  
  delete root.files;
  delete root.dirs;
  for (let i = 0; i < root.children.length; i++) {
    delete root.children[i].parent;
    if (root.children[i].fileTpye === 'dir') {
      delAttr(root.children[i]);
    }
  }
}


module.exports = {
  analysisRoot,
  delAttr
}
