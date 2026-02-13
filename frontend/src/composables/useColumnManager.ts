import { computed, ref, watch } from 'vue'

export interface ColumnConfig {
  key: string
  label: string
  defaultVisible?: boolean
  locked?: boolean
}

const loadPersistedColumns = (storageKey: string): string[] | null => {
  if (typeof window === 'undefined') return null
  try {
    const raw = localStorage.getItem(storageKey)
    if (!raw) return null
    const parsed = JSON.parse(raw)
    return Array.isArray(parsed) ? parsed.filter((item) => typeof item === 'string') : null
  } catch {
    return null
  }
}

export const useColumnManager = (storageKey: string, columns: ColumnConfig[]) => {
  const allowedKeys = new Set(columns.map((column) => column.key))
  const lockedKeys = columns.filter((column) => column.locked).map((column) => column.key)
  const defaultVisible = columns
    .filter((column) => column.defaultVisible !== false || column.locked)
    .map((column) => column.key)

  const persisted = loadPersistedColumns(storageKey)
  const initialVisible = (persisted || defaultVisible)
    .filter((key) => allowedKeys.has(key))
    .concat(lockedKeys)

  const visibleColumns = ref<string[]>(Array.from(new Set(initialVisible)))

  const isColumnVisible = (key: string) => visibleColumns.value.includes(key)

  const selectAllColumns = () => {
    visibleColumns.value = columns.map((column) => column.key)
  }

  const resetColumns = () => {
    visibleColumns.value = Array.from(new Set(defaultVisible.concat(lockedKeys)))
  }

  const filteredHeaders = <T extends { key: string }>(headers: T[]) =>
    headers.filter((header) => isColumnVisible(header.key))

  watch(
    visibleColumns,
    (value) => {
      if (typeof window === 'undefined') return
      const normalized = Array.from(new Set(value.concat(lockedKeys))).filter((key) =>
        allowedKeys.has(key),
      )
      localStorage.setItem(storageKey, JSON.stringify(normalized))
      if (normalized.length !== value.length) {
        visibleColumns.value = normalized
      }
    },
    { deep: true },
  )

  return {
    columns: computed(() => columns),
    visibleColumns,
    defaultVisible,
    isColumnVisible,
    selectAllColumns,
    resetColumns,
    filteredHeaders,
  }
}
