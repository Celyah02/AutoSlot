import { useEffect, useState } from 'react';
import LoadingState from '../components/LoadingState';
import StatCard from '../components/StatCard';
import StatusBanner from '../components/StatusBanner';
import { useAuth } from '../hooks/useAuth';
import { getDefaultReportRange } from '../lib/date';
import { formatCurrency, formatNumber, titleCaseRole } from '../lib/format';
import { getErrorMessage } from '../lib/api';

const DashboardPage = () => {
  const { authenticatedRequest, user } = useAuth();
  const [data, setData] = useState(null);
  const [status, setStatus] = useState({ type: 'info', message: '' });
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const loadDashboard = async () => {
      setIsLoading(true);
      setStatus({ type: 'info', message: '' });

      try {
        const range = getDefaultReportRange();
        const [parkingResponse, revenueResponse, entriesResponse, exitsResponse] = await Promise.all([
          authenticatedRequest('/api/parking?page=1&limit=6'),
          authenticatedRequest(
            `/api/reporting/revenue?startDateTime=${encodeURIComponent(new Date(range.startDateTime).toISOString())}&endDateTime=${encodeURIComponent(new Date(range.endDateTime).toISOString())}`
          ),
          authenticatedRequest(
            `/api/reporting/entries?startDateTime=${encodeURIComponent(new Date(range.startDateTime).toISOString())}&endDateTime=${encodeURIComponent(new Date(range.endDateTime).toISOString())}&page=1&limit=5`
          ),
          authenticatedRequest(
            `/api/reporting/exits?startDateTime=${encodeURIComponent(new Date(range.startDateTime).toISOString())}&endDateTime=${encodeURIComponent(new Date(range.endDateTime).toISOString())}&page=1&limit=5`
          )
        ]);

        const parkingList = parkingResponse.data || [];
        const totalCapacity = parkingList.reduce((total, item) => total + item.totalSpaces, 0);
        const totalAvailable = parkingList.reduce((total, item) => total + item.numberOfAvailableSpaces, 0);

        setData({
          parkingList,
          totalCapacity,
          totalAvailable,
          revenueSummary: revenueResponse.summary,
          entriesSummary: entriesResponse.summary,
          recentExits: exitsResponse.data || []
        });
      } catch (error) {
        setStatus({
          type: 'error',
          message: getErrorMessage(error, 'Unable to load dashboard data right now.')
        });
      } finally {
        setIsLoading(false);
      }
    };

    loadDashboard();
  }, []);

  if (isLoading) {
    return <LoadingState label="Loading dashboard..." />;
  }

  const occupancyRate =
    data?.totalCapacity > 0 ? ((data.totalCapacity - data.totalAvailable) / data.totalCapacity) * 100 : 0;

  return (
    <div className="page-stack">
      <section className="hero-card">
        <div>
          <p className="eyebrow">Role Overview</p>
          <h1>{titleCaseRole(user?.role)} dashboard</h1>
          <p>
            {user?.role === 'admin'
              ? 'Monitor revenue, supervise locations, and keep the entire parking network running smoothly.'
              : 'Process vehicle movement quickly, check availability, and keep attendants moving with clarity.'}
          </p>
        </div>
        <div className="hero-chip-group">
          <span className="hero-chip">JWT Protected</span>
          <span className="hero-chip">Live API Data</span>
          <span className="hero-chip">Responsive Workflow</span>
        </div>
      </section>

      <StatusBanner type={status.type} message={status.message} />

      <section className="stats-grid">
        <StatCard label="Visible Capacity" value={formatNumber(data?.totalCapacity)} accent="primary" helper="Across visible locations" />
        <StatCard label="Available Spaces" value={formatNumber(data?.totalAvailable)} accent="success" helper={`${occupancyRate.toFixed(1)}% occupied`} />
        <StatCard label="Monthly Revenue" value={formatCurrency(data?.revenueSummary?.totalRevenue)} accent="warning" helper="Selected current-month range" />
        <StatCard label="Entries This Month" value={formatNumber(data?.entriesSummary?.totalEnteredCars)} accent="default" helper="Recent movement snapshot" />
      </section>

      <section className="content-grid">
        <article className="card">
          <div className="section-heading">
            <div>
              <p className="eyebrow">Parking Snapshot</p>
              <h2>Location performance</h2>
            </div>
          </div>

          <div className="table-wrapper">
            <table>
              <thead>
                <tr>
                  <th>Code</th>
                  <th>Name</th>
                  <th>Available</th>
                  <th>Fee / Hour</th>
                </tr>
              </thead>
              <tbody>
                {data?.parkingList?.map((item) => (
                  <tr key={item.code}>
                    <td>{item.code}</td>
                    <td>{item.parkingName}</td>
                    <td>
                      {item.numberOfAvailableSpaces} / {item.totalSpaces}
                    </td>
                    <td>{formatCurrency(item.chargingFeePerHour)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </article>

        <article className="card">
          <div className="section-heading">
            <div>
              <p className="eyebrow">Operational Feed</p>
              <h2>Recent exits</h2>
            </div>
          </div>

          <div className="feed-list">
            {(data?.recentExits || []).map((item) => (
              <div className="feed-item" key={item.entryId}>
                <div>
                  <strong>{item.plateNumber}</strong>
                  <p>{item.parkingName}</p>
                </div>
                <div className="feed-meta">
                  <span>{formatCurrency(item.chargedAmount)}</span>
                  <small>{item.exitDateTime ? new Date(item.exitDateTime).toLocaleString() : '--'}</small>
                </div>
              </div>
            ))}
          </div>
        </article>
      </section>
    </div>
  );
};

export default DashboardPage;
