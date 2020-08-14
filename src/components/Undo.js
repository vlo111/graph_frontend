import React, { Component } from 'react';
import Button from './form/Button';
import undoImg from '../assets/images/icons/undo.svg'
import undoBackImg from '../assets/images/icons/undo-back.svg'

class Undo extends Component {
  render() {
    return (
      <div className="undoWrapper">
        <Button className="undo" icon={undoImg}>6</Button>
        <Button className="undoBack" icon={undoBackImg}>0</Button>
      </div>
    );
  }
}

export default Undo;
