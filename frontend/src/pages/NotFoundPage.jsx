import { Link } from 'react-router-dom';

const NotFoundPage = () => (
  <div className="not-found-shell">
    <div className="card">
      <p className="eyebrow">404</p>
      <h1>Page not found</h1>
      <p>The page you requested does not exist in the parking workspace.</p>
      <Link to="/dashboard" className="primary-button inline-link-button">
        Back to Dashboard
      </Link>
    </div>
  </div>
);

export default NotFoundPage;
