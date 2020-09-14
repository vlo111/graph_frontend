import React, { Component } from 'react';
import memoizeOne from 'memoize-one';
import PropTypes from 'prop-types';
import queryString from 'query-string';
import Api from '../../Api';
import Account from '../../helpers/Account';
import Utils from "../../helpers/Utils";

class NodeTabsContent extends Component {
  static propTypes = {
    content: PropTypes.string,
  }

  static defaultProps = {
    content: undefined,
  }

  constructor(props) {
    super(props);
    this.state = {
      contentType: '',
    };
  }

  getContentType = memoizeOne(async (text) => {
    this.setState({ contentType: '' });
    if (text) {
      const { data: { contentType } } = await Api.getContentType(text);
      this.setState({ contentType });
    }
  })

  render() {
    const { contentType } = this.state;
    const { content } = this.props;
    this.getContentType(content);

    if (['text/html', 'application/pdf'].includes(contentType)) {
      const query = queryString.stringify({
        url: content,
      });
      return (
        <div className="previewWrapper">
          <img src={Utils.fileSrc(`/helpers/content-thumbnail?${query}`, true)} alt="thumbnail" />
          <a href={content} target="_blank" rel="noopener noreferrer">{content}</a>
        </div>
      );
    }
    return (
      <div className="contentWrapper">
        {content}
      </div>
    );
  }
}

export default NodeTabsContent;
