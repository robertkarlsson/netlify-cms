import PropTypes from 'prop-types';
import React from 'react';
import NetlifyAuthenticator from 'Lib/netlify-auth';
import ImplicitAuthenticator from 'Lib/implicit-oauth';
import { Icon } from 'UI';

export default class AuthenticationPage extends React.Component {
  static propTypes = {
    onLogin: PropTypes.func.isRequired,
    inProgress: PropTypes.bool,
  };

  state = {};

  componentDidMount() {
    const authType = this.props.config.getIn(['backend', 'auth_type']);
    if (authType === "implicit") {
      this.auth = new ImplicitAuthenticator({
        auth_url: this.props.config.getIn(['backend', 'auth_url'], 'https://gitlab.com/oauth/authorize'),
        appid: this.props.config.getIn(['backend', 'appid']),
      });
      // Complete implicit authentication if we were redirected back to from the provider.
      this.auth.completeAuth((err, data) => {
        if (err) {
          this.setState({ loginError: err.toString() });
          return;
        }
        this.props.onLogin(data);
      });
    } else {
      this.auth = new NetlifyAuthenticator({
        base_url: this.props.base_url,
        site_id: (document.location.host.split(':')[0] === 'localhost') ? 'cms.netlify.com' : this.props.siteId
      });
    }
  }

  handleLogin = (e) => {
    e.preventDefault();
    this.auth.authenticate({ provider: 'gitlab', scope: 'api read_user' }, (err, data) => {
      if (err) {
        this.setState({ loginError: err.toString() });
        return;
      }
      this.props.onLogin(data);
    });
  };

  render() {
    const { loginError } = this.state;
    const { inProgress } = this.props;

    return (
      <section className="nc-githubAuthenticationPage-root">
        <Icon className="nc-githubAuthenticationPage-logo" size="500px" type="netlify-cms"/>
        {loginError && <p>{loginError}</p>}
        <button
          className="nc-githubAuthenticationPage-button"
          disabled={inProgress}
          onClick={this.handleLogin}
        >
          <Icon type="gitlab" /> {inProgress ? "Logging in..." : "Login with GitLab"}
        </button>
      </section>
    );
  }
}
