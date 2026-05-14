import dayjs from 'dayjs'
import relativeTime from 'dayjs/plugin/relativeTime'
import 'dayjs/locale/es'
dayjs.extend(relativeTime)
dayjs.locale('es')

export const formatCurrency = (amount) =>
  new Intl.NumberFormat('es-CO', { style: 'currency', currency: 'COP', maximumFractionDigits: 0 }).format(amount)

export const formatDate = (date) => dayjs(date).format('D MMM YYYY')
export const formatDateShort = (date) => dayjs(date).format('DD/MM/YYYY')
export const fromNow = (date) => dayjs(date).fromNow()
