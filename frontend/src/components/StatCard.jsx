const StatCard = ({ label, value, accent = 'default', helper }) => (
  <article className={`stat-card stat-card-${accent}`}>
    <p>{label}</p>
    <h3>{value}</h3>
    {helper ? <span>{helper}</span> : null}
  </article>
);

export default StatCard;
