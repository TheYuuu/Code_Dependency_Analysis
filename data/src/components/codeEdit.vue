<template>
  <div id="codeEdit_div">
    <el-drawer
      :visible.sync="table"
      direction="ltr"
      :withHeader="false"
      :stretch="true"
      size="50%">
        <el-tabs v-model="editableTabsValue" type="card" closable @tab-remove="removeTab">
          <el-tab-pane
            v-for="(item) in editableTabs"
            :key="item.name"
            :label="item.title"
            :name="item.name"
          >
            <el-button class="edit_btn" type="success" icon="el-icon-edit" circle size="mini" @click="editFileBtn(item)" :loading="loading"></el-button>
            <codemirror v-model="item.code" :options="item.cssOptions"></codemirror>
          </el-tab-pane>
      </el-tabs>
    </el-drawer>
  </div>
</template>

<script>
import {
  Component,
  Prop,
  Vue
} from 'vue-property-decorator';
import axios from 'axios';


import 'codemirror/mode/css/css.js'
import 'codemirror/mode/xml/xml.js'
import 'codemirror/mode/htmlmixed/htmlmixed.js'
import 'codemirror/mode/javascript/javascript.js'
import 'codemirror/mode/jsx/jsx.js'
import 'codemirror/mode/markdown/markdown.js'
import 'codemirror/mode/sass/sass.js'
import 'codemirror/mode/vue/vue.js'

import 'codemirror/theme/ayu-dark.css'

@Component({
  name: 'codeEdit'
})
export default class extends Vue {
  table = false;

  loading = false;
  cssOptions = {
    tabSize: 2,
    mode: '',
    theme: 'ayu-dark',
    styleActiveLine: true,
    lineWrapping: true,
    lineNumbers: true,
    fixedGutter: false,
    line: true,
    foldGutter: true,
    styleSelectedText: true,
    // keyMap: "sublime",
    matchBrackets: true,
    showCursorWhenSelecting: true,
    extraKeys: { "Ctrl": "autocomplete" },
    hintOptions:{
      completeSingle: false
    }
  };

  editableTabsValue =  '';
  editableTabs = [];

  languageTypeMap = {
    'ts': 'text/typescript',
    'js': 'text/typescript',
    'jsx': 'text/typescript-jsx',
    'css': 'css',
    'scss': 'css',
    'sass': 'text/x-sass',
    'vue': 'text/x-vue',
    'html': 'htmlmixed',
    'json': 'application/json',
    'md': 'text/x-markdown'
  }

  created() {
    const vm = this;

    vm.$bus.$on("openFile", (obj) => {
      vm.table = true;
      axios.get('/api/getFileContent', {
        params: {
          filePath: obj.filedir
        }
      }).then(({ data }) => {
        let cssOptions = Object.assign({}, vm.cssOptions);
        cssOptions.mode = vm.getLanguageType(obj.fileTpye);
        // cssOptions.mode = { "filename": obj.name}
        vm.addTab({
          cssOptions: cssOptions,
          filePath: obj.filedir,
          title: data.title,
          name: data.title,
          code: data.code
        });
      });
    });
  }

  mounted() {
  }

  getLanguageType(str) {
    return this.languageTypeMap[str];
  }

  editFileBtn(item) {
    const vm = this;
    this.$confirm('是否写入文件?', '提示', {
      confirmButtonText: '确定',
      cancelButtonText: '取消',
      type: 'success'
    }).then(() => {
      vm.editFile(item);
    }).catch(() => {
    });
  }

  editFile(item) {
    const vm = this;
    vm.loading = true;
    axios.post('/api/editFile', {
      data: {
        filePath: item.filePath,
        content: item.code
      }
    }).then(({ data: { message, status } }) => {
      vm.$message({
        message: message,
        type: status ? 'success' : 'error'
      });
      vm.loading = false;
    }).catch(() => {
      vm.loading = false;
    });
  }

  addTab(target) {
    const vm = this;
    let index = vm.editableTabs.findIndex((e,i) => e.name === target.name);
    if (index !== -1) {
      vm.editableTabsValue = vm.editableTabs[index].name;
      return;
    }; 
    vm.editableTabs.push(target);
    vm.editableTabsValue = target.name;
  }

  removeTab(targetName) {
    let tabs = this.editableTabs;
    let activeName = this.editableTabsValue;
    if (activeName === targetName) {
      tabs.forEach((tab, index) => {
        if (tab.name === targetName) {
          let nextTab = tabs[index + 1] || tabs[index - 1];
          if (nextTab) {
            activeName = nextTab.name;
          }
        }
      });
    }
    
    this.editableTabsValue = activeName;
    this.editableTabs = tabs.filter(tab => tab.name !== targetName);
  }

  clearTab() {
    this.editableTabsValue =  '';
    this.editableTabs = [];
  }
}
</script>

<style>
.CodeMirror-line  {
  white-space: nowrap!important;
}
.vue-codemirror {
  width: 100%;
}

.el-tabs__header {
  margin: 0px!important;
}

.el-tabs, .el-tab-pane {
  height: 100%;
  width: 100%;
}

.el-tabs__content {
  width: 100%;
  height: calc(100vh - 40px);
}

.el-tab-pane {
  position: relative;
  overflow: auto;
}

.edit_btn {
  position: absolute;
  right: 15px;
  z-index: 10;
}

.CodeMirror {
  height: 100%!important;
  overflow: hidden;
}

.el-drawer__body {
  height: 100%;
}

.el-drawer { 
background: #0a0e14!important;
}

.el-tab-pane::-webkit-scrollbar{
  width: 7px;
  height: 7px;
  border-radius: 4px;
  background-color: #0a0e14;
}

/*滚动条中可以拖动的那部分*/
.el-tab-pane::-webkit-scrollbar-thumb{
  background-color: #53b47f62;
  border-radius: 4px;
}

.CodeMirror-vscrollbar, .CodeMirror-scrollbar-filler, .CodeMirror-hscrollbar {
  display: none!important;
}
</style>
