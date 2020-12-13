import React, { Component } from 'react';
import Modal from 'react-modal';
import _ from 'lodash';
import { connect } from 'react-redux';
import Button from '../form/Button';
import { ReactComponent as CloseSvg } from '../../assets/images/icons/close.svg';
import { setActiveButton } from '../../store/actions/app';
import ContextMenu from './ContextMenu';
import Chart from '../../Chart';

class AddLabelModal extends Component {
  closeDelete = () => {
    this.props.setActiveButton('create');
  }

  remove = () => {
    const { data, params, params: { squareDara } } = this.props;

    if (data.type === 'selectSquare.delete') {
      let nodes = Chart.getNodes();
      let links = Chart.getLinks();
      nodes = nodes.filter((d) => d.sourceId || !squareDara.nodes.includes(d.id));

      links = links.filter((d) => !squareDara.nodes.includes(d.target) && !squareDara.selectedNodes.includes(d.source));

      Chart.render({ links, nodes });
    } else {
      params.contextMenu = true;
      ContextMenu.event.emit(data.type, data.ev, { ...params });
    }

    this.props.setActiveButton('create');
  }

  render() {
    const { activeButton, data } = this.props;
    console.log('zazaaaaaaaa');
    console.log(data.type);
    if (activeButton !== 'deleteModal') {
      return null;
    }
    console.log(data);
    return (
      <Modal
        className="ghModal deleteModal"
        overlayClassName="ghModalOverlay"
        isOpen
        onRequestClose={this.closeDelete}
      >
        <div className="containerModal">
          <Button color="transparent" className="close" icon={<CloseSvg />} onClick={this.closeDelete} />
          <div className="form">
            <h2>Are you sure ?</h2>
            <p>
              Do you want to remove this
              {' '}
              {data.type !== 'selectSquare.delete' ? data.type.replace('.delete', '') : 'part'}
            </p>
            <div className="buttons">
              <Button className="ghButton cancel transparent alt" onClick={this.closeDelete}>
                Cancel
              </Button>
              <Button className="ghButton accent alt" type="submit" onClick={this.remove}>
                Remove
              </Button>
            </div>
          </div>
        </div>
      </Modal>
    );
  }
}

const mapStateToProps = (state) => ({
  activeButton: state.app.activeButton,
});
const mapDispatchToProps = {
  setActiveButton,
};

const Container = connect(
  mapStateToProps,
  mapDispatchToProps,
)(AddLabelModal);

export default Container;
