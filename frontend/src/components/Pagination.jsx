const Pagination = ({ page, totalPages, hasNextPage, hasPreviousPage, onPageChange }) => {
  if (!totalPages) {
    return null;
  }

  return (
    <div className="pagination">
      <button type="button" className="ghost-button" disabled={!hasPreviousPage} onClick={() => onPageChange(page - 1)}>
        Previous
      </button>
      <span>
        Page {page} of {totalPages}
      </span>
      <button type="button" className="ghost-button" disabled={!hasNextPage} onClick={() => onPageChange(page + 1)}>
        Next
      </button>
    </div>
  );
};

export default Pagination;
