<template>
<div id="graph_div">
</div>
</template>

<script>
import {
  Component,
  Prop,
  Vue
} from 'vue-property-decorator';
import echarts from 'echarts';
import axios from 'axios';

@Component({
  name: 'treeMap'
})
export default class extends Vue {
  oriNodes = [];
  selectNodes = [];
  links = [];
  option =  null;
  myChart = null;

  created() {
    const vm = this;
    vm.$bus.$on("addNode", (nodeId) => {
      vm.getNodeLink({
        type: 'add',
        nodeId: nodeId
      });
    });

    vm.$bus.$on("delNode", (nodeId) => {
      vm.getNodeLink({
        type: 'del',
        nodeId: nodeId
      });
    });

    vm.$bus.$on("clearNode", () => {
      vm.clearNode();
    });
  }

  mounted() {

  }

  getNodeLink(params) {
    let vm = this;
    vm.myChart = echarts.init(document.getElementById("graph_div"));
    axios.get('/getNodeLink', { params }).then(({ data }) => {
      vm.selectNodes = data.nodes;
      vm.links = data.links.map(v => {
        v.label = {
          show: true,
          formatter: (Object) => {
            return Object.data.values.join(",").slice(0,10);
          }
        }
        return v;
      });
      vm.updataGraph();

      vm.myChart.on('click', function (params) {
        if(params.data.filedir){
          vm.openFile(params.data);
        }
      });
    });
  }

  updataGraph() {
    let {
      selectNodes,
      links,
      dom,
      option,
      myChart
    } = this;

    var app = {};

    option = {
      title: {
        text: '依赖关系'
      },
      tooltip: {
        formatter: function (params,ticket,callback) {
          return params.dataType === 'edge' ? params.data.values.join(",") : params.data.filedir
        }
      },
      animationDurationUpdate: 1500,
      animationEasingUpdate: 'quinticInOut',
      series: [{
        type: 'graph',
        layout: 'force',
        force: {
          gravity: 0.1,
          repulsion: 1000,
          edgeLength: 200,
        },
        focusNodeAdjacency: true,
        draggable: true,
        symbolSize: 50,
        roam: true,
        label: {
          show: true
        },
        edgeSymbol: ['circle', 'arrow'],
        edgeSymbolSize: [4, 10],
        edgeLabel: {
          fontSize: 20
        },
        data: selectNodes,
        // links: [],
        links: links,
        lineStyle: {
          opacity: 0.9,
          width: 2,
          curveness: 0
        }
      }]
    };
    if (!myChart) {
      myChart = echarts.init(document.getElementById("graph_div"));
    }
    if (option && typeof option === "object") {
      myChart.setOption(option, true);
    }
  }

  openFile(data) {
    this.$bus.$emit("openFile", data);
  }

  clearNode() {
    this.selectNodes = [];
    this.links = [];
    this.updataGraph();
  }
}
</script>

<style>
#graph_div {
  width: 100%;
  height: 100%;
  border-left: 1px dashed #3f51b540;
  user-select: none;
}
</style>
