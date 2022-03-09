import { animate, state, style, transition, trigger } from '@angular/animations';

export let expand = trigger( 'expand', [
    state( 'void' , style({ height: '0px' })),

    transition( ':enter, :leave', [
      animate( 100 )
    ])
])

export let remark = trigger( 'remark', [
    state( 'alert' , style({ 
        'background': 'yellow'
     })),
    
    state( 'warn' , style({ 
        'background': 'red'
     })),

    transition( 'void <=> alert', [
      animate( 500 )
    ])
])

export let fade = trigger( 'fade', [
    state( 'void' , style({ 
        opacity: 0
     })),

    transition( ':enter, :leave', [
      animate( 500 )
    ])
])