var { getDir, getmodules }  = require('./readDir');
var { analysisRoot, delAttr }  = require('./analysisRoot');


function getData(filePath) {
  //调用文件遍历方法
  var root = {
    name: 'data',
    files: [],
    dirs: [],
    fileTpye: 'dir',
    type: 'dir'
  };

  getDir(filePath, root);
  // root = root.dirs[0];
  let { nodes, edges, fileTypes } = analysisRoot(root);
  delAttr(root);

  fileTypes = Array.from(new Set(fileTypes));
  fileTypes.push('dir');
  return { root, nodes, edges, fileTypes};
}

function handleNodeLink({type, nodeId, selectNodes, nodes, OriLinks}) {
  switch (type) {
    case 'add':
      selectNodes = addNode(selectNodes, nodeId, nodes);
      break;
    case 'del':
      selectNodes = delNode(selectNodes, nodeId, nodes);
      break;
  }

  let NodeMap = {};
  for (let i = 0; i < selectNodes.length; i++) {
    NodeMap[selectNodes[i].id] = 1;
  }

  let links = getLinks(NodeMap, OriLinks);
  return { selectNodes, links };
}

function addNode(selectNodes, nodeId, oriNodes) {
  let index = selectNodes.findIndex(e => +e.id === +nodeId);
  if (index !== -1) {
    return selectNodes;
  }
  selectNodes = selectNodes.concat(
    oriNodes.filter(item => item.id === String(nodeId))
  );
  return selectNodes;
}

function delNode(selectNodes, nodeId) {
  let index = selectNodes.findIndex(e => +e.id === +nodeId);
  if (index !== -1) {
    selectNodes.splice(index, 1);
  }
  return selectNodes;
}

function getLinks(NodeMap, OriLinks) {
  return OriLinks.filter(v => NodeMap[v.target] || NodeMap[v.source]);
}

module.exports = {
  getData,
  getmodules,
  handleNodeLink
}
