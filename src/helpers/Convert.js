import Chart from '../Chart';

class Convert {
  static nodeDataToCsv(nodes) {
    const nodesArr = nodes.map((d) => ([
      d.name, d.value, d.description, d.files, d.links, d.icon,
    ]));
    nodesArr.unshift(['Name', 'Value', 'Description', 'files', 'Links', 'Icon']);
    const csv = nodesArr.map((v) => v.map((d) => `"${d}"`).join(',')).join('\n');
    return csv;
  }

  static linkDataToCsv(links) {
    const linksArr = links.map((d) => ([
      d.source, d.target, d.value,
    ]));
    linksArr.unshift(['Source', 'Target', 'Value']);
    const csv = linksArr.map((v) => v.map((d) => `"${d}"`).join(',')).join('\n');
    return csv;
  }

  static nodeDataToGrid(nodes) {
    return nodes.map((d, i) => ([
      { value: i, key: 'index' },
      { value: d.name, key: 'name' },
      { value: d.description, key: 'description' },
      { value: d.icon, key: 'icon' },
    ]));
  }

  static gridDataToNode(grid, nodes = Chart.getNodes()) {
    return grid.map((g, i) => ({
      ...nodes[i],
      name: g[1]?.value || '',
      description: g[2]?.value || '',
      icon: g[3]?.value || '',
    }));
  }

  static linkDataToGrid(links) {
    return links.map((d, i) => ([
      { value: i, key: 'index' },
      { value: d.source, key: 'source' },
      { value: d.target, key: 'target' },
      { value: d.value, key: 'value' },
    ]));
  }

  static gridDataToLink(grid, links = Chart.getLinks()) {
    return grid.map((g, i) => ({
      ...links[i],
      source: g[1]?.value || '',
      target: g[2]?.value || '',
      value: g[3]?.value || '',
    }));
  }
}

export default Convert;
