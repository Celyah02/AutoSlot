import { useEffect, useState } from 'react';
import LoadingState from '../components/LoadingState';
import Pagination from '../components/Pagination';
import StatCard from '../components/StatCard';
import StatusBanner from '../components/StatusBanner';
import { useAuth } from '../hooks/useAuth';
import { getDefaultReportRange, formatDateTime } from '../lib/date';
import { formatCurrency, formatNumber } from '../lib/format';
import { getErrorMessage } from '../lib/api';

const tabs = [
  { id: 'exits', label: 'Exited Cars' },
  { id: 'entries', label: 'Entered Cars' },
  { id: 'revenue', label: 'Revenue' }
];

const ReportsPage = () => {
  const { authenticatedRequest } = useAuth();
  const [activeTab, setActiveTab] = useState('exits');
  const [filters, setFilters] = useState(getDefaultReportRange);
  const [status, setStatus] = useState({ type: 'info', message: '' });
  const [isLoading, setIsLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [reportData, setReportData] = useState(null);

  const buildQuery = (nextPage = page) => {
    const query = new URLSearchParams({
      startDateTime: new Date(filters.startDateTime).toISOString(),
      endDateTime: new Date(filters.endDateTime).toISOString()
    });

    if (filters.parkingCode?.trim()) {
      query.set('parkingCode', filters.parkingCode.trim().toUpperCase());
    }

    if (activeTab !== 'revenue') {
      query.set('page', String(nextPage));
      query.set('limit', '8');
    }

    return query.toString();
  };

  const loadReport = async (nextPage = page) => {
    setIsLoading(true);
    setStatus({ type: 'info', message: '' });

    const endpointByTab = {
      exits: '/api/reporting/exits',
      entries: '/api/reporting/entries',
      revenue: '/api/reporting/revenue'
    };

    try {
      const response = await authenticatedRequest(`${endpointByTab[activeTab]}?${buildQuery(nextPage)}`);
      setReportData(response);
    } catch (error) {
      setStatus({
        type: 'error',
        message: getErrorMessage(error, 'Unable to load report data.')
      });
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadReport(page);
  }, [activeTab, page]);

  const handleFilterChange = (event) => {
    const { name, value } = event.target;
    setFilters((currentValue) => ({
      ...currentValue,
      [name]: value
    }));
  };

  const handleApplyFilters = (event) => {
    event.preventDefault();
    setPage(1);
    loadReport(1);
  };

  const renderTable = () => {
    if (!reportData?.data?.length) {
      return (
        <div className="empty-state compact">
          <h3>No report data yet</h3>
          <p>Adjust the date range or parking code to explore operational activity.</p>
        </div>
      );
    }

    if (activeTab === 'entries') {
      return (
        <div className="table-wrapper">
          <table>
            <thead>
              <tr>
                <th>Plate</th>
                <th>Parking</th>
                <th>Entry Time</th>
                <th>Status</th>
                <th>Ticket</th>
              </tr>
            </thead>
            <tbody>
              {reportData.data.map((item) => (
                <tr key={item.entryId}>
                  <td>{item.plateNumber}</td>
                  <td>{item.parkingCode}</td>
                  <td>{formatDateTime(item.entryDateTime)}</td>
                  <td>{item.exitDateTime ? 'Completed' : 'Active'}</td>
                  <td>{item.ticket?.ticketNumber || '--'}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      );
    }

    return (
      <div className="table-wrapper">
        <table>
          <thead>
            <tr>
              <th>Plate</th>
              <th>Parking</th>
              <th>Entry Time</th>
              <th>Exit Time</th>
              <th>Amount</th>
            </tr>
          </thead>
          <tbody>
            {reportData.data.map((item) => (
              <tr key={item.entryId}>
                <td>{item.plateNumber}</td>
                <td>{item.parkingCode}</td>
                <td>{formatDateTime(item.entryDateTime)}</td>
                <td>{formatDateTime(item.exitDateTime)}</td>
                <td>{formatCurrency(item.chargedAmount)}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    );
  };

  const renderSummaryCards = () => {
    if (!reportData?.summary) {
      return null;
    }

    if (activeTab === 'entries') {
      return (
        <section className="stats-grid">
          <StatCard label="Total Entered Cars" value={formatNumber(reportData.summary.totalEnteredCars)} accent="primary" />
          <StatCard label="Active Entries" value={formatNumber(reportData.summary.activeEntries)} accent="success" />
          <StatCard label="Completed Entries" value={formatNumber(reportData.summary.completedEntries)} accent="default" />
        </section>
      );
    }

    if (activeTab === 'exits') {
      return (
        <section className="stats-grid">
          <StatCard label="Total Exited Cars" value={formatNumber(reportData.summary.totalExitedCars)} accent="primary" />
          <StatCard label="Total Charged" value={formatCurrency(reportData.summary.totalAmountCharged)} accent="warning" />
          <StatCard label="Average Charge" value={formatCurrency(reportData.summary.averageAmountCharged)} accent="default" />
        </section>
      );
    }

    return (
      <section className="stats-grid">
        <StatCard label="Total Revenue" value={formatCurrency(reportData.summary.totalRevenue)} accent="warning" />
        <StatCard label="Exited Cars" value={formatNumber(reportData.summary.totalExitedCars)} accent="primary" />
        <StatCard label="Average Per Car" value={formatCurrency(reportData.summary.averageRevenuePerCar)} accent="default" />
        <StatCard label="Highest Charge" value={formatCurrency(reportData.summary.highestCharge)} accent="success" />
      </section>
    );
  };

  return (
    <div className="page-stack">
      <section className="section-heading">
        <div>
          <p className="eyebrow">Insights & Reporting</p>
          <h1>Reports</h1>
          <p>Analyze entries, exits, and revenue with date filters, parking filters, and paginated records.</p>
        </div>
      </section>

      <article className="card">
        <form className="filter-grid" onSubmit={handleApplyFilters}>
          <label>
            Start Date Time
            <input name="startDateTime" type="datetime-local" value={filters.startDateTime} onChange={handleFilterChange} />
          </label>
          <label>
            End Date Time
            <input name="endDateTime" type="datetime-local" value={filters.endDateTime} onChange={handleFilterChange} />
          </label>
          <label>
            Parking Code
            <input name="parkingCode" value={filters.parkingCode || ''} onChange={handleFilterChange} placeholder="Optional" />
          </label>
          <button type="submit" className="primary-button">Apply Filters</button>
        </form>

        <div className="tab-row">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              type="button"
              className={activeTab === tab.id ? 'tab-button active' : 'tab-button'}
              onClick={() => {
                setActiveTab(tab.id);
                setPage(1);
              }}
            >
              {tab.label}
            </button>
          ))}
        </div>
      </article>

      <StatusBanner type={status.type} message={status.message} />
      {renderSummaryCards()}

      <article className="card">
        <div className="section-heading">
          <div>
            <p className="eyebrow">Detailed Results</p>
            <h2>{tabs.find((item) => item.id === activeTab)?.label}</h2>
          </div>
        </div>

        {isLoading ? <LoadingState label="Loading report..." /> : activeTab === 'revenue' ? (
          <div className="table-wrapper">
            <table>
              <thead>
                <tr>
                  <th>Parking Code</th>
                  <th>Parking Name</th>
                  <th>Total Cars</th>
                  <th>Total Revenue</th>
                </tr>
              </thead>
              <tbody>
                {(reportData?.summary?.byParkingLocation || []).map((item) => (
                  <tr key={item.parkingCode}>
                    <td>{item.parkingCode}</td>
                    <td>{item.parkingName}</td>
                    <td>{formatNumber(item.totalCars)}</td>
                    <td>{formatCurrency(item.totalRevenue)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <>
            {renderTable()}
            <Pagination
              page={reportData?.pagination?.page}
              totalPages={reportData?.pagination?.totalPages}
              hasNextPage={reportData?.pagination?.hasNextPage}
              hasPreviousPage={reportData?.pagination?.hasPreviousPage}
              onPageChange={setPage}
            />
          </>
        )}
      </article>
    </div>
  );
};

export default ReportsPage;
