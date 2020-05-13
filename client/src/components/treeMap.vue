<template>
<div id="treeMap">
  <v-contextmenu ref="contextmenu">
    <v-contextmenu-item v-if="contextmenuNode.data.type === 'dir'"
      @click="addDir">添加文件下所有文件</v-contextmenu-item>
    <v-contextmenu-item v-if="contextmenuNode.data.type === 'dir'"
      @click="delDir">删除文件下所有文件</v-contextmenu-item>
    <v-contextmenu-item v-if="contextmenuNode.data.type !== 'dir'"
      @click="addDepNode">添加依赖文件</v-contextmenu-item>
    <v-contextmenu-item v-if="contextmenuNode.data.type !== 'dir'"
      @click="addDepddNode">添加被依赖文件</v-contextmenu-item>
  </v-contextmenu>

  <svg id="treeSvg">
    <defs>
      <pattern v-for="item in icons" :key="item.id"
        :id="item.id" width="100%" height="100%" patternContentUnits="objectBoundingBox">
        <image width="1" height="1" :xlink:href="item.url"/>
      </pattern>
    </defs>
  </svg>
</div>
</template>

<script>
import {
  Component,
  Prop,
  Vue
} from 'vue-property-decorator';
import echarts from 'echarts';
import * as d3 from 'd3';
import axios from 'axios';
import ChartController from '../assets/TreeChart';

@Component({
  name: 'treeMap'
})
export default class extends Vue {
  @Prop() data;
  icons = [];
  contextmenuNode = {
    data: {
      type: ''
    },
    hasChildren: false
  }; //右键菜单节点

  created() {
    const vm = this;

    vm.$bus.$on("updateRoot", (moduleItem) => {
      vm.getRootInf(moduleItem);
    });

    vm.$bus.$on("collapse", (status) => {
      this.chart.collapseCtrl(status);
    });
  }

  mounted() {
  }

  getRootInf(moduleItem) {
    let vm = this;
    axios.get('/getRootInf', {
      params: {
        moduleItem: moduleItem
      }
    }).then(({ data }) => {
      vm.updataView(data.root);

      vm.icons = data.fileTypes.map(item => {
        let ob = {
          id: item + '_icon'
        };
        try {
          ob.url = require(`@/assets/icons/${item}.svg`);
        } catch (e) {
          ob.url = require('@/assets/icons/dir.svg');
        }

        return ob;
      });
    });
  }

  updataView(root) {
    let vm = this;

    let width = document.getElementById('treeMap').offsetWidth;
    let height = document.getElementById('treeMap').offsetHeight;
    this.chart = new ChartController({
      size: {
        width,
        height
      },
      dirTree: root,
      domsvg: d3.select('#treeSvg'),
      callback:{
        addNode: vm.addNode(),
        delNode: vm.delNode(),
        rightClickNode: vm.rightClickNode()
      }
    });
    d3.select('#treeSvg').selectAll('g').remove();
    this.chart.initCollapseClusterChart2();
  }

  addNode() {
    const vm = this;
    return function(nodeId) {
      vm.$bus.$emit("addNode", nodeId);
    }
  }

  delNode() {
    const vm = this;
    return function(nodeId) {
      vm.$bus.$emit("delNode", nodeId);
    }
  }

  rightClickNode() {
    const vm = this;
    return function({ top, left, Node}) {
      vm.contextmenuNode.data = Node.data;
      vm.OriNode = Node;
      vm.$refs.contextmenu.show({ top, left });
    };
  }

  addDir() {
    for (let i = 0;i < this.OriNode.data.children.length; i++) {
      let node = this.OriNode.data.children[i];
      if (node.type !== 'dir') {
        this.chart.nodeSelect({
          data: node
        }, d3.select(`#node_g_${node.id}`)._groups[0][0]);
      }
    }
  }

  delDir() {
    for (let i = 0;i < this.OriNode.data.children.length; i++) {
      let node = this.OriNode.data.children[i];
      if (node.type !== 'dir') {
        this.chart.nodeUnSelect({
          data: node
        }, d3.select(`#node_g_${node.id}`)._groups[0][0]);
      }
    }
  }

  addDepNode() {
    const vm = this;
    axios.get('/getDepNode', {
      params: {
        nodeId: vm.contextmenuNode.data.id
      }
    }).then(({ data }) => {
      for (let i = 0; i < data.depNodes.length; i++) {
        this.chart.nodeSelect({
          data: {
            id: data.depNodes[i]
          }
        }, d3.select(`#node_g_${data.depNodes[i]}`)._groups[0][0]);
      }
    });
  }

  addDepddNode() {
    const vm = this;
    axios.get('/getDepedNode', {
      params: {
        nodeId: vm.contextmenuNode.data.id
      }
    }).then(({ data }) => {
      for (let i = 0; i < data.depNodes.length; i++) {
        this.chart.nodeSelect({
          data: {
            id: data.depNodes[i]
          }
        }, d3.select(`#node_g_${data.depNodes[i]}`)._groups[0][0]);
      }
    });
  }
}
</script>

<style>
#treeMap, #treeSvg {
  width: 100%;
  height: 100%;
}

#treeSvg {
  transform: translate3d(0, 0, 0);
}

#treeMap {
  position: relative;
  user-select: none;
}

.textSelect {
  fill: #747def;
  font: 12px sans-serif;
  font-weight: bolder;
}

.textUnSelect {
  fill: black;
  font: 10px sans-serif;
  font-weight: inherit;
}
</style>
