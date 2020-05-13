<template>
  <div id="app">
    <div class="toolBox">
      <el-row class="mb-xs">
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
            <el-button round size="mini" @click="chooseModule">确定</el-button>
          </div>
        </el-col>
      </el-row>
      <el-row class="mb-xs">
        <el-switch
          v-model="colles"
          @change="coll"
          active-text="全部展开"
          inactive-text="全部闭合">
        </el-switch>
      </el-row>
      <el-row>
        <el-col :span="20">
          <div class="grid-content bg-purple">
            <el-button round size="mini" @click="clearNodes">清除节点</el-button>
          </div>
        </el-col>
      </el-row>
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
  moduleItem = '';
  moduleList = [];
  colles = true;

  mounted() {
    const vm = this;
    axios.get('/getModules').then(({ data }) => {
      vm.moduleList = data.modules;
      vm.moduleItem = vm.moduleList[0];
      vm.$refs.treeMap.getRootInf(vm.moduleItem);
    });
  }

  chooseModule() {
    this.colles = true;
    this.$refs.treeMap.getRootInf(this.moduleItem);
    this.$refs.graph.clearNode();
    this.$refs.codeEdit.clearTab();
  }

  clearNodes() {
    this.$bus.$emit("clearNode");
  }

  coll() {
    this.$bus.$emit("collapse", this.colles);
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
  background-image: linear-gradient(to right, #48429f78, #d6856c4f);
  overflow: hidden;
}

#tree_view, #graph_view {
  float: left;
  width: 50%;
  height: 100%;
}

.toolBox {
  position: absolute;
  z-index: 10;
  width: 340px;
  padding: 10px;
}

.mb-xs{ 
  margin-bottom: 20px;
}
</style>
