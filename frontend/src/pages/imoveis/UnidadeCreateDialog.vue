<template>
    <v-dialog v-model="dialog" max-width="800px" persistent>
        <template v-slot:activator="{ props }">
            <v-btn color="primary" v-bind="props" prepend-icon="mdi-plus">
                Nova Unidade
            </v-btn>
        </template>

        <v-card>
            <v-card-title>
                <span class="text-h5">Nova Unidade</span>
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
                                <v-select v-model="form.statusUnidade" :items="statusOptions" item-title="title" item-value="value" label="Status Inicial"></v-select>
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
import { ref, computed } from 'vue'
import { useImoveisStore } from '../../stores/imoveisStore'

const props = defineProps<{ empreendimentoId: string }>()
const store = useImoveisStore()
const dialog = ref(false)
const loading = ref(false)

const form = ref({
    empreendimentoId: props.empreendimentoId,
    codigoInterno: '',
    tipo: 'APARTAMENTO',
    tipologia: '',
    torre: '',
    andar: '',
    numeroUnidade: '',
    areaPrivativa: 0,
    quartos: 0,
    suites: 0,
    vagas: 0,
    valorTabela: 0,
    valorOferta: 0,
    statusUnidade: 'DISPONIVEL'
})

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

const salvar = async () => {
    loading.value = true
    const res = await store.createUnidade({ ...form.value, empreendimentoId: props.empreendimentoId })
    if (res.success) {
        dialog.value = false
        // Reset form
        form.value.codigoInterno = ''
        form.value.numeroUnidade = ''
        form.value.valorTabela = 0
        form.value.valorOferta = 0
    } else {
        alert(res.message)
    }
    loading.value = false
}
</script>
