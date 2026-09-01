import React, { useState } from 'react';
import { ArrowUpDown, ChevronUp, ChevronDown } from 'lucide-react';

export interface ColumnDef<T> {
  key: string;
  header: string;
  width?: string;
  align?: 'left' | 'center' | 'right';
  render?: (item: T, index: number) => React.ReactNode;
  sortable?: boolean;
}

interface WinFormsDataGridViewProps<T> {
  id?: string;
  columns: ColumnDef<T>[];
  data: T[];
  keyExtractor: (item: T) => string;
  selectedId?: string | null;
  onRowSelect?: (item: T) => void;
  onRowDoubleClick?: (item: T) => void;
  emptyMessage?: string;
  className?: string;
  maxHeight?: string;
}

export function WinFormsDataGridView<T>({
  id,
  columns,
  data,
  keyExtractor,
  selectedId,
  onRowSelect,
  onRowDoubleClick,
  emptyMessage = 'No records found in current view.',
  className = '',
  maxHeight,
}: WinFormsDataGridViewProps<T>) {
  const [sortKey, setSortKey] = useState<string | null>(null);
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('asc');

  const handleHeaderClick = (col: ColumnDef<T>) => {
    if (col.sortable === false) return;
    if (sortKey === col.key) {
      setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc');
    } else {
      setSortKey(col.key);
      setSortOrder('asc');
    }
  };

  const sortedData = React.useMemo(() => {
    if (!sortKey) return data;
    return [...data].sort((a: any, b: any) => {
      const valA = a[sortKey];
      const valB = b[sortKey];
      if (valA === valB) return 0;
      if (valA === null || valA === undefined) return 1;
      if (valB === null || valB === undefined) return -1;
      if (typeof valA === 'number' && typeof valB === 'number') {
        return sortOrder === 'asc' ? valA - valB : valB - valA;
      }
      return sortOrder === 'asc'
        ? String(valA).localeCompare(String(valB))
        : String(valB).localeCompare(String(valA));
    });
  }, [data, sortKey, sortOrder]);

  return (
    <div
      id={id}
      className={`border border-[#CBD5E1] bg-white rounded-[2px] shadow-xs flex flex-col flex-1 min-h-0 overflow-hidden text-[12px] font-sans ${className}`}
    >
      {/* Table Container with scroll */}
      <div
        className="flex-1 min-h-0 overflow-x-auto overflow-y-auto bg-white"
        style={maxHeight ? { maxHeight } : undefined}
      >
        <table className="w-full border-collapse text-left select-none">
          <thead className="sticky top-0 z-10 bg-[#E2E8F0] border-b border-[#94A3B8] shadow-[0_1px_2px_rgba(0,0,0,0.05)]">
            <tr>
              {/* WinForms Row Indicator Column Header */}
              <th className="w-7 min-w-[28px] max-w-[28px] py-1.5 px-1 bg-[#CBD5E1] border-r border-[#94A3B8] text-center text-[#475569] font-normal text-[10px]">
                #
              </th>
              {columns.map((col) => {
                const isCurrentSort = sortKey === col.key;
                return (
                  <th
                    key={col.key}
                    onClick={() => handleHeaderClick(col)}
                    style={{ width: col.width }}
                    className={`py-1.5 px-3 border-r border-[#CBD5E1] font-semibold text-[#1E293B] text-[11px] whitespace-nowrap cursor-pointer hover:bg-[#CBD5E1] transition-colors ${
                      col.align === 'right'
                        ? 'text-right'
                        : col.align === 'center'
                        ? 'text-center'
                        : 'text-left'
                    }`}
                  >
                    <div
                      className={`flex items-center gap-1.5 ${
                        col.align === 'right'
                          ? 'justify-end'
                          : col.align === 'center'
                          ? 'justify-center'
                          : 'justify-start'
                      }`}
                    >
                      <span>{col.header}</span>
                      {col.sortable !== false && (
                        <span className="text-slate-400 inline-flex">
                          {isCurrentSort ? (
                            sortOrder === 'asc' ? (
                              <ChevronUp className="w-3 h-3 text-slate-700" />
                            ) : (
                              <ChevronDown className="w-3 h-3 text-slate-700" />
                            )
                          ) : (
                            <ArrowUpDown className="w-2.5 h-2.5 opacity-40 hover:opacity-100" />
                          )}
                        </span>
                      )}
                    </div>
                  </th>
                );
              })}
            </tr>
          </thead>
          <tbody className="divide-y divide-[#E2E8F0]">
            {sortedData.length === 0 ? (
              <tr>
                <td
                  colSpan={columns.length + 1}
                  className="text-center py-8 text-slate-500 italic bg-[#F8FAFC]"
                >
                  {emptyMessage}
                </td>
              </tr>
            ) : (
              sortedData.map((item, index) => {
                const key = keyExtractor(item);
                const isSelected = selectedId === key;
                return (
                  <tr
                    key={key}
                    onClick={() => onRowSelect?.(item)}
                    onDoubleClick={() => onRowDoubleClick?.(item)}
                    className={`cursor-pointer transition-colors duration-75 ${
                      isSelected
                        ? 'bg-[#E0E7FF] text-[#1E1B4B] font-medium border-y border-[#818CF8]'
                        : index % 2 === 1
                        ? 'bg-[#F8FAFC] hover:bg-[#F1F5F9]'
                        : 'bg-white hover:bg-[#F1F5F9]'
                    }`}
                  >
                    {/* Row Selector indicator */}
                    <td
                      className={`w-7 min-w-[28px] max-w-[28px] py-1.5 px-1 border-r border-[#CBD5E1] text-center text-[10px] ${
                        isSelected
                          ? 'bg-[#6366F1] text-white font-bold'
                          : 'bg-[#F1F5F9] text-[#64748B]'
                      }`}
                    >
                      {isSelected ? '▶' : index + 1}
                    </td>
                    {columns.map((col) => (
                      <td
                        key={col.key}
                        className={`py-1.5 px-3 border-r border-[#E2E8F0] whitespace-nowrap text-[#1E293B] ${
                          col.align === 'right'
                            ? 'text-right font-mono'
                            : col.align === 'center'
                            ? 'text-center'
                            : 'text-left'
                        }`}
                      >
                        {col.render
                          ? col.render(item, index)
                          : ((item as any)[col.key] ?? '-')}
                      </td>
                    ))}
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>

      {/* WinForms DataGridView Status Bar */}
      <div className="bg-[#F1F5F9] border-t border-[#CBD5E1] px-3 py-1 text-[11px] text-[#475569] flex items-center justify-between">
        <span>
          Total Records:{' '}
          <strong className="text-slate-900">{sortedData.length}</strong>
          {selectedId && ' • 1 record selected'}
        </span>
        <span className="text-slate-400 text-[10px]">
          Double-click any row to view full details
        </span>
      </div>
    </div>
  );
}
