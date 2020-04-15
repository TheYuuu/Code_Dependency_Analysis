<template>
<div id="treeMap">
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

  created() {
    const vm = this;

    // vm.$bus.$on("openFile", (filePath) => {
    //   vm.table = true;
    //   vm.changfile = filePath;
    //   axios.get('/api/getFileContent', {
    //     params: {
    //       filePath: filePath
    //     }
    //   }).then(({ data }) => {
    //   });
    // });

    vm.$bus.$on("updateRoot", (moduleItem) => {
      vm.getRootInf(moduleItem);
    });
  }

  mounted() {
    let vm = this;
    vm.getRootInf('contract')
  }

  getRootInf(moduleItem) {
    let vm = this;
    axios.get('/api/getRootInf', {
      params: {
        moduleItem: moduleItem
      }
    }).then(({ data }) => {
      vm.updataView(data.root);

      vm.icons = data.fileTypes.map(item => {
        return {
          id: item + '_icon',
          url: require(`../assets/icons/${item}.svg`)
        }
      });
    });
  }

  updataView(root) {
    let vm = this;

    let width = document.getElementById('treeMap').offsetWidth;
    let height = document.getElementById('treeMap').offsetHeight;
    let chart = new ChartController({
      size: {
        width,
        height
      },
      dirTree: root,
      domsvg: d3.select('#treeSvg'),
      callback:{
        addNode: vm.addNode(),
        delNode: vm.delNode()
      }
    });
    d3.select('#treeSvg').selectAll('g').remove();
    chart.initCollapseClusterChart2();
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
  border: 1px solid;
}

.node text {
  font: 10px sans-serif;
}

.node .select {
  stroke: red;
  stroke-width: 1px;
}
</style>
