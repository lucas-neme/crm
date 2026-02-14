<template>
  <v-menu
    location="bottom end"
    :close-on-content-click="false"
    transition="scale-transition"
  >
    <template #activator="{ props }">
      <v-tooltip text="Gerenciador de colunas" location="top">
        <template #activator="{ props: tooltipProps }">
          <v-btn
            icon
            variant="tonal"
            class="column-trigger action-icon-btn"
            v-bind="{ ...props, ...tooltipProps }"
          >
            <v-icon icon="mdi-tune-variant" size="20" />
          </v-btn>
        </template>
      </v-tooltip>
    </template>

    <v-card min-width="320" class="column-menu-card">
      <v-card-title class="text-subtitle-1 d-flex align-center justify-space-between">
        Gerenciar colunas
        <v-icon icon="mdi-view-column-outline" size="18" />
      </v-card-title>
      <v-divider />
      <v-card-text class="py-2 column-list">
        <v-checkbox
          v-for="column in columns"
          :key="column.key"
          :label="column.label"
          :model-value="modelValue.includes(column.key)"
          :disabled="column.locked"
          density="compact"
          hide-details
          @update:model-value="onToggle(column.key, $event)"
        />
      </v-card-text>
      <v-divider />
      <v-card-actions>
        <v-btn variant="text" size="small" @click="emit('reset')">Padrão</v-btn>
        <v-btn variant="text" size="small" @click="emit('select-all')">Selecionar todas</v-btn>
      </v-card-actions>
    </v-card>
  </v-menu>
</template>

<script setup lang="ts">
interface ColumnItem {
  key: string
  label: string
  locked?: boolean
}

interface Props {
  columns: ColumnItem[]
  modelValue: string[]
}

const props = defineProps<Props>()

const emit = defineEmits<{
  'update:modelValue': [value: string[]]
  reset: []
  'select-all': []
}>()

const onToggle = (key: string, checked: boolean | null) => {
  if (checked === true) {
    emit('update:modelValue', Array.from(new Set([...props.modelValue, key])))
    return
  }

  emit(
    'update:modelValue',
    props.modelValue.filter((item) => item !== key),
  )
}
</script>



<style scoped>

.column-menu-card {
  border: 1px solid #dbe3f0;
  border-radius: 12px;
  box-shadow: 0 16px 30px rgba(15, 23, 42, 0.14);
}

.column-list {
  max-height: 300px;
  overflow-y: auto;
}
</style>

