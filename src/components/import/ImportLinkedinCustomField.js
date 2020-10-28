import React, { Component, Fragment } from 'react';
import _ from 'lodash';
import PropTypes from 'prop-types';

class ImportLinkedinCustomField extends Component {
  static propTypes = {
    type: PropTypes.oneOf(['work']).isRequired,
    data: PropTypes.object.isRequired,
  }

  renderWork = () => {
    const { data } = this.props;
    if (_.isEmpty(data.work)) {
      return null;
    }
    return (
      <>
        {data.work.map((row) => (
          <Fragment key={row.startDate} >
            <div className='linkedin'>
              <p className="company">
                {/* <strong>Company: </strong> */}
                {row.company}
              </p>
              {row.position ? (
                <p className="position">
                  {/* <strong>Position: </strong> */}
                  {row.position}
                </p>
              ) : null} 
              {row.date ? (
                <p className="date">
                  {/* <strong>Date: </strong> */}
                  {row.date} {`  ${row.duration} `}
                </p>
              ) : null}
              {row.location ? (
                <p className="location">
                  {/* <strong>Location: </strong> */}
                  {row.location}
                </p>
              ) : null}
              <br />
              {row.summary ? (
                <p className="summary">
                  {/* <strong>Summary: </strong> */}
                  {row.summary}
                </p>
              ) : null}
              <br />
            </div>
          </Fragment>
        ))}
      </>
    );
  }

  renderSkills = () => {
    const { data } = this.props;
    if (_.isEmpty(data.skills)) {
      return null;
    }
    return (
      <>
        {data.skills.map((row, index) => (
          <Fragment key={row.name}>
            <div className='linkedin'>
              <p >
                <strong className="skills">
                  {`${index + 1}. `}
                </strong>
                {row.name}
              </p>
            </div>
          </Fragment>
        ))}
      </>
    );
  }

  renderEduction = () => {
    const { data } = this.props;
    if (_.isEmpty(data.education)) {
      return null;
    }
    return (
      <>
        {data.education.map((row) => (
          <Fragment key={row.name}>
            <div className='linkedin'>
              {row.institution ? (
                <p className="institution">
                  {/* <strong>Institution: </strong> */}
                  {row.institution}
                </p>
              ) : null}
              {row.studyType ? (
                <p className="studyType">
                  {/* <strong>Study Type: </strong> */}
                  {row.studyType}
                </p>
              ) : null}
              {row.date ? (
                <p className="startDate">
                  {/* <strong>Date: </strong> */}
                  {`${row.startDate} - ${row.endDate}`}
                </p>
              ) : null}
              <br />
            </div>
          </Fragment>
        ))}
      </>
    );
  }

  render() {
    const { type } = this.props;

    if (type === 'work') {
      return this.renderWork();
    }

    if (type === 'skills') {
      return this.renderSkills();
    }
    if (type === 'education') {
      return this.renderEduction();
    }

    return null;
  }
}

export default ImportLinkedinCustomField;
