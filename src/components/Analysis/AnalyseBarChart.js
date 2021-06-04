import React, { Component } from 'react';
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip,
} from 'recharts';
import Chart from '../../Chart';

class AnalyticalPage extends Component {
    showAllNodes = () => {
      Chart.showAllNodes();
    }

    render() {
      const { degreeDistribution } = this.props;

      const showDegree = [];

      if (degreeDistribution) {
        Object.keys(degreeDistribution).forEach((p) => {
          showDegree.push({
            degree: p,
            count: degreeDistribution[p].length,
          });
        });
      }

      const getIntroOfPage = (label) => {
        const textDegree = [];

        Object.keys(degreeDistribution).forEach((p) => {
          if (p === label) {
            Chart.showSpecifiedNodes(degreeDistribution[p]);
            degreeDistribution[p].map((l) => textDegree.push({
              name: l.name,
              color: l.color,
            }));
          }
        });
        return textDegree;
      };

      const CustomTooltip = ({ active, payload, label }) => {
        if (!degreeDistribution) return <div />;
        const nodes = degreeDistribution[label]?.length;
        if (active) {
          return (
            <div className="custom-tooltip">
              {/* <p className="label">{`${label} : ${payload[0].value}`}</p> */}
              <div>
                <strong>
                  {' '}
                  {nodes}
                  {' '}
                  NODES IN
                  {' '}
                  {label}
                  {' '}
                  DEGREES
                </strong>
              </div>
              {getIntroOfPage(label).slice(0, 4).map((node) => (
                <div className="tooltipHover">
                  <div style={{ background: node.color }} className="circle" />
                  <div className="intro">
                    { node.name && node.name.length > 8
                      ? `${node.name.substr(0, 8)}... `
                      : node.name}
                  </div>
                </div>
              ))}
              {nodes > 4 && <p className="more">more...</p>}
              <p className="desc">Degree distribution .</p>
            </div>
          );
        }

        return null;
      };

      return (
        <div className="containerBarChart" onMouseLeave={this.showAllNodes}>
          <BarChart
            width={500}
            height={300}
            data={showDegree}
            margin={{
              top: 50, right: 30, left: 20, bottom: 5,
            }}
          >
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="degree" />
            <YAxis dataKey="count" />
            <Tooltip content={<CustomTooltip />} />
             {/*<Legend />*/}
            <Bar dataKey="count" barSize={20} fill="#8884d8" />
          </BarChart>
        </div>
      );
    }
}

export default AnalyticalPage;
