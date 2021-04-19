class AnalysisUtils {
    static getComponent = (nodes, links) => this.dfsAlghoritm(nodes, links)

    static getAdjacentNodes = (generalDegree, nodeId) => {
      const source = [...new Set(generalDegree.map((p) => p.source))].filter((p) => p !== nodeId);

      const target = [...new Set(generalDegree.map((p) => p.target))].filter((p) => p !== nodeId);

      return [...new Set(source.concat(target))];
    }

    static dfsAlghoritm = (nodes, links) => {
      if (nodes.length && links.length) {
        const components = [];

        let checkedNodes = 0;
        let lastPartNodes = nodes;

        let { id } = nodes[0];

        let degree = links.filter((x) => x.source === id || x.target === id);

        // Create a Stack and add our initial node in it
        let stack = this.getAdjacentNodes(degree, id);

        const explored = new Set();

        // Mark the first node as explored
        explored.add((nodes[0].id));

        // We'll continue till our Stack gets empty
        while (stack.length) {
          const currentNode = stack.pop();

          // 1. In the edges object, we search for nodes this node is connected to.
          // 2. We filter out the nodes that have already been explored.
          // 3. Then we mark each unexplored node as explored and push it to the Stack.
          explored.add(currentNode);

          degree = links.filter((x) => x.source === currentNode || x.target === currentNode);

          this.getAdjacentNodes(degree, currentNode).forEach((p) => {
            if (!explored.has(p)) {
              stack.push(p);
              explored.add(p);
            }
          });
          if (!stack.length) {
            if ((explored.size + checkedNodes) !== nodes.length) {
              checkedNodes += explored.size;
              const firstPartNodes = [];
              const lastPartTemp = [];

              lastPartNodes.map((node) => {
                if (explored.has(node.id)) {
                  firstPartNodes.push(node);
                } else {
                  lastPartTemp.push(node);
                }
              });

              components.push(firstPartNodes);

              lastPartNodes = lastPartTemp;

              id = lastPartNodes[0].id;

              degree = links.filter((x) => x.source === id || x.target === id);

              stack = this.getAdjacentNodes(degree, id);

              explored.clear();

              explored.add(id);
            } else {
              components.push(nodes.filter((node) => explored.has(node.id)));
            }
          }
        }

        return { components };
      }
      return null;
    }

    static getShortestPath = (start, end, nodes, links) => {
      const stack = [{
        node: start,
        shortestPath: '',
      }];

      const distances = [{
        currentNode: start,
        shortestPath: 0,
        prevNode: null,
      }];

      const visited = [];

      let parent = '';

      while (stack.length) {
        const currentNode = stack.shift().node;

        // Create a Stack and add our initial node in it
        let adjancentLinks = links.filter((p) => p.source === currentNode || p.target === currentNode);

        // parent link value
        let parentPath = null;

        if (parent) {
          parentPath = distances.filter((p) => (p.currentNode === currentNode))[0].shortestPath;

          adjancentLinks = adjancentLinks.filter((p) => !(visited.includes(p.source) || visited.includes(p.target)));
        }

        adjancentLinks.forEach((link) => {
          const target = link.source !== currentNode ? link.source : link.target;
          let path;

          if (parentPath) {
            path = link.value + parentPath;

            const checkShortest = distances.filter((p) => {
              if (p.currentNode === target) {
                // ditarkel nayev havasar koxmeri depq@
                if (path < p.shortestPath) {
                  p.prevNode = currentNode;
                }
                if (path === p.shortestPath) {
                  console.log(currentNode);
                  console.log(p);
                }

                path = path <= p.shortestPath ? path : p.shortestPath;
                p.shortestPath = path;

                return true;
              }
              return false;
            }).length;

            if (!checkShortest) {
              distances.push({
                currentNode: target,
                shortestPath: path,
                prevNode: currentNode,
              });
            }
          } else {
            distances.push({
              currentNode: target,
              shortestPath: link.value,
              prevNode: currentNode,
            });
          }

          // push stack if current node not exist in there
          if (!stack.find((p) => p.node === target)) {
            stack.push({ node: target, shortestPath: path || link.value });
          }
        });
        stack.sort((a, b) => a.shortestPath - b.shortestPath);
        visited.push(currentNode);
        parent = currentNode;

        if (currentNode === end) {
          break;
        }
      }
      nodes.forEach((p) => {
        distances.forEach((d) => {
          if (d.currentNode === p.id) {
            d.nodeName = p.name;
          }
          if (d.prevNode === p.id) {
            d.prevNodeName = p.name;
          }
        });
      });

      const listLinks = [];
      const listNodes = [];
      let tmpDist = distances.filter((p) => p.currentNode === end)[0];
      listLinks.push({
        source: tmpDist.currentNode,
        target: tmpDist.prevNode,
      });
      listNodes.push(tmpDist.currentNode);
      while (tmpDist) {
        tmpDist = distances.filter((p) => tmpDist.prevNode === p.currentNode)[0];

        listNodes.push(tmpDist.currentNode);
        if (tmpDist && tmpDist.prevNodeName) {
          listLinks.push({
            source: tmpDist.currentNode,
            target: tmpDist.prevNode,
          });
        } else {
          tmpDist = false;
        }
      }

      return { listLinks, listNodes };
    }
}

export default AnalysisUtils;
