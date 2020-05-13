import * as d3 from 'd3';

const colorList = [
  '#058DC7',
  '#50B432',
  '#ED561B',
  '#DDDF00',
  '#24CBE5',
  '#64E572',
  '#FF9655',
  '#FFF263',
  '#6AF9C4'
]

const nodeColor = {
  // main: '#247ba0',
  // start: '#f3ae4b',
  end: '#774898',
  // middle: '#00a8b5'
  main: '#e16262',
  start: '#fabc60',
  middle: '#3a9679'
  // end: '#11144c'
}

export default class ChartController {
  constructor(props) {
    const {
      domsvg,
      dirTree,
      size,
      callback
    } = props

    const {
      width,
      height
    } = size;

    this.domsvg = domsvg;
    this.dirTree = dirTree;
    this.size = size;
    this.duration = 750;
    this.callback = callback;
    this.maxCount = 0;

    this.selectMap = {};
  }

  initCollapseClusterChart() {
    const {
      domsvg,
      dirTree,
      size
    } = this

    const {
      width,
      height
    } = size;

    let tree = data => {
      const root = d3.hierarchy(data);
      root.dx = 20;
      root.dy = 100;
      return d3.tree().nodeSize([root.dx, root.dy])(root);
    }

    const root = tree(dirTree);

    let x0 = Infinity;
    let x1 = -x0;
    root.each(d => {
      if (d.x > x1) x1 = d.x;
      if (d.x < x0) x0 = d.x;
    });

    const svg = domsvg;

    const g = svg.append("g")
      .attr("font-family", "sans-serif")
      .attr("font-size", 10)
      .attr("transform", `translate(${root.dy / 3},${root.dx - x0})`);

    this.content_g = g;
    const link = g.append("g")
      .attr("fill", "none")
      .attr("stroke", "#555")
      .attr("stroke-opacity", 0.4)
      .attr("stroke-width", 1.5)
      .selectAll("path")
      .data(root.links())
      .join("path")
      .attr("class", "link")
      .attr("d", (d, i) => {
        return "M" + d.source.y + "," + d.source.x +
          "H" + d.target.y + "V" + d.target.x +
          (d.target.children ? "" : "h" + 50);
      });

    const node = g.append("g")
      .attr("stroke-linejoin", "round")
      .attr("stroke-width", 3)
      .selectAll("g")
      .data(root.descendants())
      .join("g")
      .attr("transform", d => `translate(${d.y},${d.x})`);

    node.append("text")
      .text(d => d.data.name)
      .attr("dy", d => d.children ? '1em' : '0.31em')
      .attr("x", d => {
        return d.children ? 50 : 50
      })
      .attr("text-anchor", d => d.children ? "end" : "start")
      .clone(true).lower()
      .attr("stroke", "white");

    node.append("circle")
      .attr("fill", d => d.children ? "#555" : "#999")
      .attr("r", 2.5);

    this.addZoom();
  }

  initCollapseClusterChart2() {
    const {
      domsvg,
      dirTree,
      size
    } = this

    const {
      width,
      height
    } = size;

    this.content_g = domsvg.append('g');
    this.link_g = this.content_g.append('g')
      .attr("fill", "none")
      .attr("stroke", "#555")
      .attr("stroke-opacity", 0.4)
      .attr("stroke-width", 1.5);
    this.node_g = this.content_g.append('g')
      .attr("stroke-linejoin", "round")
      .attr("stroke-width", 3);

    var i = 0,
      duration = 750,
      root;

    var treemap = d3.tree().size([height * 1.2, width]);
    root = d3.hierarchy(dirTree, function (d) {
      return d.children;
    });
    root.x0 = height / 2;
    root.y0 = 0;

    // root.children.forEach(vm.collapse);
    this.treemap = treemap;
    this.duration = duration;
    this.i = i;
    this.root = root;

    this.update(root);

    this.addZoom();
  }

  update(source) {
    let {
      treemap,
      duration,
      i,
      root,
      node_g,
      link_g,
      size,
      dirTree
    } = this

    const {
      width,
      height
    } = size;

    const vm = this;
    this.maxCount = 0;
    this.getTreeNodes(root);
    let t = this.maxCount * 20 < height / 2 ? height / 2 : this.maxCount * 20;
    treemap.size([t, width]);
    root.x0 = height /2 - this.maxCount * 10
    source.x0 = height /2 - this.maxCount * 10;

    var treeData = treemap(root);
    var nodes = treeData.descendants(),
      links = treeData.descendants().slice(1);

    nodes.forEach(function (d) {
      d.y = d.depth * 180
    });

    var node = node_g.selectAll('g.node')
      .data(nodes, function (d) {
        return d.id || (d.id = ++i);
      });

    var nodeEnter = node.enter().append('g')
      .attr('class', 'node')
      .attr('id', d => `node_g_${d.data.id}`)
      .attr("transform", function (d) {
        return "translate(" + source.y0 + "," + source.x0 + ")";
      })
      .on('click', function (d) {
        vm.click(d, this);
      })
      .on('mouseover', function(d) {
        vm.hover(d, this);
      })
      .on('mouseout', function(d) {
        vm.cancleHover(d, this);
      })
      .on('contextmenu', function (d, e) {
        d3.event.preventDefault();
        vm.rightClick(d);
      });

    nodeEnter.append('circle')
      .attr('class', 'node')
      // .attr("fill", d => d.children ? "#555" : "#999")
      .attr("fill", d => `url(#${d.data.type}_icon)`)
      .attr("r", 6)

    nodeEnter.append('text')
      .text(d => d.data.name)
      .attr("class", d => {
        d.data.selected = vm.selectMap[d.data.id] === undefined ? d.data.selected : vm.selectMap[d.data.id];
        return d.data.selected ? 'textSelect' : 'textUnSelect'
      })
      .attr("dy", d => d.children ? '1em' : '0.31em')
      .attr("x", function (d) {
        return d.children ? -4 : 8;
      })
      .attr("text-anchor", d => d.children ? "end" : "start")
      .clone(true).lower();

    var nodeUpdate = nodeEnter.merge(node);

    nodeUpdate
      .attr('cursor', 'pointer')
      .transition()
      .duration(duration)
      .attr("transform", function (d) {
        d.y += (d.children ? 100 : 0);
        return "translate(" + d.y + "," + d.x + ")";
      });

    nodeUpdate.select('circle.node')
      .attr("fill", d => `url(#${d.data.type}_icon)`)
      .attr("r", 6);

    nodeUpdate.selectAll('text')
      .transition()
      .duration(duration)
      .attr("dy", d => d.children ? '1em' : '0.31em')
      .attr("x", d => d.children ? -4 : 8)
      .attr("text-anchor", d => d.children ? "end" : "start")

    var nodeExit = node.exit().transition()
      .duration(duration)
      .attr("transform", function (d) {
        return "translate(" + source.y + "," + source.x + ")";
      })
      .remove();


    nodeExit.select('circle')
      .attr('r', 1e-6);

    nodeExit.select('text')
      .style('fill-opacity', 1e-6);

    var link = link_g.selectAll('path.link')
      .data(links, function (d) {
        return d.id;
      });

    var linkEnter = link.enter().insert('path', "g")
      .attr("class", "link")
      .attr('d', function (d) {
        var o = {
          x: source.x0,
          y: source.y0
        }
        return diagonal(o, o)
      });

    var linkUpdate = linkEnter.merge(link);

    linkUpdate.transition()
      .duration(duration)
      .attr('d', function (d) {
        return diagonal(d, d.parent)
      });

    var linkExit = link.exit().transition()
      .duration(duration)
      .attr('d', function (d) {
        var o = {
          x: source.x,
          y: source.y
        }
        return diagonal(o, o)
      })
      .remove();

    nodes.forEach(function (d) {
      d.x0 = d.x;
      d.y0 = d.y;
    });

    function diagonal(s, d) {
      return "M" + s.y + "," + s.x +
        "H" + d.y + "V" + d.x +
        (d.children ? "" : "h" + 0);
    }
  }

  collapseCtrl(status) {
    let d = this.root;
    if (status)
      this.expandAll(d);
    else 
      this.collapseAll(d);
    this.update(d);
  }

  expandAll(d) {
    if (d._children) {
      d.children = d._children
      d.children.forEach((item)=>{
        this.expandAll(item)
      });
      d._children = null
    }
  }

  collapseAll(d) {
    if (d.children) {
      d._children = d.children
      d._children.forEach((item)=>{
        this.collapseAll(item)
      });
      d.children = null
    }
  }

  hover(d, node) {
    const vm = this;

    const dom = d3.select(node)
      .selectAll('text');

      dom.attr('stroke-width', '0.5px');
      dom.attr('stroke', 'black');
  }

  cancleHover(d, node) {
    const vm = this;

    const dom = d3.select(node)
      .selectAll('text');

      dom.attr('stroke-width', '0px');
      dom.attr('stroke', 'none');
  }

  click(d, that) {
    const vm = this;

    d.selected = vm.selectMap[d.data.id] || d.selected;
    if (!d.selected) {
      vm.nodeSelect(d, that);
    } else {
      vm.nodeUnSelect(d, that);
    }

    vm.collapse(d);
    vm.update(d);
  }

  nodeSelect(d, node) {
    const vm = this;

    const dom = d3.select(node)
      .selectAll('text');

      d.selected = true;
      vm.selectMap[d.data.id] = true;

      dom.attr('class', 'textSelect');
      if (d.data.fileTpye !== 'dir') {
        vm.callback.addNode(d.data.id);
      }
  }

  nodeUnSelect(d, node) {
    const vm = this;

    const dom = d3.select(node)
      .selectAll('text');

    d.selected = false;
    vm.selectMap[d.data.id] = false;

    dom.attr('class', 'textUnSelect');
    if (d.data.fileTpye !== 'dir') {
      vm.callback.delNode(d.data.id);
    }
  }

  collapse(d) {
    if (d.children) {
      d._children = d.children;
      d.children = null;
    } else {
      d.children = d._children;
      d._children = null;
    }
  }

  rightClick(d) {
    let pos = d3.event;
    this.callback.rightClickNode({
      top: pos.y,
      left: pos.x,
      Node: d
    });
  }

  addZoom() {
    const {
      domsvg,
      content_g,
      size
    } = this;

    const {
      width,
      height
    } = size;

    domsvg.call(d3.zoom()
      .extent([
        [0, 0],
        [width, height]
      ])
      .scaleExtent([-1, 8])
      .on("zoom", zoomed));

    function zoomed() {
      content_g.attr("transform", d3.event.transform);
    }
  }

  getTreeNodes(node) {
    if (!node.children) {
      return;
    }
    for (let i = 0; i < node.children.length; i++) {
      if (!node.children[i].children) {
        this.maxCount++;
      }
      if (node.children[i].children) {
        this.getTreeNodes(node.children[i]);
      }
    }
  }
}