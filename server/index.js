const path = require('path');
const fs = require('fs');
const Koa = require('koa')
const compress = require('koa-compress')
const Router = require('koa-router')
const cors = require('@koa/cors')
const serve = require('koa-static')
const bodyParser = require('koa-bodyparser')

const {
  getData,
  getmodules,
  handleNodeLink
} = require('./lib/core');


function up(params) {
  const { dir, port } = params;

  const app = new Koa()
  const router = new Router()
  
  app.use(bodyParser())
  app.use(cors())
  app.use(compress())
  
  var modulePath = '';
  var filePath = path.resolve((dir || process.cwd()) + '/' + modulePath);
  var root; //根节点
  var fileTypes; // 涵盖文件类型
  
  var nodes = []; // 节点数组
  var edges = []; // 边数组
  var selectNodes = []; // 选中节点
  
  var modules = getmodules(path.resolve(filePath));
  
  router.get('/getRootInf', (ctx, next) => {
    try {
      let query = ctx.query.moduleItem;
      
      let re = getData(path.resolve(filePath + '/' + query));
      root  = re.root;
      fileTypes = re.fileTypes;
      nodes = re.nodes;
      edges = re.edges;
      selectNodes = [];
  
      ctx.body = {
        root: root,
        fileTypes: fileTypes
      };
    } catch (e) {
      console.log(e)
      next(e)
    }
  });
  
  router.get('/getNodeLink', (ctx, next) => {
    try {
      let query = ctx.query;
      let re = handleNodeLink({
        type: query.type,
        nodeId: query.nodeId,
        selectNodes: selectNodes,
        nodes: nodes,
        OriLinks: edges
      });
  
      selectNodes = re.selectNodes;
      ctx.body = {
        "nodes": selectNodes,
        "links": re.links
      };
    } catch (e) {
      console.log(e)
      next(e)
    }
  });
  
  router.get('/getFileContent', (ctx, next) => {
    try {
      let query = ctx.query.filePath;
      let data = fs.readFileSync(query).toString();
      ctx.body = {
        "code": data,
        "title": query.replace(filePath, '')
      };
    } catch (e) {
      console.log(e)
      next(e)
    }
  });
  
  router.post('/editFile', async (ctx, next) => {
    try {
      let postData = ctx.request.body.data;
      let status = 1;
      let errInf = null;
      await fs.writeFile(postData.filePath, postData.content,  function(err) {
        if (err) {
          status = 0;
          message = '写入失败';
          errInf = err;
          return console.error(err);
        }
     });
  
      ctx.body = {
        'message': '写入成功',
        'status': status,
        'errInf': errInf
      };
    } catch (e) {
      console.log(e)
      next(e)
    }
  });
  
  router.get('/getModules', (ctx, next) => {
    try {
      modules = getmodules(path.resolve(filePath));
      ctx.body = {
        modules: modules
      };
    } catch (e) {
      console.log(e)
      next(e)
    }
  });
  
  router.get('/getDepNode', (ctx, next) => {
    try {
      let nodeId = ctx.query.nodeId;
      let depNodes = (edges || [])
        .filter(v => +v.target === +nodeId)
        .map(v => v.source);
  
      depNodes.push(nodeId);
      ctx.body = {
        depNodes: depNodes
      };
    } catch (e) {
      console.log(e)
      next(e)
    }
  });
  
  router.get('/getDepedNode', (ctx, next) => {
    try {
      let nodeId = ctx.query.nodeId;
      let depNodes = (edges || [])
        .filter(v => +v.source === +nodeId)
        .map(v => v.target);
  
      depNodes.push(nodeId);
      ctx.body = {
        depNodes: depNodes
      };
    } catch (e) {
      console.log(e)
      next(e)
    }
  });
  
  app.use(serve(path.resolve(__dirname, '../client/dist/')))
  app.use(router.routes());
  app.listen(port || 4000);
}

// up({});

module.exports = {
  up
}