import React, { Component } from 'react';
import memoizeOne from 'memoize-one';
import { ReactComponent as RefreshSvg } from '../assets/images/icons/refresh.svg';

class AvatarUploader extends Component {
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
    const { value } = this.props;
    const { image } = this.state;
    this.setImage(value);
    return (
      <div id="avatarUploader">
        <img src={image} className="avatar" alt="avatar" />
        <label className="selectImage">
          <RefreshSvg />
          <input type="file" accept="image/*" onChange={this.handleChange} />
          <span>Replace Image</span>
        </label>
      </div>
    );
  }
}

export default AvatarUploader;
