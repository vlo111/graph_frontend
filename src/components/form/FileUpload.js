import React from 'react';
import Dropzone from 'react-dropzone';
import _ from 'lodash';

class FileUpload extends React.Component {
    state = { warningMsg: '' };

    onDrop = (accepted, rejected) => {
      if (Object.keys(rejected).length !== 0) {
        const message = 'Please submit valid file type';
        this.setState({ warningMsg: message });
      } else {
        this.setState({ warningMsg: '' });
        const blobPromise = new Promise((resolve, reject) => {
          const reader = new window.FileReader();
          reader.readAsDataURL(accepted[0]);
          reader.onloadend = () => {
            const base64data = reader.result;
            resolve(base64data);
          };
        });
        blobPromise.then((value) => {
          accepted[0].preview = value;

          this.props.addFile(accepted);
        });
      }
    };

    render() {
      const { file } = this.props;

      let thumbs = {};

      let render = (
        <p>
          Drag&Drop file here
          <br />
          or
          <br />
          Browse file
        </p>
      );

      if (file.length) {
        const isImg = !_.isEmpty(['png', 'jpg', 'jpeg', 'gif', 'svg'].filter((p) => file[0].type.includes(p)));

        if (isImg) {
          const thumbsContainer = {
            width: '150px',
            height: '150px',
            borderRadius: '10px',
            objectFit: 'cover',
            objectPosition: 'center',
          };

          thumbs = file.map((file) => (
            <img style={thumbsContainer} src={file.preview} alt="profile" />
          ));
          render = file.map((file) => <aside>{thumbs}</aside>);
        } else {
          render = file.map((file) => (
            <p
              className="fileText"
              title={file.name}
              key={file.name}
            >
              {file.name.length > 10 ? `${file.name.substring(0, 10)}...` : file.name}
            </p>
          ));
        }
      }

      return (
        <div>
          {this.state.warningMsg && <p>{this.state.warningMsg}</p>}
          <div className="dropzone">
            <Dropzone
              multiple={false}
                        // accept="image/*"
              onDrop={(accepted, rejected) => this.onDrop(accepted, rejected)}
            >
              {({
                isDragAccept, isDragReject, acceptedFiles, rejectedFiles,
              }) => {
                // for drag and drop warning statement
                if (isDragReject) return 'Please submit a valid file';
                return render;
              }}
            </Dropzone>
          </div>
        </div>
      );
    }
}

export default FileUpload;
