import React from 'react';

interface Column<T> {
  key: string;
  title: string;
  render?: (row: T, index: number) => React.ReactNode;
  width?: string;
  align?: 'left' | 'center' | 'right';
}

interface TableProps<T> {
  columns: Column<T>[];
  data: T[];
  emptyText?: string;
  loading?: boolean;
}

export function Table<T>({
  columns,
  data,
  emptyText = 'No records found.',
  loading = false
}: TableProps<T>) {
  const tableContainerStyle: React.CSSProperties = {
    width: '100%',
    overflowX: 'auto',
    borderRadius: 'var(--radius-sm)',
    border: '1px solid var(--border-color)',
    backgroundColor: 'var(--bg-secondary)'
  };

  const tableStyle: React.CSSProperties = {
    width: '100%',
    borderCollapse: 'collapse',
    fontSize: '13px',
    textAlign: 'left'
  };

  const thStyle = (column: Column<T>): React.CSSProperties => ({
    padding: '12px 16px',
    fontWeight: 600,
    color: 'var(--text-secondary)',
    borderBottom: '1px solid var(--border-color)',
    backgroundColor: 'var(--bg-tertiary)',
    textAlign: column.align || 'left',
    width: column.width,
    whiteSpace: 'nowrap'
  });

  const tdStyle = (column: Column<T>): React.CSSProperties => ({
    padding: '12px 16px',
    color: 'var(--text-primary)',
    borderBottom: '1px solid var(--border-color)',
    textAlign: column.align || 'left',
    verticalAlign: 'middle',
    whiteSpace: 'nowrap'
  });

  return (
    <div className="premium-table-container" style={tableContainerStyle}>
      <table style={tableStyle}>
        <thead>
          <tr>
            {columns.map((col, idx) => (
              <th key={col.key || idx} style={thStyle(col)}>
                {col.title}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {loading ? (
            <tr>
              <td colSpan={columns.length} style={{ textAlign: 'center', padding: '32px', color: 'var(--text-secondary)' }}>
                <span className="pulse-soft">Loading records...</span>
              </td>
            </tr>
          ) : data.length === 0 ? (
            <tr>
              <td colSpan={columns.length} style={{ textAlign: 'center', padding: '32px', color: 'var(--text-secondary)', fontStyle: 'italic' }}>
                {emptyText}
              </td>
            </tr>
          ) : (
            data.map((row, rIdx) => (
              <tr key={rIdx} className="table-row">
                {columns.map((col, cIdx) => (
                  <td key={col.key || cIdx} style={tdStyle(col)}>
                    {col.render ? col.render(row, rIdx) : (row as any)[col.key]}
                  </td>
                ))}
              </tr>
            ))
          )}
        </tbody>
      </table>
      <style>{`
        .table-row {
          transition: background-color var(--transition-fast);
        }
        .table-row:hover {
          background-color: var(--bg-tertiary);
        }
        .table-row:last-child td {
          border-bottom: none;
        }
      `}</style>
    </div>
  );
}
