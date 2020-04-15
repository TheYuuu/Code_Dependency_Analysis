<template>
  <div id="app">
    <div class="toolBox">
      <el-col :span="20">
        <div class="grid-content bg-purple">
          <el-select v-model="moduleItem" filterable placeholder="请选择模块" size="mini" style="margin-right:10px">
            <el-option
              v-for="item in moduleList"
              :key="item"
              :label="item"
              :value="item">
            </el-option>
          </el-select>
          <el-button size="mini" @click="chooseModule">确定</el-button>
        </div>
      </el-col>
    </div>
    <div id="tree_view">
      <treeMap ref="treeMap"></treeMap>
    </div>
    <div id="graph_view">
      <graph ref="graph"></graph>
    </div>
    <codeEdit ref="codeEdit"></codeEdit>
  </div>
</template>


<script>
import { Component, Vue } from 'vue-property-decorator';
import treeMap from './components/treeMap.vue';
import graph from './components/graph.vue';
import codeEdit from './components/codeEdit.vue';
import echarts from 'echarts';
import axios from 'axios';

@Component({
  components: { treeMap, graph, codeEdit }
})
export default class extends Vue {
  moduleItem = 'contract';
  moduleList = [];

  mounted() {
    const vm = this;
    axios.get('/api/getModules').then(({ data }) => {
      vm.moduleList = data.modules;
    });
  }

  chooseModule() {
    this.$refs.treeMap.getRootInf(this.moduleItem);
    this.$refs.graph.clearNode();
    this.$refs.codeEdit.clearTab();
  }
}
</script>

<style>
* {
  padding: 0px;
  margin: 0px;
  box-sizing: border-box;
}

#app {
  width: 100vw;
  height: 100vh;
}

#tree_view, #graph_view {
  float: left;
  width: 50%;
  height: 100%;
}

.toolBox {
  position: absolute;
  z-index: 10;
  width: 100%;
  padding: 10px;
}
</style>
