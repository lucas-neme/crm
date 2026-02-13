<template>
    <v-dialog v-model="dialog" max-width="800px">
        <v-card>
            <v-card-title>
                <span class="text-h5">Editar Unidade</span>
            </v-card-title>

            <v-card-text>
                <v-container>
                    <v-form ref="formRef" @submit.prevent="salvar">
                        <v-row>
                            <v-col cols="12" md="4">
                                <v-text-field v-model="form.codigoInterno" label="Código Interno (Ex: A101)" required></v-text-field>
                            </v-col>
                            <v-col cols="12" md="4">
                                <v-select v-model="form.tipo" :items="['APARTAMENTO', 'CASA', 'COMERCIAL', 'TERRENO']" label="Tipo" required></v-select>
                            </v-col>
                            <v-col cols="12" md="4">
                                <v-text-field v-model="form.tipologia" label="Tipologia (Ex: 3 Quartos)"></v-text-field>
                            </v-col>

                            <v-col cols="12" md="4">
                                <v-text-field v-model="form.torre" label="Torre/Bloco"></v-text-field>
                            </v-col>
                            <v-col cols="12" md="4">
                                <v-text-field v-model="form.andar" label="Andar"></v-text-field>
                            </v-col>
                             <v-col cols="12" md="4">
                                <v-text-field v-model="form.numeroUnidade" label="Número"></v-text-field>
                            </v-col>

                            <v-col cols="12" md="3">
                                <v-text-field v-model="form.areaPrivativa" label="Área Privativa (m²)" type="number"></v-text-field>
                            </v-col>
                            <v-col cols="12" md="3">
                                <v-text-field v-model="form.quartos" label="Quartos" type="number"></v-text-field>
                            </v-col>
                             <v-col cols="12" md="3">
                                <v-text-field v-model="form.suites" label="Suítes" type="number"></v-text-field>
                            </v-col>
                            <v-col cols="12" md="3">
                                <v-text-field v-model="form.vagas" label="Vagas" type="number"></v-text-field>
                            </v-col>

                            <v-col cols="12" md="6">
                                <v-text-field v-model="valorTabelaFormatted" label="Valor de Tabela (R$)"></v-text-field>
                            </v-col>
                            <v-col cols="12" md="6">
                                <v-text-field v-model="valorOfertaFormatted" label="Valor de Oferta (R$)"></v-text-field>
                            </v-col>

                             <v-col cols="12">
                                <v-select v-model="form.statusUnidade" :items="statusOptions" item-title="title" item-value="value" label="Status"></v-select>
                            </v-col>
                        </v-row>
                    </v-form>
                </v-container>
            </v-card-text>

            <v-card-actions>
                <v-spacer></v-spacer>
                <v-btn color="blue-darken-1" variant="text" @click="dialog = false">Cancelar</v-btn>
                <v-btn color="blue-darken-1" variant="text" @click="salvar" :loading="loading">Salvar</v-btn>
            </v-card-actions>
        </v-card>
    </v-dialog>
</template>

<script setup lang="ts">
import { ref, watch, computed } from 'vue'
import { useImoveisStore, type Unidade } from '../../stores/imoveisStore'

const props = defineProps<{ modelValue: boolean, unidade: Unidade }>()
const emit = defineEmits(['update:modelValue', 'saved'])

const store = useImoveisStore()
const loading = ref(false)
const dialog = ref(props.modelValue)

const form = ref<any>({})

const statusOptions = [
    { title: 'DISPONÍVEL', value: 'DISPONIVEL' },
    { title: 'RESERVADO', value: 'RESERVADO' },
    { title: 'VENDIDO', value: 'VENDIDO' }
]

const formatCurrency = (value: number) => {
    if (!value) return ''
    return new Intl.NumberFormat('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 }).format(value)
}

const parseCurrency = (value: string) => {
    const clean = value.replace(/[^\d,]/g, '').replace(',', '.')
    return parseFloat(clean) || 0
}

const valorTabelaFormatted = computed({
    get: () => formatCurrency(form.value.valorTabela),
    set: (val) => {
        form.value.valorTabela = parseCurrency(val)
    }
})

const valorOfertaFormatted = computed({
    get: () => formatCurrency(form.value.valorOferta),
    set: (val) => {
        form.value.valorOferta = parseCurrency(val)
    }
})

watch(() => props.modelValue, (val) => {
    dialog.value = val
    if (val && props.unidade) {
        form.value = { ...props.unidade }
    }
})

watch(dialog, (val) => {
    emit('update:modelValue', val)
})

const salvar = async () => {
    loading.value = true
    const payload = {
        codigoInterno: form.value.codigoInterno,
        tipo: form.value.tipo,
        tipologia: form.value.tipologia,
        torre: form.value.torre,
        andar: form.value.andar,
        numeroUnidade: form.value.numeroUnidade,
        areaPrivativa: Number(form.value.areaPrivativa),
        quartos: Number(form.value.quartos),
        suites: Number(form.value.suites),
        vagas: Number(form.value.vagas),
        valorTabela: Number(form.value.valorTabela),
        valorOferta: Number(form.value.valorOferta),
        statusUnidade: form.value.statusUnidade
    }
    const res = await store.updateUnidade(props.unidade.id, payload)
    if (res.success) {
        dialog.value = false
        emit('saved')
    } else {
        alert(res.message)
    }
    loading.value = false
}
</script>
