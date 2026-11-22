import { useState, useEffect, useCallback } from 'react';
import {
  Plus,
  Trash2,
  Pencil,
  RotateCcw,
  Check,
  X,
  AlertCircle,
} from 'lucide-react';
import { v4 as uuidv4 } from 'uuid';

// Типы
interface Row {
  id: string;
  name: string;
}

interface Column {
  id: string;
  name: string;
}

type Status = 'not_started' | 'in_review' | 'rework' | 'completed';

interface CellData {
  [columnId: string]: Status;
}

interface TableData {
  [rowId: string]: CellData;
}

interface AppState {
  rows: Row[];
  columns: Column[];
  cells: TableData;
}

// Константы
const STATUS_OPTIONS: { value: Status; label: string }[] = [
  { value: 'not_started', label: 'Не сделано' },
  { value: 'in_review', label: 'На проверке' },
  { value: 'rework', label: 'Доработка' },
  { value: 'completed', label: 'Завершено' },
];

const STATUS_COLORS: Record<Status, string> = {
  not_started: 'bg-gray-100 text-gray-800',
  in_review: 'bg-yellow-100 text-yellow-800',
  rework: 'bg-orange-100 text-orange-800',
  completed: 'bg-green-100 text-green-800',
};

const STORAGE_KEY = 'task-status-board';

const DEFAULT_STATE: AppState = {
  rows: [
    { id: uuidv4(), name: 'Иванов А.И.' },
    { id: uuidv4(), name: 'Петрова М.С.' },
    { id: uuidv4(), name: 'Сидорова Е.В.' },
  ],
  columns: [
    { id: uuidv4(), name: '5А Математика' },
    { id: uuidv4(), name: '6Б Русский язык' },
    { id: uuidv4(), name: '7В Физика' },
  ],
  cells: {},
};

// Утилиты
function loadState(): AppState {
  try {
    const saved = localStorage.getItem(STORAGE_KEY);
    if (saved) {
      return JSON.parse(saved);
    }
  } catch (e) {
    console.error('Error loading state:', e);
  }
  return DEFAULT_STATE;
}

function saveState(state: AppState) {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
  } catch (e) {
    console.error('Error saving state:', e);
  }
}

// Компоненты
function StatusSelect({
  value,
  onChange,
}: {
  value: Status;
  onChange: (status: Status) => void;
}) {
  return (
    <select
      value={value}
      onChange={(e) => onChange(e.target.value as Status)}
      className={`w-full h-full px-2 py-1.5 rounded-md border-0 text-sm font-medium cursor-pointer transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-blue-400 ${STATUS_COLORS[value]}`}
    >
      {STATUS_OPTIONS.map((opt) => (
        <option key={opt.value} value={opt.value}>
          {opt.label}
        </option>
      ))}
    </select>
  );
}

function EditableHeader({
  name,
  onSave,
  children,
}: {
  name: string;
  onSave: (newName: string) => void;
  children?: React.ReactNode;
}) {
  const [isEditing, setIsEditing] = useState(false);
  const [editValue, setEditValue] = useState(name);

  useEffect(() => {
    setEditValue(name);
  }, [name]);

  const handleSave = () => {
    if (editValue.trim()) {
      onSave(editValue.trim());
    }
    setIsEditing(false);
  };

  const handleCancel = () => {
    setEditValue(name);
    setIsEditing(false);
  };

  const handleDoubleClick = () => {
    setIsEditing(true);
  };

  if (isEditing) {
    return (
      <div className="flex items-center gap-1">
        <input
          type="text"
          value={editValue}
          onChange={(e) => setEditValue(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === 'Enter') handleSave();
            if (e.key === 'Escape') handleCancel();
          }}
          className="flex-1 px-2 py-1 text-sm border border-blue-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-400"
          autoFocus
        />
        <button
          onClick={handleSave}
          className="p-1 text-green-600 hover:bg-green-100 rounded transition-colors"
          title="Сохранить"
        >
          <Check size={14} />
        </button>
        <button
          onClick={handleCancel}
          className="p-1 text-red-600 hover:bg-red-100 rounded transition-colors"
          title="Отмена"
        >
          <X size={14} />
        </button>
      </div>
    );
  }

  return (
    <div
      className="flex items-center gap-1 group cursor-pointer"
      onDoubleClick={handleDoubleClick}
    >
      <span className="flex-1 truncate">{name}</span>
      <button
        onClick={() => setIsEditing(true)}
        className="p-1 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded opacity-0 group-hover:opacity-100 transition-all"
        title="Переименовать"
      >
        <Pencil size={12} />
      </button>
      {children}
    </div>
  );
}

function ConfirmDialog({
  isOpen,
  title,
  message,
  onConfirm,
  onCancel,
}: {
  isOpen: boolean;
  title: string;
  message: string;
  onConfirm: () => void;
  onCancel: () => void;
}) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm">
      <div className="bg-white rounded-xl shadow-2xl p-6 max-w-sm mx-4 animate-in">
        <div className="flex items-center gap-3 mb-4">
          <div className="flex items-center justify-center w-10 h-10 rounded-full bg-red-100">
            <AlertCircle className="text-red-600" size={20} />
          </div>
          <h3 className="text-lg font-semibold text-gray-900">{title}</h3>
        </div>
        <p className="text-gray-600 mb-6">{message}</p>
        <div className="flex gap-3 justify-end">
          <button
            onClick={onCancel}
            className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-lg transition-colors"
          >
            Отмена
          </button>
          <button
            onClick={onConfirm}
            className="px-4 py-2 text-sm font-medium text-white bg-red-600 hover:bg-red-700 rounded-lg transition-colors"
          >
            Подтвердить
          </button>
        </div>
      </div>
    </div>
  );
}

// Главный компонент
export default function App() {
  const [state, setState] = useState<AppState>(loadState);
  const [showResetConfirm, setShowResetConfirm] = useState(false);

  // Сохранение в localStorage
  useEffect(() => {
    saveState(state);
  }, [state]);

  // Обработчики строк
  const addRow = useCallback(() => {
    const newRow: Row = { id: uuidv4(), name: 'Новый исполнитель' };
    setState((prev) => ({
      ...prev,
      rows: [...prev.rows, newRow],
      cells: {
        ...prev.cells,
        [newRow.id]: {},
      },
    }));
  }, []);

  const removeRow = useCallback((rowId: string) => {
    setState((prev) => {
      if (prev.rows.length <= 1) return prev;
      const newCells = { ...prev.cells };
      delete newCells[rowId];
      return {
        ...prev,
        rows: prev.rows.filter((r) => r.id !== rowId),
        cells: newCells,
      };
    });
  }, []);

  const renameRow = useCallback((rowId: string, newName: string) => {
    setState((prev) => ({
      ...prev,
      rows: prev.rows.map((r) => (r.id === rowId ? { ...r, name: newName } : r)),
    }));
  }, []);

  // Обработчики столбцов
  const addColumn = useCallback(() => {
    const newCol: Column = { id: uuidv4(), name: 'Новый предмет' };
    setState((prev) => ({
      ...prev,
      columns: [...prev.columns, newCol],
    }));
  }, []);

  const removeColumn = useCallback((colId: string) => {
    setState((prev) => {
      if (prev.columns.length <= 1) return prev;
      const newCells = { ...prev.cells };
      Object.keys(newCells).forEach((rowId) => {
        const rowCells = { ...newCells[rowId] };
        delete rowCells[colId];
        newCells[rowId] = rowCells;
      });
      return {
        ...prev,
        columns: prev.columns.filter((c) => c.id !== colId),
        cells: newCells,
      };
    });
  }, []);

  const renameColumn = useCallback((colId: string, newName: string) => {
    setState((prev) => ({
      ...prev,
      columns: prev.columns.map((c) =>
        c.id === colId ? { ...c, name: newName } : c
      ),
    }));
  }, []);

  // Обработчик ячеек
  const updateCell = useCallback(
    (rowId: string, colId: string, status: Status) => {
      setState((prev) => ({
        ...prev,
        cells: {
          ...prev.cells,
          [rowId]: {
            ...prev.cells[rowId],
            [colId]: status,
          },
        },
      }));
    },
    []
  );

  // Сброс
  const resetAll = () => {
    setState(DEFAULT_STATE);
    setShowResetConfirm(false);
  };

  return (
    <div className="min-h-screen bg-gray-50 p-4 md:p-6 lg:p-8">
      <div className="max-w-full mx-auto">
        {/* Заголовок */}
        <div className="mb-6 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h1 className="text-2xl md:text-3xl font-bold text-gray-900">
              📋 Доска статусов задач
            </h1>
            <p className="text-sm text-gray-500 mt-1">
              Сводная таблица по исполнителям и предметам
            </p>
          </div>
          <button
            onClick={() => setShowResetConfirm(true)}
            className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-red-700 bg-red-50 hover:bg-red-100 border border-red-200 rounded-lg transition-colors"
          >
            <RotateCcw size={16} />
            Сбросить всё
          </button>
        </div>

        {/* Легенда */}
        <div className="mb-4 flex flex-wrap gap-3">
          {STATUS_OPTIONS.map((opt) => (
            <div
              key={opt.value}
              className={`flex items-center gap-2 px-3 py-1.5 rounded-full text-xs font-medium ${STATUS_COLORS[opt.value]}`}
            >
              <span className="w-2 h-2 rounded-full bg-current opacity-60"></span>
              {opt.label}
            </div>
          ))}
        </div>

        {/* Таблица */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
          <div className="overflow-auto max-h-[70vh]">
            {state.rows.length === 0 || state.columns.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-16 text-gray-400">
                <AlertCircle size={48} className="mb-4 opacity-50" />
                <p className="text-lg font-medium">Таблица пуста</p>
                <p className="text-sm mt-1">
                  Добавьте строки и столбцы для начала работы
                </p>
              </div>
            ) : (
              <table className="w-full border-collapse">
                <thead className="sticky top-0 z-20">
                  <tr className="bg-gray-50 border-b border-gray-200">
                    {/* Угол таблицы */}
                    <th className="sticky left-0 z-30 bg-gray-50 border-r border-gray-200 px-4 py-3 min-w-[180px]">
                      <div className="flex items-center gap-2">
                        <span className="text-sm font-semibold text-gray-700">
                          Исполнитель
                        </span>
                        <button
                          onClick={addRow}
                          className="p-1 text-gray-400 hover:text-green-600 hover:bg-green-50 rounded transition-colors"
                          title="Добавить исполнителя"
                        >
                          <Plus size={16} />
                        </button>
                      </div>
                    </th>
                    {/* Заголовки столбцов */}
                    {state.columns.map((col) => (
                      <th
                        key={col.id}
                        className="px-3 py-3 text-left min-w-[140px] border-r border-gray-100 last:border-r-0"
                      >
                        <div className="flex items-center gap-1">
                          <EditableHeader
                            name={col.name}
                            onSave={(name) => renameColumn(col.id, name)}
                          >
                            <button
                              onClick={() => removeColumn(col.id)}
                              disabled={state.columns.length <= 1}
                              className="p-1 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded opacity-0 group-hover:opacity-100 transition-all disabled:opacity-30 disabled:cursor-not-allowed"
                              title={
                                state.columns.length <= 1
                                  ? 'Нельзя удалить последний столбец'
                                  : 'Удалить столбец'
                              }
                            >
                              <Trash2 size={12} />
                            </button>
                          </EditableHeader>
                        </div>
                      </th>
                    ))}
                    {/* Кнопка добавления столбца */}
                    <th className="px-3 py-3 w-[50px]">
                      <button
                        onClick={addColumn}
                        className="p-1.5 text-gray-400 hover:text-green-600 hover:bg-green-50 rounded-lg transition-colors"
                        title="Добавить столбец"
                      >
                        <Plus size={16} />
                      </button>
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {state.rows.map((row, rowIndex) => (
                    <tr
                      key={row.id}
                      className={`border-b border-gray-100 last:border-b-0 hover:bg-gray-50/50 transition-colors ${
                        rowIndex % 2 === 0 ? 'bg-white' : 'bg-gray-50/30'
                      }`}
                    >
                      {/* Ячейка с именем исполнителя */}
                      <td className="sticky left-0 z-10 border-r border-gray-200 px-4 py-2 bg-inherit">
                        <div className="flex items-center gap-2">
                          <div className="flex-1 min-w-0">
                            <EditableHeader
                              name={row.name}
                              onSave={(name) => renameRow(row.id, name)}
                            />
                          </div>
                          <button
                            onClick={() => removeRow(row.id)}
                            disabled={state.rows.length <= 1}
                            className="p-1.5 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded transition-colors disabled:opacity-30 disabled:cursor-not-allowed"
                            title={
                              state.rows.length <= 1
                                ? 'Нельзя удалить последнюю строку'
                                : 'Удалить исполнителя'
                            }
                          >
                            <Trash2 size={14} />
                          </button>
                        </div>
                      </td>
                      {/* Ячейки статусов */}
                      {state.columns.map((col) => {
                        const currentStatus =
                          state.cells[row.id]?.[col.id] || 'not_started';
                        return (
                          <td
                            key={col.id}
                            className={`px-2 py-2 border-r border-gray-100 last:border-r-0 transition-colors duration-200 ${STATUS_COLORS[currentStatus]}`}
                          >
                            <StatusSelect
                              value={currentStatus}
                              onChange={(status) =>
                                updateCell(row.id, col.id, status)
                              }
                            />
                          </td>
                        );
                      })}
                      {/* Пустая ячейка для кнопки добавления столбца */}
                      <td className="px-2 py-2"></td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>
        </div>

        {/* Нижняя панель с кнопками добавления */}
        {state.rows.length > 0 && state.columns.length > 0 && (
          <div className="mt-4 flex flex-wrap gap-3">
            <button
              onClick={addRow}
              className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-blue-700 bg-blue-50 hover:bg-blue-100 border border-blue-200 rounded-lg transition-colors"
            >
              <Plus size={16} />
              Добавить исполнителя
            </button>
            <button
              onClick={addColumn}
              className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-purple-700 bg-purple-50 hover:bg-purple-100 border border-purple-200 rounded-lg transition-colors"
            >
              <Plus size={16} />
              Добавить предмет
            </button>
          </div>
        )}

        {/* Статистика */}
        {state.rows.length > 0 && state.columns.length > 0 && (
          <div className="mt-6 grid grid-cols-2 sm:grid-cols-4 gap-3">
            {STATUS_OPTIONS.map((opt) => {
              let count = 0;
              state.rows.forEach((row) => {
                state.columns.forEach((col) => {
                  if (state.cells[row.id]?.[col.id] === opt.value) count++;
                });
              });
              return (
                <div
                  key={opt.value}
                  className={`rounded-lg p-3 ${STATUS_COLORS[opt.value]}`}
                >
                  <div className="text-2xl font-bold">{count}</div>
                  <div className="text-xs font-medium opacity-80">
                    {opt.label}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Диалог подтверждения сброса */}
      <ConfirmDialog
        isOpen={showResetConfirm}
        title="Сбросить все данные?"
        message="Все исполнители, предметы и статусы будут удалены. Это действие нельзя отменить."
        onConfirm={resetAll}
        onCancel={() => setShowResetConfirm(false)}
      />
    </div>
  );
}
