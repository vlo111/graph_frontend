import React from 'react';
import AddNodeModal from '../components/chart/AddNodeModal';
import renderWithRedux from './render-redux';

describe('component', () => {
  let wrapper;

  beforeEach(() => {
    (wrapper = renderWithRedux(<AddNodeModal />));
  });

  const form = (id, selector) => wrapper.find(`#${id}`).find(`${selector}`); // container.querySelector(`form[id="${id}"] > .${className}`);

  const field = (selector) => form('createNode', selector);

  const expectToBeInputFieldOfTypeText = (formElement, type) => {
    console.log(formElement.debug());
    expect(formElement).not.toBeNull();
    expect(formElement.type()).toEqual('input');
    if (type) expect(formElement.type).toEqual(type);
  };

  const itRendersAsATextBox = (selector, type) => {
    it('renders as a text box', () => {
      expectToBeInputFieldOfTypeText(field(selector), type);
    });
  };

  itRendersAsATextBox('.nodeName > input');

  it('text should be in the modal', () => {
    const inAdvance = field('.show-more');

    expect(inAdvance.text()).toEqual('Show More');

    inAdvance.simulate('click');
  });
});
