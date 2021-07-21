import React, { Component } from 'react';
import memoizeOne from 'memoize-one';
import PropTypes from 'prop-types';
import Tooltip from 'rc-tooltip';
import { ReactComponent as RefreshSvg } from '../assets/images/icons/refresh.svg';
import { ReactComponent as CloseSvg } from '../assets/images/icons/close.svg';

class ImageUploader extends Component {
  static propTypes = {
    value: PropTypes.any.isRequired,
    email: PropTypes.string,
    onChange: PropTypes.func.isRequired,
  }
  
  static defaultProps = {
    email: '',
  }

  setImage = memoizeOne((image) => {
    if (typeof image === 'object') {
      const reader = new FileReader();

      reader.onload = (e) => {
        this.setState({ image: e.target.result });
      };

      reader.readAsDataURL(image);
    } else {
      this.setState({ image });
    }
  })

  constructor(props) {
    super(props);
    this.state = {
      image: '',
    };
  }

  handleChange = (ev) => {
    this.props.onChange(ev.target.files[0]);
  }

  render() {
    const { value, email } = this.props;
    const { image } = this.state;
    this.setImage(value);
    return (
      <div className={!!email ? "avatarUploader imageUploader" : "imageUploader"}>
        <img
          src={image}
          className={!!email ? "avatar" : "thumbnailSave"}
          alt="image"
        />
        <label className={!!value ? "selectImage" : "selectImage addImage"}>
          <div className="icon">
          <RefreshSvg />
          </div>
          <input type="file" accept="image/*" onChange={this.handleChange} />
          <span className="addOrReplaceImage">{!!value ? "Replace" : "Add"} Image</span>

        {image && !image.includes('gravatar') ? (
          <Tooltip overlay="Delete Image" placement="top">
            <CloseSvg className="delete" onClick={() => this.props.onChange('')} />
          </Tooltip>
        ) : null}
        </label>
      </div>
    );
  }
}

export default ImageUploader;
