import { Component, Input, OnChanges, OnInit, SimpleChanges } from '@angular/core';
import { FormBuilder, FormControl, FormGroup, Validators } from '@angular/forms';

import { ApiService, InitService } from 'src/app/services/service.index';

import * as moment from 'moment-timezone';
import Swal from 'sweetalert2';

@Component({
  selector: 'app-hotel-checkout',
  templateUrl: './hotel-checkout.component.html',
  styleUrls: ['./hotel-checkout.component.css']
})
export class HotelCheckoutComponent implements OnInit, OnChanges {

  @Input() rsvData = {
    "habSelected": {
        "hotel": {
            "hotel": "GOC",
            "hotelName": "Grand Oasis Cancún",
            "habCode": "GSDR",
            "tarifa_pp": 1,
            "jsonData": "{\"2021-10-19\":{\"n1\":{\"name\":\"Publica\",\"code\":\"1 (jb)\",\"descuento\":0.68,\"active\":1,\"allEnabled\":1},\"n2\":{\"name\":\"Silver\",\"code\":\"2 (JC)\",\"descuento\":0.7,\"active\":1,\"allEnabled\":1},\"n3\":{\"name\":\"Gold\",\"code\":\"3 (Jc)\",\"descuento\":0.7024,\"active\":1,\"allEnabled\":0},\"n4\":{\"name\":\"Platinum\",\"code\":\"4 (jC)\",\"descuento\":0.712,\"active\":1,\"allEnabled\":0},\"precio\":{\"pax1\":442,\"pax2\":624,\"pax3\":894,\"pax4\":1088,\"paxMenor\":84},\"isClosed\":0},\"2021-10-20\":{\"n1\":{\"name\":\"Publica\",\"code\":\"1 (jb)\",\"descuento\":0.68,\"active\":1,\"allEnabled\":1},\"n2\":{\"name\":\"Silver\",\"code\":\"2 (JC)\",\"descuento\":0.7,\"active\":1,\"allEnabled\":1},\"n3\":{\"name\":\"Gold\",\"code\":\"3 (Jc)\",\"descuento\":0.7024,\"active\":1,\"allEnabled\":0},\"n4\":{\"name\":\"Platinum\",\"code\":\"4 (jC)\",\"descuento\":0.712,\"active\":1,\"allEnabled\":0},\"precio\":{\"pax1\":442,\"pax2\":624,\"pax3\":894,\"pax4\":1088,\"paxMenor\":84},\"isClosed\":0},\"2021-10-21\":{\"n1\":{\"name\":\"Publica\",\"code\":\"1 (jb)\",\"descuento\":0.68,\"active\":1,\"allEnabled\":1},\"n2\":{\"name\":\"Silver\",\"code\":\"2 (JC)\",\"descuento\":0.7,\"active\":1,\"allEnabled\":1},\"n3\":{\"name\":\"Gold\",\"code\":\"3 (Jc)\",\"descuento\":0.7024,\"active\":1,\"allEnabled\":0},\"n4\":{\"name\":\"Platinum\",\"code\":\"4 (jC)\",\"descuento\":0.712,\"active\":1,\"allEnabled\":0},\"precio\":{\"pax1\":442,\"pax2\":624,\"pax3\":894,\"pax4\":1088,\"paxMenor\":84},\"isClosed\":0}}",
            "habName": "Standard",
            "maxOcc": "5",
            "maxAdults": "4",
            "maxChild": "3",
            "isNR": 0,
            "isCC": "1",
            "tipoCamas": "3",
            "tipoCambio": 19.5,
            "hotelUrl": {
                "changingThisBreaksApplicationSecurity": "url(https://cyc-oasishoteles.com/assets/img/logos/logo_goc.jpg)"
            },
            "minNights": "1",
            "tarifas": {
                "2021-10-19": {
                    "n1": {
                        "name": "Publica",
                        "code": "1 (jb)",
                        "descuento": 0.68,
                        "active": 1,
                        "allEnabled": 1
                    },
                    "n2": {
                        "name": "Silver",
                        "code": "2 (JC)",
                        "descuento": 0.7,
                        "active": 1,
                        "allEnabled": 1
                    },
                    "n3": {
                        "name": "Gold",
                        "code": "3 (Jc)",
                        "descuento": 0.7024,
                        "active": 1,
                        "allEnabled": 0
                    },
                    "n4": {
                        "name": "Platinum",
                        "code": "4 (jC)",
                        "descuento": 0.712,
                        "active": 1,
                        "allEnabled": 0
                    },
                    "precio": {
                        "pax1": 442,
                        "pax2": 624,
                        "pax3": 894,
                        "pax4": 1088,
                        "paxMenor": 84
                    },
                    "isClosed": 0
                },
                "2021-10-20": {
                    "n1": {
                        "name": "Publica",
                        "code": "1 (jb)",
                        "descuento": 0.68,
                        "active": 1,
                        "allEnabled": 1
                    },
                    "n2": {
                        "name": "Silver",
                        "code": "2 (JC)",
                        "descuento": 0.7,
                        "active": 1,
                        "allEnabled": 1
                    },
                    "n3": {
                        "name": "Gold",
                        "code": "3 (Jc)",
                        "descuento": 0.7024,
                        "active": 1,
                        "allEnabled": 0
                    },
                    "n4": {
                        "name": "Platinum",
                        "code": "4 (jC)",
                        "descuento": 0.712,
                        "active": 1,
                        "allEnabled": 0
                    },
                    "precio": {
                        "pax1": 442,
                        "pax2": 624,
                        "pax3": 894,
                        "pax4": 1088,
                        "paxMenor": 84
                    },
                    "isClosed": 0
                },
                "2021-10-21": {
                    "n1": {
                        "name": "Publica",
                        "code": "1 (jb)",
                        "descuento": 0.68,
                        "active": 1,
                        "allEnabled": 1
                    },
                    "n2": {
                        "name": "Silver",
                        "code": "2 (JC)",
                        "descuento": 0.7,
                        "active": 1,
                        "allEnabled": 1
                    },
                    "n3": {
                        "name": "Gold",
                        "code": "3 (Jc)",
                        "descuento": 0.7024,
                        "active": 1,
                        "allEnabled": 0
                    },
                    "n4": {
                        "name": "Platinum",
                        "code": "4 (jC)",
                        "descuento": 0.712,
                        "active": 1,
                        "allEnabled": 0
                    },
                    "precio": {
                        "pax1": 442,
                        "pax2": 624,
                        "pax3": 894,
                        "pax4": 1088,
                        "paxMenor": 84
                    },
                    "isClosed": 0
                }
            },
            "habs": {
                "porHabitacion": {
                    "hab1": {
                        "occ": {
                            "adultos": 2,
                            "menores": 0
                        },
                        "fechas": {
                            "2021-10-19": {
                                "neta": 624,
                                "n1": {
                                    "monto": 199.67999999999998,
                                    "descuento": 0.68,
                                    "relativeDisc": 0.68
                                },
                                "n2": {
                                    "monto": 187.20000000000002,
                                    "descuento": 0.7,
                                    "relativeDisc": 0.06249999999999978
                                },
                                "n3": {
                                    "monto": 185.70239999999998,
                                    "descuento": 0.7024,
                                    "relativeDisc": 0.06999999999999995
                                },
                                "n4": {
                                    "monto": 179.71200000000002,
                                    "descuento": 0.712,
                                    "relativeDisc": 0.09999999999999987
                                },
                                "isClosed": false
                            },
                            "2021-10-20": {
                                "neta": 624,
                                "n1": {
                                    "monto": 199.67999999999998,
                                    "descuento": 0.68,
                                    "relativeDisc": 0.68
                                },
                                "n2": {
                                    "monto": 187.20000000000002,
                                    "descuento": 0.7,
                                    "relativeDisc": 0.06249999999999978
                                },
                                "n3": {
                                    "monto": 185.70239999999998,
                                    "descuento": 0.7024,
                                    "relativeDisc": 0.06999999999999995
                                },
                                "n4": {
                                    "monto": 179.71200000000002,
                                    "descuento": 0.712,
                                    "relativeDisc": 0.09999999999999987
                                },
                                "isClosed": false
                            },
                            "2021-10-21": {
                                "neta": 624,
                                "n1": {
                                    "monto": 199.67999999999998,
                                    "descuento": 0.68,
                                    "relativeDisc": 0.68
                                },
                                "n2": {
                                    "monto": 187.20000000000002,
                                    "descuento": 0.7,
                                    "relativeDisc": 0.06249999999999978
                                },
                                "n3": {
                                    "monto": 185.70239999999998,
                                    "descuento": 0.7024,
                                    "relativeDisc": 0.06999999999999995
                                },
                                "n4": {
                                    "monto": 179.71200000000002,
                                    "descuento": 0.712,
                                    "relativeDisc": 0.09999999999999987
                                },
                                "isClosed": false
                            }
                        },
                        "total": {
                            "neta": {
                                "monto": 1872,
                                "relativeDisc": 0
                            },
                            "n1": {
                                "monto": 599.04,
                                "relativeDisc": 0.68
                            },
                            "n2": {
                                "monto": 561.6,
                                "relativeDisc": 0.06249999999999978
                            },
                            "n3": {
                                "monto": 557.1071999999999,
                                "relativeDisc": 0.06999999999999995
                            },
                            "n4": {
                                "monto": 539.1360000000001,
                                "relativeDisc": 0.09999999999999987
                            }
                        },
                        "errors": {
                            "flag": false,
                            "skippable": true,
                            "errors": {}
                        }
                    },
                    "hab2": {
                        "occ": {
                            "adultos": 2,
                            "menores": 0
                        },
                        "fechas": {
                            "2021-10-19": {
                                "neta": 624,
                                "n1": {
                                    "monto": 199.67999999999998,
                                    "descuento": 0.68,
                                    "relativeDisc": 0.68
                                },
                                "n2": {
                                    "monto": 187.20000000000002,
                                    "descuento": 0.7,
                                    "relativeDisc": 0.06249999999999978
                                },
                                "n3": {
                                    "monto": 185.70239999999998,
                                    "descuento": 0.7024,
                                    "relativeDisc": 0.06999999999999995
                                },
                                "n4": {
                                    "monto": 179.71200000000002,
                                    "descuento": 0.712,
                                    "relativeDisc": 0.09999999999999987
                                },
                                "isClosed": false
                            },
                            "2021-10-20": {
                                "neta": 624,
                                "n1": {
                                    "monto": 199.67999999999998,
                                    "descuento": 0.68,
                                    "relativeDisc": 0.68
                                },
                                "n2": {
                                    "monto": 187.20000000000002,
                                    "descuento": 0.7,
                                    "relativeDisc": 0.06249999999999978
                                },
                                "n3": {
                                    "monto": 185.70239999999998,
                                    "descuento": 0.7024,
                                    "relativeDisc": 0.06999999999999995
                                },
                                "n4": {
                                    "monto": 179.71200000000002,
                                    "descuento": 0.712,
                                    "relativeDisc": 0.09999999999999987
                                },
                                "isClosed": false
                            },
                            "2021-10-21": {
                                "neta": 624,
                                "n1": {
                                    "monto": 199.67999999999998,
                                    "descuento": 0.68,
                                    "relativeDisc": 0.68
                                },
                                "n2": {
                                    "monto": 187.20000000000002,
                                    "descuento": 0.7,
                                    "relativeDisc": 0.06249999999999978
                                },
                                "n3": {
                                    "monto": 185.70239999999998,
                                    "descuento": 0.7024,
                                    "relativeDisc": 0.06999999999999995
                                },
                                "n4": {
                                    "monto": 179.71200000000002,
                                    "descuento": 0.712,
                                    "relativeDisc": 0.09999999999999987
                                },
                                "isClosed": false
                            }
                        },
                        "total": {
                            "neta": {
                                "monto": 1872,
                                "relativeDisc": 0
                            },
                            "n1": {
                                "monto": 599.04,
                                "relativeDisc": 0.68
                            },
                            "n2": {
                                "monto": 561.6,
                                "relativeDisc": 0.06249999999999978
                            },
                            "n3": {
                                "monto": 557.1071999999999,
                                "relativeDisc": 0.06999999999999995
                            },
                            "n4": {
                                "monto": 539.1360000000001,
                                "relativeDisc": 0.09999999999999987
                            }
                        },
                        "errors": {
                            "flag": false,
                            "skippable": true,
                            "errors": {}
                        }
                    }
                },
                "total": {
                    "monto": {
                        "neta": {
                            "monto": 3744,
                            "relativeDisc": 0
                        },
                        "n1": {
                            "monto": 1198.08,
                            "relativeDisc": 0.6799999999999999
                        },
                        "n2": {
                            "monto": 1123.2,
                            "relativeDisc": 0.06249999999999989
                        },
                        "n3": {
                            "monto": 1114.2143999999998,
                            "relativeDisc": 0.07000000000000006
                        },
                        "n4": {
                            "monto": 1078.2720000000002,
                            "relativeDisc": 0.09999999999999976
                        }
                    },
                    "levels": {
                        "n1": {
                            "active": true,
                            "enabled": true
                        },
                        "n2": {
                            "active": true,
                            "enabled": true
                        },
                        "n3": {
                            "active": true,
                            "enabled": true
                        },
                        "n4": {
                            "active": true,
                            "enabled": true
                        },
                        "noR": true
                    },
                    "adultos": 4,
                    "menores": 0,
                    "pax": 4
                },
                "hasErrors": false,
                "skippableErrors": true,
                "hasTransfer": true
            }
        },
        "level": 1,
        "extraInfo": {
            "grupo": {
                "grupo": "fall_3DSpecial_2021",
                "grupoCielo": "fall_3DSpecial_2021",
                "discountCode": "fall_3DSpecial_2021",
                "xldPolicy": "24h-ta",
                "cieloUSD": "FAL3D1",
                "cieloMXN": "FAL3D1",
                "mayorista": "DIR",
                "mxAgencia": "CALLMXPH",
                "mxAgenciaNR": "CALLMXNR",
                "usAgencia": "CALLUSPH",
                "usAgenciaNR": "CALLUSNR",
                "mxAgenciaEp": "CALMPHDI",
                "mxAgenciaEpNR": "CALMNRDI",
                "usAgenciaEp": "CALPHDI",
                "usAgenciaEpNR": "CALNRDI",
                "bwInicio": "2021-10-09",
                "bwFin": "2021-10-31",
                "p1": "C,3,6,9,12",
                "p2": "C,3,6,9,12",
                "p3": "C",
                "p4": "C",
                "activo": "1",
                "code1": "1 (jb)",
                "code2": "2 (JC)",
                "code3": "3 (Jc)",
                "code4": "4 (jC)",
                "code5": null,
                "code6": null,
                "code7": null,
                "code8": null,
                "code9": null,
                "Last_Update": "2021-10-05 10:33:01",
                "fixedTC": null,
                "notComision": "0",
                "ccOnly": "0",
                "comAg": "0.025",
                "comGe": "0.005",
                "tipoComision": "1",
                "l1_name": "Publica",
                "l2_name": "Silver",
                "l3_name": "Gold",
                "l4_name": "Platinum",
                "l1_active": "1",
                "l2_active": "1",
                "l3_active": "1",
                "l4_active": "1",
                "l1_allEnabled": "1",
                "l2_allEnabled": "1",
                "l3_allEnabled": "0",
                "l4_allEnabled": "0",
                "isLocal": "0",
                "isOR": "1",
                "hasPaq": "0",
                "hasInsurance": "1",
                "insuranceAtFirst": "1",
                "freeTransfer": "1",
                "freeTransferMinUsdPP": "240",
                "insuranceIncluded": true
            },
            "seguros": {
                "hab1": {
                    "nacional": {
                        "normal": {
                            "prod": "R7",
                            "nombre": "Oasis H 2 PAX - NAC",
                            "cod": "98801",
                            "sufijo": "10A02",
                            "neto_si": 28,
                            "neto_ci": 32.48,
                            "publico_ci": 54,
                            "normal_ci": 160,
                            "dias": 4,
                            "tipoCambio": 20,
                            "pax": 2
                        }
                    },
                    "internacional": {
                        "normal": {
                            "prod": "6D",
                            "nombre": "Oasis H 2 PAX - Int/Recep AC 100",
                            "cod": "98831",
                            "sufijo": "20A02",
                            "neto_si": 37.6,
                            "neto_ci": 43.6,
                            "publico_ci": 73,
                            "normal_ci": 288,
                            "dias": 4,
                            "tipoCambio": 20,
                            "pax": 2
                        },
                        "extendida": {
                            "prod": "6B",
                            "nombre": "Oasis H 2 PAX - Int/Recep AC 250",
                            "cod": "98861",
                            "sufijo": "30A02",
                            "neto_si": 44,
                            "neto_ci": 51.04,
                            "publico_ci": 85,
                            "normal_ci": 400,
                            "dias": 4,
                            "tipoCambio": 20,
                            "pax": 2
                        }
                    }
                },
                "hab2": {
                    "nacional": {
                        "normal": {
                            "prod": "R7",
                            "nombre": "Oasis H 2 PAX - NAC",
                            "cod": "98801",
                            "sufijo": "10A02",
                            "neto_si": 28,
                            "neto_ci": 32.48,
                            "publico_ci": 54,
                            "normal_ci": 160,
                            "dias": 4,
                            "tipoCambio": 20,
                            "pax": 2
                        }
                    },
                    "internacional": {
                        "normal": {
                            "prod": "6D",
                            "nombre": "Oasis H 2 PAX - Int/Recep AC 100",
                            "cod": "98831",
                            "sufijo": "20A02",
                            "neto_si": 37.6,
                            "neto_ci": 43.6,
                            "publico_ci": 73,
                            "normal_ci": 288,
                            "dias": 4,
                            "tipoCambio": 20,
                            "pax": 2
                        },
                        "extendida": {
                            "prod": "6B",
                            "nombre": "Oasis H 2 PAX - Int/Recep AC 250",
                            "cod": "98861",
                            "sufijo": "30A02",
                            "neto_si": 44,
                            "neto_ci": 51.04,
                            "publico_ci": 85,
                            "normal_ci": 400,
                            "dias": 4,
                            "tipoCambio": 20,
                            "pax": 2
                        }
                    }
                },
                "total": {
                    "nacional": {
                        "normal": {
                            "prod": "R7",
                            "nombre": "Oasis H 4 PAX - NAC",
                            "cod": "98803",
                            "sufijo": "10A04",
                            "neto_si": 56,
                            "neto_ci": 64.96,
                            "publico_ci": 109,
                            "normal_ci": 320,
                            "dias": 4,
                            "tipoCambio": 20,
                            "pax": 4
                        }
                    },
                    "internacional": {
                        "normal": {
                            "prod": "6D",
                            "nombre": "Oasis H 4 PAX - Int/Recep AC 100",
                            "cod": "98833",
                            "sufijo": "20A04",
                            "neto_si": 75.2,
                            "neto_ci": 87.2,
                            "publico_ci": 146,
                            "normal_ci": 576,
                            "dias": 4,
                            "tipoCambio": 20,
                            "pax": 4
                        },
                        "extendida": {
                            "prod": "6B",
                            "nombre": "Oasis H 4 PAX - Int/Recep AC 250",
                            "cod": "98863",
                            "sufijo": "30A04",
                            "neto_si": 88,
                            "neto_ci": 102.08,
                            "publico_ci": 171,
                            "normal_ci": 800,
                            "dias": 4,
                            "tipoCambio": 20,
                            "pax": 4
                        }
                    }
                }
            }
        },
        "summarySearch": {
            "inicio": "2021-10-19T05:00:00.000Z",
            "fin": "2021-10-22T05:00:00.000Z",
            "habs": 2,
            "grupo": {
                "grupo": "fall_3DSpecial_2021",
                "gpoTitle": "fall_3DSpecial_2021",
                "hasPaq": "0",
                "hasInsurance": "1"
            },
            "nacionalidad": "internacional",
            "noRestrict": false,
            "isUSD": false,
            "habitaciones": {
                "hab1": {
                    "adultos": 2,
                    "menores": 0
                },
                "hab2": {
                    "adultos": 2,
                    "menores": 0
                }
            },
            "cobertura": "normal"
        },
        "selectedLevel": 1,
        "type": "hotel"
    },
    "userInfo": {
        "user": "",
        "masterloc": {
            "masterlocatorid": "133825",
            "nombreCliente": "Jorge Sanchez",
            "telCliente": "+529982140469",
            "celCliente": null,
            "waCliente": "+529982140469",
            "correoCliente": "geosh2000@gmail.com",
            "zdUserId": "382159209451",
            "cc": null,
            "historyTicket": "537276",
            "esNacional": "2",
            "languaje": "idioma_es",
            "dtCreated": "2021-10-11 10:31:59",
            "userCreated": "29",
            "Last_Update": "2021-10-11 13:08:12",
            "blacklisted": "0",
            "hasTransfer": "0",
            "xldPol": "24h-ta",
            "orId": "586393",
            "orLevel": "Platinum",
            "inicio": "2021-10-21"
        }
    },
    "formRsv": {
        "isNacional": false,
        "rsvNacional": false,
        "rsvInsurance": true,
        "okNacionalidad": true,
        "ticketRef": 123123,
        "splitNames": {
          "apellido": "Sanchez",
          "nombre": "Jorge"
        },
        "zdUser": {
            "zdId": 382159209451,
            "name": "Jorge Sanchez",
            "email": "geosh2000@gmail.com",
            "phone": "+529982140469",
            "whatsapp": "+529982140469",
            "idioma_cliente": "idioma_es",
            "nacionalidad": "internacional",
            "pais": {
                "id": 4,
                "name": "ESTADOS UNIDOS DE AMÉRICA"
            }
        },
        "orLevel": "Platinum",
        "orId": 586393,
        "isNew": false,
        "selectedData": {
            "user": "",
            "masterloc": {
                "masterlocatorid": "133825",
                "nombreCliente": "Jorge Sanchez",
                "telCliente": "+529982140469",
                "celCliente": null,
                "waCliente": "+529982140469",
                "correoCliente": "geosh2000@gmail.com",
                "zdUserId": "382159209451",
                "cc": null,
                "historyTicket": "537276",
                "esNacional": "2",
                "languaje": "idioma_es",
                "dtCreated": "2021-10-11 10:31:59",
                "userCreated": "29",
                "Last_Update": "2021-10-11 13:08:12",
                "blacklisted": "0",
                "hasTransfer": "0",
                "xldPol": "24h-ta",
                "orId": "586393",
                "orLevel": "Platinum",
                "inicio": "2021-10-21"
            }
        }
    }
}

  // @Input() rsvData = {}

  rsvForm: FormGroup

  levelSelected = {
    selected: 1,
    data: {}
  }

  levelsData = {}

  levelNames = {
    'publica': 1,
    'silver': 2,
    'gold': 3,
    'platinum': 4,
  }

  namePattern = "^[A-Za-záéíóúÁÉÍÓÚ]+([\\s]{1}[A-Za-záéíóúÁÉÍÓÚ]+)*$"

  constructor(
            private fb: FormBuilder,
            private _api: ApiService,
            private _init: InitService,
          ) { 
            
  }
  
  ngOnInit(): void {

    if( this.rsvData['habSelected'] ){
      this.buildForm( this.rsvData )
      this.setLevelsData( this.rsvData['habSelected']['hotel']['tarifas'][this.displayDate( this.rsvData['habSelected']['summarySearch']['inicio'], 'YYYY-MM-DD' )] )
      this.chgLevel( this.rsvData['habSelected']['selectedLevel'], this.rsvData['habSelected']['hotel']['tarifas'][ this.displayDate( this.rsvData['habSelected']['summarySearch']['inicio'], 'YYYY-MM-DD' )]['n' + this.rsvData['habSelected']['selectedLevel']] ) 
    }
    console.log( this.rsvData )
  }
  
  ngOnChanges( changes: SimpleChanges ){
    console.log(changes)
    if( changes['rsvData'] && changes['rsvData']['currentValue']['habSelected'] ){

      async () => {
        let curr = changes['rsvData']['currentValue']

        // this.buildForm( curr )
        
        this.levelsData = await this.setLevelsData( this.rsvData['habSelected']['hotel']['tarifas'][this.displayDate( this.rsvData['habSelected']['summarySearch']['inicio'], 'YYYY-MM-DD' )] )
        this.chgLevel( curr['habSelected']['selectedLevel'], this.levelsData['n' + curr['habSelected']['selectedLevel']] ) 
      }

    }

  }

  createForm(){
    let sum = this.rsvData['habSelected']['summarySearch']
    let zd = this.rsvData['formRsv']['zdUser']

    this.rsvForm =  this.fb.group({
      inicio:       [{ value: moment(sum['inicio']).format('YYYY-MM-DD'),   disabled: false }, [ Validators.required ] ],
      fin:          [{ value: moment(sum['fin']).format('YYYY-MM-DD'),      disabled: false }, [ Validators.required ] ],
      habs:         [{ value: sum['habs'],                                  disabled: false }, [ Validators.required ] ],
      grupo:        [{ value: sum['grupo']['grupo'],                        disabled: false }, [ Validators.required ] ],
      nacionalidad: [{ value: this.rsvData['formRsv']['isNacional'] ? 1 : 2,  disabled: false }, [ Validators.required ] ],
      isUSD:        [{ value: sum['isUSD'] ? 'MXN' : 'USD',                 disabled: false }, [ Validators.required ] ],
      hasInsurance: [{ value: this.rsvData['formRsv']['rsvInsurance'],      disabled: false }, [Validators.required ] ],
      habitaciones: this.fb.group({})
    })
  }

  buildForm( curr ){

    let hData = curr['habSelected']
    let hGpo = hData['extraInfo']['grupo']
    let hSum = hData['summarySearch']
    let usd = hSum['isUSD']
    let user = curr['formRsv']['zdUser']
    let split = curr['formRsv']['splitNames']

    this.createForm()

    if( !this.rsvData['formRsv']['isNew'] ){
      if( this.rsvForm.get('masterdata') ){
        this.rsvForm.removeControl('masterdata')
      }

      this.rsvForm.addControl('masterdata', this.fb.group({
          nombreCliente:  [ user.name, [ Validators.required ]],
          telCliente:     [ user.phone, [ Validators.required ]],
          celCliente:     [ '' ],
          waCliente:      [ user.whatsapp, [ Validators.required ]],
          correoCliente:  [ user.email, [ Validators.required ]],
          zdUserId:       [ user.zdId, [ Validators.required ]],
          esNacional:     [ user.nacionalidad == 'nacional' ? 1 : 2, [ Validators.required ]],
          languaje:       [ user.idioma_cliente, [ Validators.required ]],
          hasTransfer:    [ this.rsvData['habSelected']['hotel']['habs']['hasTransfer'] ? 1 : 0, [ Validators.required ]],
          xldPol:         [ this.rsvData['habSelected']['extraInfo']['grupo']['xldPolicy'], [ Validators.required ]],
          orId:           [ this.rsvData['formRsv']['orId'], [ Validators.required ]],
          orLevel:        [ this.rsvData['formRsv']['orLevel'], [ Validators.required ]],
        }))

    }
    
    for( let i = 1; i <= curr['habSelected']['summarySearch']['habs']; i++ ){
      let pax = curr['habSelected']['summarySearch']['habitaciones']['hab' + i]['adultos'] + curr['habSelected']['summarySearch']['habitaciones']['hab' + i]['menores']

        // BUILD PAX HABITACION
      let adultos = curr['habSelected']['summarySearch']['habitaciones']['hab' + i]['adultos']
      let menores = curr['habSelected']['summarySearch']['habitaciones']['hab' + i]['menores'] > 2 ? 2 : curr['habSelected']['summarySearch']['habitaciones']['hab' + i]['menores']
      let juniors = curr['habSelected']['summarySearch']['habitaciones']['hab' + i]['menores'] > 2 ? 3 - menores : 0

      // BUILD MONTOS HABITACION
      let habMonto = curr['habSelected']['hotel']['habs']['porHabitacion']['hab' + i]

      if( !this.rsvForm.get('habitaciones.hab' + i) ){
        
        (this.rsvForm.get('habitaciones') as FormGroup).addControl('hab' + i, this.fb.group({
          hotel:        this.fb.group({
            item:       this.fb.group({
              itemType:     [{ value: 1,  disabled: false }, [ Validators.required ] ],
              isQuote:      [{ value: 1,  disabled: false }, [ Validators.required ] ],
              zdTicket:     [{ value: curr['formRsv']['ticketRef'],  disabled: false }, [ this._init.checkSingleCredential('rsv_omitTicket') ? Validators.required : null ] ],
            }),
            hotel             : this.fb.group({
              hotel           : [ hData.hotel.hotel, [ Validators.required ] ],
              categoria       : [ hData.hotel.habCode, [ Validators.required ] ],
              mdo             : [ hGpo.mayorista, [ Validators.required ] ],
              agencia         : [ hGpo[(usd ? 'us' : 'mx') + 'Agencia' + (hData.hotel.tarifa_pp == 0 ? 'Ep' : '') + ( hData.hotel.isNR == 1 ? 'NR' : '')], [ Validators.required ] ],
              gpoTfa          : [ hGpo[ usd ? 'cieloUSD' : 'cieloMXN'], [ Validators.required ] ],
              adultos         : [ adultos, [ Validators.required ] ],
              juniors         : [ juniors, [ Validators.required ] ],
              menores         : [ menores, [ Validators.required ] ],
              inicio          : [ moment(hSum['inicio']).format('YYYY-MM-DD'), [ Validators.required ] ],
              fin             : [ moment(hSum['fin']).format('YYYY-MM-DD'), [ Validators.required ] ],
              noches          : [ moment(hSum['fin']).diff(moment(hSum['inicio']), 'days'), [ Validators.required ] ],
              notasHotel      : [ '', [] ],
              isLocal         : [ hGpo.isLocal, [ Validators.required ] ],
              isNR            : [ hData.hotel.isNR, [ Validators.required ] ],
              gpoCC           : [ hGpo.grupo, [ Validators.required ] ],
              bedPreference   : [ '', [ Validators.required ] ],
              titular         : [ user['name'], [ Validators.required ] ],
              htl_nombre_1    : [ split.nombre, [ Validators.required, Validators.pattern( this.namePattern ) ] ],
              htl_apellido_1  : [ split.apellido, [ Validators.required, Validators.pattern( this.namePattern ) ] ]
            })
          }),
          pax:          [adultos + juniors + menores, [ Validators.required ] ]
        }))

        
        for( let x = 2; x <= pax; x++ ){
          (this.rsvForm.get('habitaciones.hab' + i + '.hotel.hotel') as FormGroup).addControl('htl_nombre_' + x, new FormControl('', Validators.pattern(this.namePattern)));
          (this.rsvForm.get('habitaciones.hab' + i + '.hotel.hotel') as FormGroup).addControl('htl_apellido_' + x, new FormControl('', Validators.pattern(this.namePattern)));
        }
      }

      this.rsvForm.get('habitaciones.hab' + i + '.hotel.hotel.htl_nombre_1').valueChanges.subscribe( x => { 
        let name = this.rsvForm.get('habitaciones.hab' + i + '.hotel.hotel.htl_nombre_1').value + ' ' + this.rsvForm.get('habitaciones.hab' + i + '.hotel.hotel.htl_apellido_1').value
        this.rsvForm.get('habitaciones.hab' + i + '.hotel.hotel.titular').setValue( name )
      })

      this.rsvForm.get('habitaciones.hab' + i + '.hotel.hotel.htl_apellido_1').valueChanges.subscribe( x => { 
        let name = this.rsvForm.get('habitaciones.hab' + i + '.hotel.hotel.htl_nombre_1').value + ' ' + this.rsvForm.get('habitaciones.hab' + i + '.hotel.hotel.htl_apellido_1').value
        this.rsvForm.get('habitaciones.hab' + i + '.hotel.hotel.titular').setValue( name )
      })
    }

    // BUILD SEGUROS
    this.buildInsurance( hData, user )
    this.buildMonto( hData )

    console.log( this.rsvForm.value )
  }

  buildMonto( hData = this.rsvData['habSelected'] ){

    let hGpo = hData['extraInfo']['grupo']
    let hSum = hData['summarySearch']
    let curr = this.rsvData
    let usd = hSum['isUSD']

    for( let i = 1; i <= curr['habSelected']['summarySearch']['habs']; i++ ){
      // BUILD MONTOS HABITACION
      let habMonto = curr['habSelected']['hotel']['habs']['porHabitacion']['hab' + i]

      if( this.rsvForm.get('habitaciones.hab' + i + '.hotel.monto') ){
        (this.rsvForm.get('habitaciones.hab' + i + '.hotel') as  FormGroup).removeControl('monto')
      }
  
      (this.rsvForm.get('habitaciones.hab' + i + '.hotel') as FormGroup).addControl('monto', this.fb.group({
        monto:          [{ value: +(habMonto.total['n' + this.levelSelected.selected ].monto * (usd ? 1 : hData.hotel.tipoCambio)).toFixed(2),  disabled: false }, [ Validators.required ] ],
        montoOriginal:  [{ value: +(habMonto.total.neta.monto * (usd ? 1 : hData.hotel.tipoCambio)).toFixed(2),  disabled: false }, [ Validators.required ] ],
        montoParcial:   [{ value: +(habMonto.total['n' + this.levelSelected.selected ].monto * (usd ? 1 : hData.hotel.tipoCambio)).toFixed(2),  disabled: false }, [ Validators.required ] ],
        moneda:         [{ value: usd ? 'USD' : 'MXN',  disabled: false }, [ Validators.required ] ],
        lv:             [{ value: this.levelSelected.selected,  disabled: false }, [ Validators.required ] ],
        lv_name:        [{ value: this.levelSelected.data['code'],  disabled: false }, [ Validators.required ] ],
        grupo:          [{ value: hGpo[ usd ? 'cieloUSD' : 'cieloMXN'],  disabled: false }, [ Validators.required ] ],
        promo:          [{ value: hGpo['p' + this.levelSelected.selected],  disabled: false }, [ Validators.required ] ],
      }))
    }
  }

  buildInsurance(  hData = this.rsvData['habSelected'], user = this.rsvData['formRsv']['zdUser'] ){
    
    let hSum = hData['summarySearch']
    let curr = this.rsvData
    let usd = hSum['isUSD']
    let nacionalidad = user.nacionalidad
    let cobertura = hSum.cobertura

    if( this.rsvForm.get('hasInsurance').value ){

      for( let i = 1; i <= curr['habSelected']['summarySearch']['habs']; i++ ){
        let pax = curr['habSelected']['summarySearch']['habitaciones']['hab' + i]['adultos'] + curr['habSelected']['summarySearch']['habitaciones']['hab' + i]['menores']
  
          // BUILD PAX HABITACION
        let adultos = curr['habSelected']['summarySearch']['habitaciones']['hab' + i]['adultos']
        let menores = curr['habSelected']['summarySearch']['habitaciones']['hab' + i]['menores'] > 2 ? 2 : curr['habSelected']['summarySearch']['habitaciones']['hab' + i]['menores']
        let juniors = curr['habSelected']['summarySearch']['habitaciones']['hab' + i]['menores'] > 2 ? 3 - menores : 0

        // console.log('build Insurance ' + i, this.rsvForm.value)

        let seguro = hData['extraInfo']['seguros']['hab' + i][nacionalidad][cobertura];
        let sg_monto = seguro.publico_ci * (usd ? 1 : seguro.tipoCambio );

        if( this.rsvForm.get('habitaciones.hab' + i + '.insurance') ){
          (this.rsvForm.get('habitaciones.hab' + i) as  FormGroup).removeControl('insurance')
        }

        (this.rsvForm.get('habitaciones.hab' + i) as FormGroup).addControl('insurance', this.fb.group({
          item:       this.fb.group({
            itemType:     [{ value: 10,  disabled: false }, [ Validators.required ] ],
            isQuote:      [{ value: 1,  disabled: false }, [ Validators.required ] ],
            zdTicket:     [{ value: curr['formRsv']['ticketRef'],  disabled: false }, [ this._init.checkSingleCredential('rsv_omitTicket') ? Validators.required : null ] ],
          }),
          monto:      this.fb.group({
            montoOriginal:  [{ value: sg_monto,  disabled: false }, [ Validators.required ] ],
            monto:          [{ value: sg_monto,  disabled: false }, [ Validators.required ] ],
            moneda:         [{ value: usd ? 'USD' : 'MXN',  disabled: false }, [ Validators.required ] ],
            lv:             [{ value: 1,  disabled: false }, [ Validators.required ] ],
            lv_name:        [{ value: 'default',  disabled: false }, [ Validators.required ] ],
            grupo:          [{ value: 'assistCard',  disabled: false }, [ Validators.required ] ],
            promo:          [{ value: 'C',  disabled: false }, [ Validators.required ] ],
            montoParcial:   [{ value: sg_monto,  disabled: false }, [ Validators.required ] ],
          }),
          insurance:  this.fb.group({
            sg_pax:       [{ value: adultos + juniors + menores,  disabled: false }, [ Validators.required ] ],
            sg_hotel:     [{ value: hData.hotel.hotel,  disabled: false }, [ Validators.required ] ],
            sg_inicio:    [{ value: moment(hSum['inicio']).format('YYYY-MM-DD'),  disabled: false }, [ Validators.required ] ],
            sg_fin:       [{ value: moment(hSum['fin']).format('YYYY-MM-DD'),  disabled: false }, [ Validators.required ] ],
            sg_mdo:       [{ value: nacionalidad,  disabled: false }, [ Validators.required ] ],
            sg_cobertura: [{ value: cobertura,  disabled: false }, [ Validators.required ] ],
          }),
        }));

      }

    }
  }

  displayDate( dt, f ){
    return moment(dt).format(f)
  }

  chgLevel( l, d ){
    this.levelSelected['selected'] = l
    this.levelSelected['data'] = d

    this.buildMonto()
  }

  setLevelsData( d ){

    return new Promise(resolve => {
      this.levelsData = {
        'n1': d['n1'],
        'n2': d['n2'],
        'n3': d['n3'],
        'n4': d['n4']
      }

      resolve( true )
    })

  }

  levelCompare( l: string ){

    let orLevel = this.rsvData['formRsv']['orLevel'] != null ? this.rsvData['formRsv']['orLevel'].toLowerCase() : 'publica'

    l = l.toLowerCase()

    return this.levelNames[l] < this.levelNames[orLevel]
  }

  selectBestLevel(){

    let orLevel = this.rsvData['formRsv']['orLevel'] != null ? this.rsvData['formRsv']['orLevel'].toLowerCase() : 'publica'
    let bestLv = this.levelNames[orLevel]
    
    for( let x = bestLv; x > this.levelSelected.selected; x-- ){
      if( this.levelsData['n' + x]['active'] == 1 ){
        this.chgLevel( x, this.levelsData['n' + x])
        return true
      }
    }

    Swal.fire('Error', 'Los niveles con mayor descuento no se encuentran disponibles en este momento. Se ha mantenido el nivel elegido originalmente.', 'error')
  }

  changeCobertura(){
    let ncob = this.rsvData['habSelected']['summarySearch']['cobertura'] == 'normal' ? 'extendida' : 'normal' 

    this.rsvData['habSelected']['summarySearch']['cobertura'] = ncob

    this.buildInsurance()
  }

  getDifCobertura( bool = false){

    let cobNueva = this.rsvData['habSelected']['extraInfo']['seguros']['total']['internacional'][this.rsvData['habSelected']['summarySearch']['cobertura']]['publico_ci']
    let cobActual = this.rsvData['habSelected']['extraInfo']['seguros']['total']['internacional'][ this.rsvData['habSelected']['summarySearch']['cobertura'] == 'normal' ? 'extendida' : 'normal' ]['publico_ci'] 

    let dif = (cobActual - cobNueva) * ( this.rsvData['habSelected']['summarySearch']['isUSD'] ? 1 : this.rsvData['habSelected']['hotel']['tipoCambio'] )

    return bool ? dif >= 0 : dif
  }

  addInsurance(){
    this.rsvData['formRsv']['rsvInsurance'] = true
    this.rsvData['formRsv']['rsvNacional'] = this.rsvData['formRsv']['isNacional']
    this.rsvData['habSelected']['summarySearch']['cobertura'] = 'normal'

    this.buildForm( this.rsvData )
  }

  submitRsv(){
    console.log(this.rsvForm.valid, this.rsvForm)
    console.log(this.rsvForm.value)
  }

  getErrorMessage( ctrl, form = this.rsvForm ) {

   
    if (form.get(ctrl).hasError('required')) {
      return 'Este valor es obligatorio';
    }
    
    if (form.get(ctrl).hasError('email')) {
      return 'El valor debe tener formato de email';
    }
    
    if (form.get(ctrl).hasError('min')) {
      return 'El valor debe ser mayor o igual a ' + form.get(ctrl).errors.min.min;
    }
    
    if (form.get(ctrl).hasError('max')) {
      return 'El valor debe ser menor o igual a ' + form.get(ctrl).errors.max.max;
    }
    
    if (form.get(ctrl).hasError('pattern')) {
      return 'Solo letras. No "ñ" ni apóstrofes. Revisa los espacios al inicio y al final';
    }
    
    if (form.get(ctrl).hasError('finMenorIgual')) {
      return 'La fecha final debe ser mayor al inicio';
    }
    
    if (form.get(ctrl).hasError('inicioPasado')) {
      return 'La fecha inicial no puede ser en el pasado';
    }
    
    return 'El campo tiene errores';
  }

  digControls( c, err, n = '' ){
    // console.log('run dig')
    let arr = []
    if( c['controls'] ){
      for( let ct in c['controls'] ){
        if( c['controls'][ct].status == 'INVALID' ){
          arr.push({ctrl: ct, 'data': this.digControls( c['controls'][ct], err, n + '/' + ct )}) 
        }
      }
    }else{
      if( c.status == 'INVALID' ){
        // console.log(n, c )
        let error = {ctrl: n, 'errores': c.errors }
        arr.push( error ) 
        err.push( error )
      }
    }

    return arr
  }

  viewErrors(){

    let errors = []
    let ctrl = this.rsvForm
    let html = ""

    this.digControls( ctrl, errors )

    for( let err of errors ){
      html += `<b>${ err.ctrl }:</b><pre>${ JSON.stringify( err.errores ) }</pre><br>`
    }

    // console.log( errors )

    Swal.fire({
      title: `<strong>Errores en la información establecida</strong>`,
      icon: 'error',
      html: `<div style='max-height: 60vh; overflow: auto'><code>${ html }</code></div>`,
      focusConfirm: true,
      confirmButtonText: 'Aceptar'
    })
  }
}
