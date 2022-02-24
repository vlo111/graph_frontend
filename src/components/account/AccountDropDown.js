import React, { Component } from 'react';
import { connect } from 'react-redux';
import PropTypes from 'prop-types';
import { withRouter, Link, Route } from 'react-router-dom';
import Outside from '../Outside';
import Icon from '../form/Icon';
import { ReactComponent as DownSvg } from '../../assets/images/icons/down.svg';

class AccountDropDown extends Component {
  static propTypes = {
    myAccount: PropTypes.object.isRequired,
    match: PropTypes.object.isRequired,
    mini: PropTypes.bool,
  }

  static defaultProps = {
    mini: false,
  }

  constructor(props) {
    super(props);
    this.state = {
      showDropDown: false,
    };
  }

  toggleDropDown = () => {
    const { showDropDown } = this.state;

    this.setState({ showDropDown: !showDropDown });
  }

  componentDidUpdate() {
    const { showDropDown } = this.state;

    const arrow = document.querySelector('.accountArrow');

    if (arrow) {
      if (showDropDown) {
        const settingModalElement = document.querySelector('#accountDropDown .dropdown');

        if (settingModalElement) {

          arrow.style.left = `${(settingModalElement.getBoundingClientRect().x
              + (settingModalElement.offsetWidth / 2)) + 20}px`;
        }
      } else {
        arrow.style.display = 'none';
      }
    }
  }

  render() {
    const { showDropDown } = this.state;
    const {
      mini, myAccount: {
        firstName, lastName, id, avatar,
      }, match: { params: { graphId = '' } },
    } = this.props;
    const name = [firstName, lastName].map((n) => n).join(' ');

    return (
      <div id="accountDropDown" className={mini ? 'mini' : undefined}>
        <div className="accountInfo" onClick={this.toggleDropDown}>
          <img src={avatar} className="avatar" alt={name} />
          <DownSvg />
        </div>

        {showDropDown ? (
          <>
            <div className="modal-arrow-top accountArrow" style={{ top: '67px' }} />
            <Outside onClick={this.toggleDropDown} exclude="#accountDropDown">
              <div className="dropdown">
                <ul>
                  <li className="nameSign">
                    {mini ? (
                      <Icon value="fa-chevron-down" className="down" />
                    ) : (
                      <span className="name">{name}</span>
                    )}
                  </li>
                  <li className="item">
                    <Link to={`/profile/${id}`}>Account</Link>
                  </li>
                  <li className="item">
                    <Link to="/sign/sign-out">Sign Out</Link>
                  </li>
                </ul>
              </div>
            </Outside>
          </>
        ) : null}

      </div>
    );
  }
}

const mapStateToProps = (state) => ({
  myAccount: state.account.myAccount,
});

const mapDispatchToProps = {};

const Container = connect(
  mapStateToProps,
  mapDispatchToProps,
)(AccountDropDown);

export default withRouter(Container);
