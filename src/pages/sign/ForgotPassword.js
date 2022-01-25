import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { Link, Redirect } from 'react-router-dom';
import { connect } from 'react-redux';
import { toast } from 'react-toastify';
import _ from 'lodash';
import { ReactComponent as LogoSvg } from '../../assets/images/logo.svg';
import { forgotPasswordRequest } from '../../store/actions/account';
import WrapperSign from '../../components/WrapperSign';
import Input from '../../components/form/Input';
import Button from '../../components/form/Button';
import ForgtImage from '../../assets/images/forgot_image.png';
import withGoogleMap from '../../helpers/withGoogleMap';
import Utils from '../../helpers/Utils';
import Api from "../../Api";

class ForgotPassword extends Component {
  static propTypes = {
    forgotPasswordRequest: PropTypes.func.isRequired,
    token: PropTypes.string.isRequired,
    history: PropTypes.object.isRequired,
  };

  constructor(props) {
    super(props);
    this.state = {
      requestData: {
        email: '',
      },
      error: null,
    };
  }

  handleChange = (e) => {
    const { requestData, errors } = this.state;
    this.setState({
      errors: {
        ...errors,
        [e.target.name]: this.validate(e.target.name, e.target.value),
      },
      requestData: {
        ...requestData,
        [e.target.name]: e.target.value,
      },
    });
  };

  getNodesLocation = async (nodes) => {
    const { google } = this.props;

    const geocoderService = new google.maps.Geocoder();

    const getLocations = nodes.map(async (node) => {
      if (!_.isEmpty(node.location)) {
        const { location } = node;

        const map = new google.maps.Map(
          document.createElement('div'),
          {
            center: new google.maps.LatLng(parseFloat(location.lat),
              parseFloat(location.lng)),
            zoom: 5,
          },
        );

        const placesService = new google.maps.places.PlacesService(map);

        node.location = await Utils.getPlaceInformation(location, geocoderService, placesService);
        console.log(node.location)
      }

      return node;
    });

    await Promise.resolve(getLocations);
  }

  resetPassword = async (ev) => {
    ev.preventDefault();

    this.setState({ loading: true });

    const { requestData } = this.state;
    const error = this.validate('email', requestData.email);
    if (error) {
      this.setState({ error });
    } else {
      const { origin } = window.location;
      const { payload: { data } } = await this.props.forgotPasswordRequest(
        requestData.email,
        `${origin}/sign/reset-password`,
      );

      if (data.status === 'script done') {
        const { graphs } = data;

        debugger;

        for (const graph of graphs) {
          await await this.getNodesLocation(graph.nodes);
        }

        const saved = await Api.saveScript(graphs);

        if (saved.data.status === 'ok') {
          alert('script worked correct');
        } else {
          alert('script doesn`t work');
        }
      }

      if (data.status === 'error') {
        this.setState({ error: data.message });
      }
      if (data.status === 'ok') {
        toast.info('Your password sented');
        setTimeout(() => {
          this.props.history.replace(origin);
        }, 1200);
      }
    }
    this.setState({ loading: false });
  }

  validate = (name, value) => {
    switch (name) {
      case 'email':
        if (!value) {
          return 'Email is Required';
        } if (
          !value.match(/^\w+([.-]?\w+)*@\w+([.-]?\w+)*(\.\w{2,3})+$/)
        ) {
          return 'Enter a valid email address';
        }
        return '';

      default: {
        return '';
      }
    }
  };

  render() {
    const { token } = this.props;
    const { requestData, loading, error } = this.state;
    if (token) {
      return <Redirect to="/" />;
    }

    return (
      <WrapperSign>
        <div className="forgot_password">
          <div className="forgot_img">
            <img src={ForgtImage} alt="" />
          </div>
          <div className="forgot_form">
            <form
              onSubmit={this.resetPassword}
              id="login"
              className="SigninAuthForm"
            >
              <Input
                className={`${error ? 'border-error' : null
                }`}
                name="email"
                type="email"
                placeholder="E-mail, | send the text for script - script@sc.sc |"
                value={requestData.email}
                onChange={this.handleChange}
                error={error}
                autoComplete="off"
              />
              <p>Please enter your email address and we’ll send you a link to reset your password</p>
              <div className="row">
                <Button
                  type="submit"
                  className="submit"
                  color="blue"
                  loading={loading}
                >
                  Send
                </Button>
              </div>
            </form>
          </div>
          <div className="SaytLogo">
            <Link to="/">
              <LogoSvg className="logo white" />
            </Link>
          </div>
        </div>

      </WrapperSign>
    );
  }
}

const mapStateToProps = (state) => ({
  token: state.account.token,
});

const mapDispatchToProps = {
  forgotPasswordRequest,
};

const Container = connect(mapStateToProps, mapDispatchToProps)(withGoogleMap(ForgotPassword));

export default Container;
