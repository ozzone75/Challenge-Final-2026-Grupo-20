// ***********************************************
// This example commands.js shows you how to
// create various custom commands and overwrite
// existing commands.
//
// For more comprehensive examples of custom
// commands please read more here:
// https://on.cypress.io/custom-commands
// ***********************************************
//
//
// -- This is a parent command --
// Cypress.Commands.add('login', (email, password) => { ... })
//
//
// -- This is a child command --
// Cypress.Commands.add('drag', { prevSubject: 'element'}, (subject, options) => { ... })
//
//
// -- This is a dual command --
// Cypress.Commands.add('dismiss', { prevSubject: 'optional'}, (subject, options) => { ... })
//
//
// -- This will overwrite an existing command --
// Cypress.Commands.overwrite('visit', (originalFn, url, options) => { ... })

Cypress.Commands.add('completarFormularioReserva', (nombre, apellido, email, telefono) => {
    cy.get('[name="firstname"]').type(nombre)
    cy.get('[name="lastname"]').type(apellido)
    cy.get('[name="email"]').type(email)
    cy.get('[name="phone"]').type(telefono)
})

/*Comando personalizado para completar los campos del formulario de reserva.
 Recibe un objeto guest con las propiedades: firstname, lastname, email y phone.*/
Cypress.Commands.add('fillBookingForm', (guest) => {
    cy.get('[name="firstname"]').clear().type(guest.firstname)
    cy.get('[name="lastname"]').clear().type(guest.lastname)
    cy.get('[name="email"]').clear().type(guest.email)
    cy.get('[name="phone"]').clear().type(guest.phone)
})

/*Comando personalizado para seleccionar fechas en el calendario. Navega al mes siguiente
para usar fechas futuras y evitar conflictos 409 por fechas ya reservadas. Simula un arrastre
manteniendo el boton izquierdo presionado entre check-in y check-out.*/
Cypress.Commands.add('selectBookingDates', () => {
    /*Avanzar al mes siguiente para asegurar fechas futuras disponibles*/
    cy.get('.rbc-toolbar').contains('button', 'Next').click()

    const diasDelMes = '.rbc-month-row .rbc-day-bg:not(.rbc-off-range-bg)'

    /*Presionar el boton izquierdo en el quinto dia del mes siguiente (check-in)*/
    cy.get(diasDelMes).eq(4)
        .trigger('mousedown', { which: 1, buttons: 1, force: true })

    /*Arrastrar por las celdas intermedias manteniendo el boton presionado*/
    cy.get(diasDelMes).eq(5).trigger('mousemove', { buttons: 1, force: true })
    cy.get(diasDelMes).eq(6).trigger('mousemove', { buttons: 1, force: true })
    cy.get(diasDelMes).eq(7).trigger('mousemove', { buttons: 1, force: true })

    /*Soltar el boton en el noveno dia del mes siguiente (check-out)*/
    cy.get(diasDelMes).eq(8)
        .trigger('mousemove', { buttons: 1, force: true })
        .trigger('mouseup', { which: 1, buttons: 0, force: true })
})


// Convierte una fecha en formato "dd/MM/yyyy" a un objeto Date de JavaScript.
function convertirFecha(fecha) {

    // Divide la fecha por "/" y convierte cada parte a número.
    // Ejemplo: "10/06/2026" -> [10, 6, 2026]
    const [dia, mes, anio] = fecha.split('/').map(Number);

    // Crea un objeto Date.
    // Se resta 1 al mes porque JavaScript numera los meses de 0 a 11.
    return new Date(anio, mes - 1, dia);
}

// Comando personalizado de Cypress que realiza el flujo de reserva.
Cypress.Commands.add('reservarHabitacion', (datos) => {

    // Completa el campo de fecha de inicio con el valor recibido desde el fixture.
    cy.get('@fechaInicio')
        .clear()
        .type(datos.fechaInicio);

    // Completa el campo de fecha de fin con el valor recibido desde el fixture.
    cy.get('@fechaFin')
        .clear()
        .type(datos.fechaFin);

    // Calcula la cantidad de noches entre ambas fechas.
    // La resta entre dos objetos Date devuelve la diferencia en milisegundos.
    // Luego se convierte a días.
    const noches =
        (convertirFecha(datos.fechaFin) - convertirFecha(datos.fechaInicio))
        / (1000 * 60 * 60 * 24);

    // Guarda la cantidad de noches como un alias para reutilizarla
    // posteriormente en otros comandos o tests.
    cy.wrap(noches).as('noches');

    // Hace clic en el botón "Check Availability".
    cy.get('.col-8 > .btn').click();

    // Selecciona la primera habitación disponible.
    cy.get(':nth-child(1) > .card > .card-footer > .btn').click();

    // Verifica que el evento de la reserva aparezca en el calendario.
    cy.get('.rbc-event')
        .should('be.visible');

    // Verifica que el evento indique que la habitación fue seleccionada.
    cy.get('.rbc-event-content')
        .should('contain', 'Selected');

});