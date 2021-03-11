import React, { Component } from 'react';
import PropTypes from 'prop-types';

class EditorMedia extends Component {
  static propTypes = {
    file: PropTypes.object.isRequired,
    fileData: PropTypes.object.isRequired,
  }

  render() {
    const { file, fileData } = this.props;

    if (!file.type.startsWith('image/')) {
      return (
        <a href={file.preview} download={file.name}>
          {file.name}
        </a>
      );
    }

    if (!fileData.description) {
      return (
        <img width="200" className="scaled" src={file.preview} alt={fileData.alt || file.name} />
      );
    }
    return (
      <table style={{ width: 200 }}>
        <tbody>
        <tr>
          <td>
            <img width="200" className="scaled" src={file.preview} alt={fileData.alt || file.name} />
            {fileData.description}
          </td>
        </tr>
        </tbody>
      </table>
    );
  }
}

export default EditorMedia;
