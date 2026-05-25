import { Link } from 'react-router-dom';

const AuthLayout = ({ eyebrow, title, subtitle, alternateAction, children }) => (
  <div className="auth-shell">
    <div className="auth-backdrop auth-backdrop-one" />
    <div className="auth-backdrop auth-backdrop-two" />

    <section className="auth-hero">
      <div className="eyebrow">{eyebrow}</div>
      <h1>{title}</h1>
      <p>{subtitle}</p>
      <div className="auth-hero-panel">
        <span className="auth-badge">Secure Access</span>
        <span className="auth-badge">Role-Based Workflow</span>
        <span className="auth-badge">Live Parking Operations</span>
      </div>
    </section>

    <section className="auth-card-wrapper">
      <div className="auth-card">
        {children}
        {alternateAction ? (
          <p className="auth-switch">
            {alternateAction.label}{' '}
            <Link to={alternateAction.to}>{alternateAction.linkText}</Link>
          </p>
        ) : null}
      </div>
    </section>
  </div>
);

export default AuthLayout;
