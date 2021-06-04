import React, { Component } from 'react';
import {
  ResponsiveContainer, PieChart, Pie, Cell, Sector,
} from 'recharts';
import CustomPieChartLabel from './CustomPieChartLabel';
import { COLORS } from '../../data/colors';
import Chart from '../../Chart';

class AnalyticalPage extends Component {
  constructor() {
    super();

    this.setState({
      effectPie: null,
    });
  }

  onShowPartPie = (data, index) => {
    this.setState({
      effectPie: index,
    });
  }

  onClosePartPie = () => {
    this.setState({
      effectPie: null,
    });
    Chart.showAllNodes();
  }

  renderActiveShape = (props) => {
    const RADIAN = Math.PI / 180;
    const {
      cx,
      cy,
      innerRadius,
      outerRadius,
      startAngle,
      endAngle,
      midAngle,
      type,
    } = props;
    const sin = Math.sin(-RADIAN * midAngle);
    const cos = Math.cos(-RADIAN * midAngle);
    const sx = cx + (outerRadius - 80) * cos;
    const sy = cy + (outerRadius - 80) * sin;
    Chart.showSpecifiedNodes(Chart.getNodes().filter((p) => p.type === type));
    return (
      <Sector
        cx={sx}
        cy={sy}
        innerRadius={innerRadius}
        outerRadius={outerRadius}
        startAngle={startAngle}
        endAngle={endAngle}
        fill="#bf3755"
      />
    );
  };

  render() {
    const { nodes } = this.props;

    const typeData = nodes.map((p) => ({
      name: p.name,
      type: p.type,
    }));

    const groupTypes = _.groupBy(typeData, 'type');

    const types = [];

    Object.keys(groupTypes).forEach((l) => {
      const currentType = groupTypes[l];
      types.push({ type: currentType[0].type, count: currentType.length });
    });

    return (
      <div className="pieChart">
        <ResponsiveContainer>
          <PieChart
            margin={{
              top: 0,
            }}
          >
            <Pie
              data={types}
              activeIndex={this.state?.effectPie}
              dataKey="count"
              cx="50%"
              cy="50%"
              // label
              // labelLine={false}
              label={<CustomPieChartLabel centerText={500} />}
              outerRadius={100}
              // fill="#8884d8"
              activeShape={this.renderActiveShape}
              onMouseOver={this.onShowPartPie}
              onMouseLeave={this.onClosePartPie}
            >
              {types.map((entry, index) => (
                <Cell
                  className={`partPie_${index}`}
                  key={`cell-${index}`}
                  fill={COLORS[index % COLORS.length]}
                />
              ))}
            </Pie>
          </PieChart>
        </ResponsiveContainer>
      </div>
    );
  }
}

export default AnalyticalPage;
