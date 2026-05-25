import { useEffect, useState } from 'react';
import LoadingState from '../components/LoadingState';
import Pagination from '../components/Pagination';
import StatusBanner from '../components/StatusBanner';
import { useAuth } from '../hooks/useAuth';
import { getErrorMessage, getFieldErrors } from '../lib/api';
import { formatCurrency } from '../lib/format';

const CarEntryPage = () => {
  const { authenticatedRequest } = useAuth();
  const [formData, setFormData] = useState({
    plateNumber: '',
    parkingCode: ''
  });
  const [parkingResponse, setParkingResponse] = useState({ data: [], pagination: null });
  const [fieldErrors, setFieldErrors] = useState({});
  const [status, setStatus] = useState({ type: 'info', message: '' });
  const [successPayload, setSuccessPayload] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [page, setPage] = useState(1);

  const loadParking = async (nextPage = page) => {
    setIsLoading(true);

    try {
      const response = await authenticatedRequest(`/api/parking?page=${nextPage}&limit=6`);
      setParkingResponse({
        data: response.data || [],
        pagination: response.pagination
      });
    } catch (error) {
      setStatus({
        type: 'error',
        message: getErrorMessage(error, 'Unable to load parking availability.')
      });
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadParking(page);
  }, [page]);

  const handleChange = (event) => {
    const { name, value } = event.target;
    setFormData((currentValue) => ({
      ...currentValue,
      [name]: value
    }));
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    setIsSubmitting(true);
    setFieldErrors({});
    setStatus({ type: 'info', message: '' });
    setSuccessPayload(null);

    try {
      const response = await authenticatedRequest('/api/entry/entries', {
        method: 'POST',
        body: formData
      });

      setStatus({
        type: 'success',
        message: response.message
      });
      setSuccessPayload(response);
      setFormData({
        plateNumber: '',
        parkingCode: ''
      });
      await loadParking(page);
    } catch (error) {
      setFieldErrors(getFieldErrors(error));
      setStatus({
        type: 'error',
        message: getErrorMessage(error, 'Unable to register car entry.')
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="page-stack">
      <section className="section-heading">
        <div>
          <p className="eyebrow">Vehicle Intake</p>
          <h1>Car entry</h1>
          <p>Register incoming vehicles quickly and issue a ticket without leaving the flow.</p>
        </div>
      </section>

      <StatusBanner type={status.type} message={status.message} />

      <section className="content-grid two-column">
        <article className="card">
          <div className="section-heading">
            <div>
              <p className="eyebrow">Entry Form</p>
              <h2>Record a new arrival</h2>
            </div>
          </div>

          <form className="form-grid" onSubmit={handleSubmit}>
            <label className="full-span">
              Plate Number
              <input name="plateNumber" value={formData.plateNumber} onChange={handleChange} placeholder="RAB123A" />
              {fieldErrors.plateNumber ? <small>{fieldErrors.plateNumber}</small> : null}
            </label>

            <label className="full-span">
              Parking Code
              <input name="parkingCode" value={formData.parkingCode} onChange={handleChange} placeholder="KGL001" />
              {fieldErrors.parkingCode ? <small>{fieldErrors.parkingCode}</small> : null}
            </label>

            <button type="submit" className="primary-button full-span" disabled={isSubmitting}>
              {isSubmitting ? 'Registering Entry...' : 'Register Entry'}
            </button>
          </form>

          {successPayload ? (
            <div className="result-card success-outline">
              <h3>Ticket issued</h3>
              <p>Ticket Number: {successPayload.ticket.ticketNumber}</p>
              <p>Parking Code: {successPayload.entry.parkingCode}</p>
              <p>Plate Number: {successPayload.entry.plateNumber}</p>
            </div>
          ) : null}
        </article>

        <article className="card">
          <div className="section-heading">
            <div>
              <p className="eyebrow">Availability</p>
              <h2>Parking spaces</h2>
            </div>
          </div>

          {isLoading ? (
            <LoadingState label="Loading availability..." />
          ) : (
            <>
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
                    {parkingResponse.data.map((item) => (
                      <tr key={item.code}>
                        <td>{item.code}</td>
                        <td>{item.parkingName}</td>
                        <td>{item.numberOfAvailableSpaces}</td>
                        <td>{formatCurrency(item.chargingFeePerHour)}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              <Pagination
                page={parkingResponse.pagination?.page}
                totalPages={parkingResponse.pagination?.totalPages}
                hasNextPage={parkingResponse.pagination?.hasNextPage}
                hasPreviousPage={parkingResponse.pagination?.hasPreviousPage}
                onPageChange={setPage}
              />
            </>
          )}
        </article>
      </section>
    </div>
  );
};

export default CarEntryPage;
