import { ref } from 'vue'

export const useNotificationsStore = () => {
    const show = ref(false)
    const message = ref('')
    const color = ref('success')
    const icon = ref('mdi-check-circle')

    const notify = (msg: string, type: 'success' | 'error' | 'info' | 'warning' = 'success') => {
        message.value = msg
        color.value = type
        icon.value = type === 'success' ? 'mdi-check-circle' :
            type === 'error' ? 'mdi-alert-circle' :
                type === 'warning' ? 'mdi-alert' : 'mdi-information'
        show.value = true
    }

    return {
        show,
        message,
        color,
        icon,
        notify
    }
}

// Global instance for easier access in layouts
export const notificationsStore = useNotificationsStore()
