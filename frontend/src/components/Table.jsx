import React, { useState, useRef, useEffect } from 'react';
import Skeleton, { SkeletonRow } from './Skeleton';

/**
 * @typedef {Object} Column
 * @property {string} key - The key to access the data value
 * @property {string} header - The column header text
 * @property {function} [render] - Optional custom render function (row) => ReactNode
 */

/**
 * @typedef {Object} TableProps
 * @property {Column[]} columns - Array of column definitions
 * @property {Object[]} data - Array of data objects
 * @property {function} [onSort] - Sort callback (key, direction) => void
 * @property {string} [sortKey] - Currently sorted column key
 * @property {'asc'|'desc'} [sortDirection] - Current sort direction
 * @property {number} [currentPage] - Current page number (1-indexed)
 * @property {number} [totalPages] - Total number of pages
 * @property {function} [onPageChange] - Page change callback (page) => void
 * @property {number} [pageSize] - Items per page (default 10)
 * @property {string} [emptyMessage] - Message to show when no data
 * @property {boolean} [loading] - Show skeleton loading state
 * @property {number} [skeletonRows] - Number of skeleton rows to show when loading (default 5)
 */

/**
 * Data table component with sorting, pagination, skeleton loading, and keyboard navigation
 * @param {TableProps} props
 */
const Table = ({
  columns,
  data,
  onSort,
  sortKey,
  sortDirection,
  currentPage = 1,
  totalPages = 1,
  onPageChange,
  emptyMessage = 'Tidak ada data',
  loading = false,
  skeletonRows = 5
}) => {
  const [focusedRowIndex, setFocusedRowIndex] = useState(-1);
  const tableRef = useRef(null);

  // Keyboard navigation handler
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (loading || data.length === 0) return;

      const visibleData = data;

      switch (e.key) {
        case 'ArrowDown':
          e.preventDefault();
          setFocusedRowIndex((prev) =>
            prev < visibleData.length - 1 ? prev + 1 : prev
          );
          break;
        case 'ArrowUp':
          e.preventDefault();
          setFocusedRowIndex((prev) => (prev > 0 ? prev - 1 : prev));
          break;
        case 'Home':
          e.preventDefault();
          setFocusedRowIndex(0);
          break;
        case 'End':
          e.preventDefault();
          setFocusedRowIndex(visibleData.length - 1);
          break;
        default:
          break;
      }
    };

    const tableElement = tableRef.current;
    if (tableElement) {
      tableElement.addEventListener('keydown', handleKeyDown);
      return () => tableElement.removeEventListener('keydown', handleKeyDown);
    }
  }, [loading, data]);

  // Scroll focused row into view
  useEffect(() => {
    if (focusedRowIndex >= 0) {
      const row = tableRef.current?.querySelector(`tr[data-row-index="${focusedRowIndex}"]`);
      row?.scrollIntoView({ block: 'nearest', behavior: 'smooth' });
    }
  }, [focusedRowIndex]);

  const renderSortIcon = (key) => {
    if (sortKey !== key) {
      return <span style={{ opacity: 0.3, marginLeft: '0.5rem' }}>▲▼</span>;
    }
    return (
      <span style={{ marginLeft: '0.5rem' }}>
        {sortDirection === 'asc' ? '▲' : '▼'}
      </span>
    );
  };

  const handleSort = (key) => {
    if (!onSort) return;
    const newDirection = sortKey === key && sortDirection === 'asc' ? 'desc' : 'asc';
    onSort(key, newDirection);
  };

  const renderPageNumbers = () => {
    const pages = [];
    const maxVisible = 5;
    let start = Math.max(1, currentPage - Math.floor(maxVisible / 2));
    let end = Math.min(totalPages, start + maxVisible - 1);

    if (end - start < maxVisible - 1) {
      start = Math.max(1, end - maxVisible + 1);
    }

    for (let i = start; i <= end; i++) {
      pages.push(
        <button
          key={i}
          onClick={() => onPageChange?.(i)}
          style={{
            padding: '0.5rem 0.75rem',
            border: '1px solid #ced4da',
            background: i === currentPage ? 'var(--primary)' : 'white',
            color: i === currentPage ? 'white' : 'var(--text-main)',
            borderRadius: 'var(--radius-sm)',
            cursor: 'pointer',
            margin: '0 0.25rem',
            minWidth: '40px'
          }}
        >
          {i}
        </button>
      );
    }
    return pages;
  };

  // Render skeleton loading state
  const renderSkeletonBody = () => (
    <>
      {Array.from({ length: skeletonRows }, (_, i) => (
        <SkeletonRow key={i} columns={columns.length} />
      ))}
    </>
  );

  return (
    <div>
      <table
        ref={tableRef}
        className="data-table"
        role="grid"
        aria-busy={loading}
      >
        <thead>
          <tr>
            {columns.map((col) => (
              <th
                key={col.key}
                onClick={() => col.render ? undefined : handleSort(col.key)}
                style={{ cursor: col.render ? 'default' : 'pointer' }}
              >
                {col.header}
                {col.render ? null : onSort ? renderSortIcon(col.key) : null}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {loading ? (
            renderSkeletonBody()
          ) : data.length === 0 ? (
            <tr>
              <td
                colSpan={columns.length}
                style={{ textAlign: 'center', padding: '2rem', color: 'var(--text-muted)' }}
              >
                {emptyMessage}
              </td>
            </tr>
          ) : (
            data.map((row, rowIndex) => (
              <tr
                key={rowIndex}
                data-row-index={rowIndex}
                tabIndex={focusedRowIndex === rowIndex ? 0 : -1}
                style={{
                  backgroundColor: focusedRowIndex === rowIndex ? '#e9ecef' : undefined,
                  outline: focusedRowIndex === rowIndex ? '2px solid var(--primary)' : 'none',
                  outlineOffset: '-2px'
                }}
                onFocus={() => setFocusedRowIndex(rowIndex)}
              >
                {columns.map((col) => (
                  <td key={col.key}>
                    {col.render ? col.render(row) : row[col.key]}
                  </td>
                ))}
              </tr>
            ))
          )}
        </tbody>
      </table>

      {totalPages > 1 && (
        <div
          style={{
            display: 'flex',
            justifyContent: 'center',
            alignItems: 'center',
            gap: '0.5rem',
            marginTop: '1.5rem'
          }}
        >
          <button
            onClick={() => onPageChange?.(currentPage - 1)}
            disabled={currentPage === 1}
            style={{
              padding: '0.5rem 1rem',
              border: '1px solid #ced4da',
              background: 'white',
              borderRadius: 'var(--radius-sm)',
              cursor: currentPage === 1 ? 'not-allowed' : 'pointer',
              opacity: currentPage === 1 ? 0.5 : 1,
              color: 'var(--text-main)'
            }}
          >
            Previous
          </button>

          {renderPageNumbers()}

          <button
            onClick={() => onPageChange?.(currentPage + 1)}
            disabled={currentPage === totalPages}
            style={{
              padding: '0.5rem 1rem',
              border: '1px solid #ced4da',
              background: 'white',
              borderRadius: 'var(--radius-sm)',
              cursor: currentPage === totalPages ? 'not-allowed' : 'pointer',
              opacity: currentPage === totalPages ? 0.5 : 1,
              color: 'var(--text-main)'
            }}
          >
            Next
          </button>
        </div>
      )}
    </div>
  );
};

export default Table;
