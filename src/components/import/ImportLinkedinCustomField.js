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
          <Fragment key={row.startDate}>
            <p>
              <strong>Company: </strong>
              {row.company}
            </p>
            {row.location ? (
              <p>
                <strong>Location: </strong>
                {row.location}
              </p>
            ) : null}
            {row.position ? (
              <p>
                <strong>Position: </strong>
                {row.position}
              </p>
            ) : null}
            {row.startDate ? (
              <p>
                <strong>Date: </strong>
                {`${row.startDate} - ${row.endDate}`}
              </p>
            ) : null}
          {row.summary ? (
              <p>
                <strong>Summary: </strong>
                {row.summary}
              </p>
            ) : null}
            <hr />
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
            <p>
              <strong>
                {`${index + 1}. `}
              </strong>
              {row.name}
            </p>
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
            {row.institution ? (
              <p>
                <strong>Institution: </strong>
                {row.institution}
              </p>
            ) : null}
            {row.studyType ? (
              <p>
                <strong>Study Type: </strong>
                {row.studyType}
              </p>
            ) : null}
            {row.startDate ? (
              <p>
                <strong>Date: </strong>
                {`${row.startDate} - ${row.endDate}`}
              </p>
            ) : null}
            <hr />
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
