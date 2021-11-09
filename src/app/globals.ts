// Production = 1
// Development = 0
let env = 1


export const APISERV = env == 1 ? '' : '';
export const APIFOLDER = env == 1 ? 'rf' : 'rfDev';
export const CYCTITLE = 'ComeyCome';
export const CYCYEAR = '2019';
export const VER = 'v2.4.5';
export const PRODENV = env;
export const HREF = 'https://cyc-oasishoteles.com';

export const TRL = {
    'idioma_es': {
        'Cancelada': 'Cancelada',
        'Cotizacion': 'Cotización',
        'Expirada': 'Expirada',
        'Facturacion': 'Facturación',
        'Habitacion': 'Habitación',
        'Hotel': 'Hotel',
        'Huespedes': 'Huéspedes',
        'Localizador': 'Localizador',
        'Noches': 'Noches',
        'Pagar': 'Pagar',
        'Pagos': 'Pagos',
        'Pendiente': 'Pendiente',
        'Reserva Completa': 'Reserva Completa (Resumen)',        
        'Resumen': 'Resumen',
        'Seguros': 'Seguros',
        'Traslados': 'Traslados',
    },
    'idioma_en': {
        'Cancelada': 'Cancelled',
        'Cotizacion': 'Quotation',
        'Expirada': 'Expired',
        'Facturacion': 'Billing',
        'Habitacion': 'Room Type',
        'Hotel': 'Hotel',
        'Huespedes': 'Guests',
        'Localizador': 'Locator',
        'Noches': 'Nights',
        'Pagar': 'Pay balance',
        'Pagos': 'Payments',
        'Pendiente': 'Pending',
        'Reserva Completa': 'Full Reservation (Summary)',
        'Resumen': 'Summary',
        'Seguros': 'Insurance',
        'Traslados': 'Shuttle',
    },
    'idioma_pt': {
        'Cancelada': 'Cancelado',
        'Cotizacion': 'Cotação',
        'Expirada': 'Expirado',
        'Facturacion': 'Faturamento',
        'Habitacion': 'Tipo de sala',
        'Hotel': 'Hotel',
        'Huespedes': 'Convidados',
        'Localizador': 'Localizador',
        'Noches': 'Noites',
        'Pagar': 'Saldo de Salário',
        'Pagos': 'Pagamentos',
        'Pendiente': 'Pendente',
        'Reserva Completa': 'Reserva total (Resumo)',
        'Resumen': 'Resumo',
        'Seguros': 'Seguro',
        'Traslados': 'Transporte',
    },
}
