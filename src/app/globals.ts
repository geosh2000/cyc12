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
        'Confirmado' : 'Confirmado',
        'Cotizacion': 'Cotización',
        'En Validacion' : 'Validando',
        'Expirada': 'Expirada',
        'Facturacion': 'Facturación',
        'Habitacion': 'Habitación',
        'Hotel': 'Hotel',
        'Huespedes': 'Huéspedes',
        'Incluye seguro' : 'Incluye seguro',
        'Localizador': 'Localizador',
        'Llegada' : 'Llegada',
        'Salida' : 'Salida',
        'Noches': 'Noches',
        'Pagar': 'Pagar',
        'Pagos': 'Pagos',
        'Pendiente': 'Pendiente',
        'Personas': 'personas',
        'Reserva Completa': 'Reserva Completa (Resumen)',        
        'Resumen': 'Resumen',
        'Seguros': 'Seguros',
        'Seguro Assistcard' : 'Viaja seguro con Assistcard',
        'Traslados': 'Traslados',
        'Agregar Seguro' : 'Agregar protección a tu viaje contra accidentes y enfermedades con cobertura por hasta $60,000 USD por sólo',
    },
    'idioma_en': {
        'Cancelada': 'Cancelled',
        'Confirmado' : 'Confirmed',
        'Cotizacion': 'Quotation',
        'En Validacion' : 'Validating',
        'Expirada': 'Expired',
        'Facturacion': 'Billing',
        'Habitacion': 'Room Type',
        'Hotel': 'Hotel',
        'Huespedes': 'Guests',
        'Incluye seguro' : 'Includes insurance',
        'Localizador': 'Locator',
        'Llegada' : 'Arrival',
        'Salida' : 'Departure',
        'Noches': 'Nights',
        'Pagar': 'Pay balance',
        'Pagos': 'Payments',
        'Pendiente': 'Pending',
        'Personas': 'people',
        'Reserva Completa': 'Full Reservation (Summary)',
        'Resumen': 'Summary',
        'Seguros': 'Insurance',
        'Seguro Assistcard' : 'Travel safely with Assistcard',
        'Traslados': 'Shuttle',
        'Agregar Seguro' : 'Add protection to your trip against accidents and illnesses with coverage for up to $ 60,000 USD for only',
    },
    'idioma_pt': {
        'Cancelada': 'Cancelado',
        'Confirmado' : 'Confirmado',
        'Cotizacion': 'Cotação',
        'En Validacion' : 'Validando',
        'Expirada': 'Expirado',
        'Facturacion': 'Faturamento',
        'Habitacion': 'Tipo de sala',
        'Hotel': 'Hotel',
        'Huespedes': 'Convidados',
        'Incluye seguro' : 'Inclui seguro',
        'Localizador': 'Localizador',
        'Llegada' : 'Chegada',
        'Salida' : 'Partida',
        'Noches': 'Noites',
        'Pagar': 'Saldo de Salário',
        'Pagos': 'Pagamentos',
        'Pendiente': 'Pendente',
        'Personas': 'pessoas',
        'Reserva Completa': 'Reserva total (Resumo)',
        'Resumen': 'Resumo',
        'Seguros': 'Seguro',
        'Seguro Assistcard' : 'Viaje com segurança com Assistcard',
        'Traslados': 'Transporte',
        'Agregar Seguro' : 'Adicione proteção à sua viagem contra acidentes e doenças com cobertura de até $ 60.000 USD por apenas',
    },
}
