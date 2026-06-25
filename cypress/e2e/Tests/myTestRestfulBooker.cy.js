/// <reference types="cypress" />

describe('Reserva exitosa como usuario invitado', () => {

  beforeEach(() => {
    /*Cargamos los datos del usuario invitado desde el fixture antes de cada test*/
    cy.fixture('guestBooking').as('guestData')
  })

  it('Completar reserva exitosa como usuario invitado', function () {

    /*Navegamos a la pagina principal y verificamos que hayan habitaciones disponibles*/
    cy.visit('/')

    /*Verificamos que la URL corresponde al sitio correcto*/
    cy.url().should('include', 'automationintesting.online')

    /*Verificamos que hay al menos una tarjeta de habitacion visible en la pagina*/
    cy.get('#rooms')
      .should('exist')
      .and('have.length.gte', 1)

    /*Seleccionamos una habitacion y abrimos el formulario de reserva haciendo click en el boton correspondiente*/
    cy.get('#rooms > .container > .row > :nth-child(1)').first().should('be.visible')

    /*Hacemos click en "Book now" de la primera habitacion de la lista (Single)*/
    cy.contains('Book now').first().click()

    /*Verificamos que el calendario de seleccion de fechas esta presente*/
    cy.get('.rbc-calendar').should('be.visible')

    /*Seleccionamos el rango de fechas arrastrando sobre el calendario*/
    cy.selectBookingDates()

    /*Clickeamos en "Do reservation" para avanzar con el formulario de reserva*/
    cy.get('#doReservation').click()

    /*Verificamos que todos los campos del formulario de reserva son visibles*/
    cy.get('[name="firstname"]').should('be.visible')
    cy.get('[name="lastname"]').should('be.visible')
    cy.get('[name="email"]').should('be.visible')
    cy.get('[name="phone"]').should('be.visible')

    /*Completamos el formulario con datos validos (nombre, apellido, email, telefono y fechas)
      Rellenamos los campos de texto usando el comando personalizado y los datos del fixture*/
    cy.fillBookingForm(this.guestData)

    /*Interceptamos la solicitud POST antes del submit. Solicitamos reservar con fechas
      aleatorias en el body para evitar errores 409 en el sitio: cada ejecucion usa un rango
      unico entre 60 y 360 dias en adelante, con 3 noches de estadía.*/
    cy.intercept('POST', '/api/booking', (req) => {
      const hoy = new Date()
      const offset = Math.floor(Math.random() * 300) + 60
      const checkin = new Date(hoy)
      checkin.setDate(hoy.getDate() + offset)
      const checkout = new Date(checkin)
      checkout.setDate(checkin.getDate() + 3)
      const formatearFecha = (d) => d.toISOString().split('T')[0]
      req.body.bookingdates = { checkin: formatearFecha(checkin), checkout: formatearFecha(checkout) }
    }).as('createBooking')

    /*Hacemos click en el boton de confirmacion (texto exacto "Reserve Now")*/
    cy.get('.btn-primary').click()

    /*Asercion de API: validamos que el servidor respondio con 201 Created*/
    cy.wait('@createBooking').its('response.statusCode').should('eq', 201)

    /*Asercion de UI: validamos que el mensaje de confirmacion aparece en pantalla*/
    cy.contains('Booking Confirmed', { timeout: 2000 }).should('be.visible')
  })
})
