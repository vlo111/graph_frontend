import React from 'react';
import AddNodeModal from '../components/chart/AddNodeModal';
import renderWithRedux from './render-redux';

describe('component', () => {
  let wrapper;

  const form = (id, className) => wrapper.find('#id').find(`.${className}`); // container.querySelector(`form[id="${id}"] > .${className}`);

  const field = (name) => form('createNode', name);

  const expectToBeInputFieldOfTypeText = (formElement, type) => {

    console.log(wrapper.find('#createNode').find('.aaa').type());
    console.log(wrapper.find('#createNode').find('.aaa').type());

    // expect(formElement).not.toBeNull();
    // expect(formElement.first()).toEqual('INPUT');
    // if (type) expect(formElement.type).toEqual(type);
  };

  const itRendersAsATextBox = (fieldName, type) => {
    it('renders as a text box', () => {
      expectToBeInputFieldOfTypeText(field(fieldName), type);
    });
  };

  beforeEach(() => {
    (wrapper = renderWithRedux(<AddNodeModal />));
  });

  itRendersAsATextBox('aaa');
});
