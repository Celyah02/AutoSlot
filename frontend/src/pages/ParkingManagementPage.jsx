import { useEffect, useState } from 'react';
import Pagination from '../components/Pagination';
import LoadingState from '../components/LoadingState';
import StatCard from '../components/StatCard';
import StatusBanner from '../components/StatusBanner';
import { useAuth } from '../hooks/useAuth';
import { getErrorMessage, getFieldErrors } from '../lib/api';
import { formatCurrency, formatNumber } from '../lib/format';

const initialFormState = {
  code: '',
  parkingName: '',
  numberOfAvailableSpaces: '',
  location: '',
  chargingFeePerHour: ''
};

const ParkingManagementPage = () => {
  const { authenticatedRequest } = useAuth();
  const [parkingResponse, setParkingResponse] = useState({ data: [], pagination: null });
  const [formData, setFormData] = useState(initialFormState);
  const [fieldErrors, setFieldErrors] = useState({});
  const [status, setStatus] = useState({ type: 'info', message: '' });
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [page, setPage] = useState(1);

  const loadParking = async (nextPage = page) => {
    setIsLoading(true);

    try {
      const response = await authenticatedRequest(`/api/parking?page=${nextPage}&limit=8`);
      setParkingResponse({
        data: response.data || [],
        pagination: response.pagination
      });
    } catch (error) {
      setStatus({
        type: 'error',
        message: getErrorMessage(error, 'Unable to load parking locations.')
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

    try {
      const response = await authenticatedRequest('/api/parking', {
        method: 'POST',
        body: {
          ...formData,
          numberOfAvailableSpaces: Number(formData.numberOfAvailableSpaces),
          chargingFeePerHour: Number(formData.chargingFeePerHour)
        }
      });

      setStatus({
        type: 'success',
        message: response.message
      });
      setFormData(initialFormState);
      setPage(1);
      await loadParking(1);
    } catch (error) {
      setFieldErrors(getFieldErrors(error));
      setStatus({
        type: 'error',
        message: getErrorMessage(error, 'Unable to create parking location.')
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const totalAvailable = parkingResponse.data.reduce(
    (total, item) => total + item.numberOfAvailableSpaces,
    0
  );
  const totalCapacity = parkingResponse.data.reduce((total, item) => total + item.totalSpaces, 0);

  return (
    <div className="page-stack">
      <section className="section-heading">
        <div>
          <p className="eyebrow">Admin Workspace</p>
          <h1>Parking management</h1>
          <p>Create locations, monitor capacity, and keep fee settings organized.</p>
        </div>
      </section>

      <StatusBanner type={status.type} message={status.message} />

      <section className="stats-grid">
        <StatCard label="Visible Locations" value={formatNumber(parkingResponse.pagination?.totalItems)} accent="primary" />
        <StatCard label="Page Capacity" value={formatNumber(totalCapacity)} accent="success" />
        <StatCard label="Available Spaces" value={formatNumber(totalAvailable)} accent="default" />
      </section>

      <section className="content-grid two-column">
        <article className="card">
          <div className="section-heading">
            <div>
              <p className="eyebrow">Create New</p>
              <h2>Add parking location</h2>
            </div>
          </div>

          <form className="form-grid" onSubmit={handleSubmit}>
            <label>
              Code
              <input name="code" value={formData.code} onChange={handleChange} placeholder="KGL001" />
              {fieldErrors.code ? <small>{fieldErrors.code}</small> : null}
            </label>

            <label>
              Parking Name
              <input name="parkingName" value={formData.parkingName} onChange={handleChange} placeholder="City Center Deck" />
              {fieldErrors.parkingName ? <small>{fieldErrors.parkingName}</small> : null}
            </label>

            <label>
              Available Spaces
              <input
                name="numberOfAvailableSpaces"
                type="number"
                value={formData.numberOfAvailableSpaces}
                onChange={handleChange}
                placeholder="120"
              />
              {fieldErrors.numberOfAvailableSpaces ? <small>{fieldErrors.numberOfAvailableSpaces}</small> : null}
            </label>

            <label>
              Fee Per Hour
              <input
                name="chargingFeePerHour"
                type="number"
                step="0.01"
                value={formData.chargingFeePerHour}
                onChange={handleChange}
                placeholder="2.50"
              />
              {fieldErrors.chargingFeePerHour ? <small>{fieldErrors.chargingFeePerHour}</small> : null}
            </label>

            <label className="full-span">
              Location
              <input name="location" value={formData.location} onChange={handleChange} placeholder="Downtown Kigali" />
              {fieldErrors.location ? <small>{fieldErrors.location}</small> : null}
            </label>

            <button type="submit" className="primary-button full-span" disabled={isSubmitting}>
              {isSubmitting ? 'Saving Location...' : 'Create Parking'}
            </button>
          </form>
        </article>

        <article className="card">
          <div className="section-heading">
            <div>
              <p className="eyebrow">Location List</p>
              <h2>Registered parking spaces</h2>
            </div>
          </div>

          {isLoading ? (
            <LoadingState label="Loading parking list..." />
          ) : (
            <>
              <div className="table-wrapper">
                <table>
                  <thead>
                    <tr>
                      <th>Code</th>
                      <th>Name</th>
                      <th>Availability</th>
                      <th>Location</th>
                      <th>Fee</th>
                    </tr>
                  </thead>
                  <tbody>
                    {parkingResponse.data.map((item) => (
                      <tr key={item.code}>
                        <td>{item.code}</td>
                        <td>{item.parkingName}</td>
                        <td>
                          {item.numberOfAvailableSpaces} / {item.totalSpaces}
                        </td>
                        <td>{item.location}</td>
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

export default ParkingManagementPage;
