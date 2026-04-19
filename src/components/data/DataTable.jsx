/**
 * DataTable Component
 * Generic reusable data table for displaying API data with sorting and filtering
 */

import React, { useMemo, useState } from 'react';
import { ChevronUp, ChevronDown } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/Card';
import { Badge } from '../ui/Badge';
import { useStatusColor } from '../../design-system/hooks';

/**
 * @component DataTable
 * @description Renders a sortable, filterable data table
 * 
 * @param {Object} props
 * @param {Array} props.data - Array of data objects
 * @param {Array} props.columns - Column definitions
 *   - Each column: { key, label, render?, sortable?, width?, align? }
 * @param {string} props.title - Table title
 * @param {string} props.variant - Card variant
 * @param {boolean} props.loading - Loading state
 * @param {Function} props.onRowClick - Row click handler
 * @param {string} props.className - Additional CSS classes
 * @returns {React.ReactElement}
 */
export const DataTable = ({
  data = [],
  columns = [],
  title = 'Data Table',
  variant = 'cyan',
  loading = false,
  onRowClick,
  className = '',
}) => {
  const [sortKey, setSortKey] = useState(null);
  const [sortDirection, setSortDirection] = useState('asc');

  // Handle sorting
  const handleSort = (columnKey) => {
    if (sortKey === columnKey) {
      setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc');
    } else {
      setSortKey(columnKey);
      setSortDirection('asc');
    }
  };

  // Sort data
  const sortedData = useMemo(() => {
    if (!sortKey || data.length === 0) return data;

    const sorted = [...data].sort((a, b) => {
      const aVal = a[sortKey];
      const bVal = b[sortKey];

      if (aVal < bVal) return sortDirection === 'asc' ? -1 : 1;
      if (aVal > bVal) return sortDirection === 'asc' ? 1 : -1;
      return 0;
    });

    return sorted;
  }, [data, sortKey, sortDirection]);

  return (
    <Card variant={variant} className={`hover-lift ${className}`}>
      <CardHeader>
        <CardTitle>{title}</CardTitle>
      </CardHeader>

      <CardContent>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            {/* Table Header */}
            <thead>
              <tr className="border-b border-border-light">
                {columns.map((column) => (
                  <th
                    key={column.key}
                    className={`px-4 py-3 text-left font-semibold text-text-secondary hover:text-text-primary transition-colors ${
                      column.sortable ? 'cursor-pointer select-none' : ''
                    }`}
                    style={{ width: column.width }}
                    onClick={() =>
                      column.sortable && handleSort(column.key)
                    }
                  >
                    <div className="flex items-center gap-2">
                      <span>{column.label}</span>
                      {column.sortable && sortKey === column.key && (
                        <span className="flex-shrink-0">
                          {sortDirection === 'asc' ? (
                            <ChevronUp className="w-4 h-4" />
                          ) : (
                            <ChevronDown className="w-4 h-4" />
                          )}
                        </span>
                      )}
                    </div>
                  </th>
                ))}
              </tr>
            </thead>

            {/* Table Body */}
            <tbody>
              {loading ? (
                // Loading skeleton
                Array(5)
                  .fill(null)
                  .map((_, idx) => (
                    <tr
                      key={`row-skeleton-${idx}`}
                      className="border-b border-border-lighter hover:bg-hover/30 transition-colors animate-pulse"
                    >
                      {columns.map((column) => (
                        <td key={column.key} className="px-4 py-3">
                          <div className="h-4 bg-border-light rounded w-3/4"></div>
                        </td>
                      ))}
                    </tr>
                  ))
              ) : sortedData.length > 0 ? (
                // Render rows
                sortedData.map((row, idx) => (
                  <DataTableRow
                    key={row.id || idx}
                    row={row}
                    columns={columns}
                    onRowClick={onRowClick}
                  />
                ))
              ) : (
                // Empty state
                <tr>
                  <td colSpan={columns.length} className="px-4 py-12 text-center">
                    <p className="text-text-muted">No data available</p>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </CardContent>
    </Card>
  );
};

/**
 * Individual Table Row Component
 */
const DataTableRow = ({ row, columns, onRowClick }) => {
  return (
    <tr
      onClick={() => onRowClick?.(row)}
      className="border-b border-border-lighter hover:bg-hover/30 transition-colors cursor-pointer"
    >
      {columns.map((column) => {
        const value = row[column.key];
        const rendered = column.render
          ? column.render(value, row)
          : renderCellValue(value);

        return (
          <td
            key={column.key}
            className={`px-4 py-3 text-text-primary ${
              column.align === 'center' ? 'text-center' : ''
            }`}
            style={{ width: column.width }}
          >
            {rendered}
          </td>
        );
      })}
    </tr>
  );
};

/**
 * Default cell value renderer
 */
const renderCellValue = (value) => {
  if (value === null || value === undefined) {
    return <span className="text-text-muted opacity-50">-</span>;
  }

  if (typeof value === 'boolean') {
    return (
      <Badge variant={value ? 'green' : 'red'}>
        {value ? 'Yes' : 'No'}
      </Badge>
    );
  }

  if (typeof value === 'object') {
    return <code className="text-xs font-mono">{JSON.stringify(value)}</code>;
  }

  return String(value);
};

export default DataTable;
