const LoadingState = ({ label = 'Loading...' }) => (
  <div className="card loading-card">
    <div className="loading-spinner" />
    <p>{label}</p>
  </div>
);

export default LoadingState;
