import React, { Component } from 'react';
import { ReactComponent as LogoSvg } from "../../assets/images/logo.svg";
import { ReactComponent as NotFound} from "../../assets/images/Found.svg";
import { ReactComponent as BackSvg } from '../../assets/images/icons/back.svg';
import Button from "../../components/form/Button";
import { withRouter, Link } from "react-router-dom";
class Page404 extends Component {
  render() {
    return (

      <div className="errorPages">
        <div>
              <Link to="/" className="logoWrapper permissionLogo">
                <LogoSvg  />
                
              </Link>
            
        </div>
        <div className="permission notFound">
         <Link to="/" className="backErrorPages">
              <Button icon={<BackSvg style={{ height: 30 }} />} className="transparent edit"   />
              Back
</Link>
         <NotFound className="notFoundSvg" />
        </div>
      </div>
    );
  }
}

export default Page404;
