import { useState } from 'react';
import StatusBanner from '../components/StatusBanner';
import { useAuth } from '../hooks/useAuth';
import { formatCurrency } from '../lib/format';
import { formatDateTime } from '../lib/date';
import { getErrorMessage, getFieldErrors } from '../lib/api';

const CarExitPage = () => {
  const { authenticatedRequest } = useAuth();
  const [ticketNumber, setTicketNumber] = useState('');
  const [status, setStatus] = useState({ type: 'info', message: '' });
  const [fieldErrors, setFieldErrors] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [result, setResult] = useState(null);

  const handleSubmit = async (event) => {
    event.preventDefault();
    setIsSubmitting(true);
    setFieldErrors({});
    setStatus({ type: 'info', message: '' });
    setResult(null);

    try {
      const response = await authenticatedRequest('/api/entry/exits', {
        method: 'POST',
        body: {
          ticketNumber
        }
      });

      setStatus({
        type: 'success',
        message: response.message
      });
      setResult(response);
      setTicketNumber('');
    } catch (error) {
      setFieldErrors(getFieldErrors(error));
      setStatus({
        type: 'error',
        message: getErrorMessage(error, 'Unable to register car exit.')
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="page-stack">
      <section className="section-heading">
        <div>
          <p className="eyebrow">Vehicle Release</p>
          <h1>Car exit</h1>
          <p>Close a parking session, calculate billing, and return the updated status in one action.</p>
        </div>
      </section>

      <StatusBanner type={status.type} message={status.message} />

      <section className="content-grid two-column">
        <article className="card">
          <div className="section-heading">
            <div>
              <p className="eyebrow">Exit Form</p>
              <h2>Process a ticket</h2>
            </div>
          </div>

          <form className="form-grid" onSubmit={handleSubmit}>
            <label className="full-span">
              Ticket Number
              <input value={ticketNumber} onChange={(event) => setTicketNumber(event.target.value)} placeholder="TKT-KGL001-1-1715292000000" />
              {fieldErrors.ticketNumber ? <small>{fieldErrors.ticketNumber}</small> : null}
            </label>

            <button type="submit" className="primary-button full-span" disabled={isSubmitting}>
              {isSubmitting ? 'Processing Exit...' : 'Register Exit'}
            </button>
          </form>
        </article>

        <article className="card">
          <div className="section-heading">
            <div>
              <p className="eyebrow">Checkout Result</p>
              <h2>Billing summary</h2>
            </div>
          </div>

          {result ? (
            <div className="result-card success-outline">
              <div className="result-grid">
                <div>
                  <span>Plate Number</span>
                  <strong>{result.entry.plateNumber}</strong>
                </div>
                <div>
                  <span>Parking Code</span>
                  <strong>{result.entry.parkingCode}</strong>
                </div>
                <div>
                  <span>Entry Time</span>
                  <strong>{formatDateTime(result.entry.entryDateTime)}</strong>
                </div>
                <div>
                  <span>Exit Time</span>
                  <strong>{formatDateTime(result.entry.exitDateTime)}</strong>
                </div>
                <div>
                  <span>Duration</span>
                  <strong>{result.bill.durationMinutes} minutes</strong>
                </div>
                <div>
                  <span>Total Amount</span>
                  <strong>{formatCurrency(result.bill.totalAmount)}</strong>
                </div>
              </div>
            </div>
          ) : (
            <div className="empty-state compact">
              <h3>No exit processed yet</h3>
              <p>The billing summary will appear here after a successful ticket checkout.</p>
            </div>
          )}
        </article>
      </section>
    </div>
  );
};

export default CarExitPage;
