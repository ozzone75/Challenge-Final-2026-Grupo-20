Cypress.on('uncaught:exception', (err, runnable) => {
    return false
})

describe('Reservas - Restful Booker', () => {

    beforeEach(() => {
        cy.visit('https://automationintesting.online/')
        cy.get('a.btn.btn-primary', { timeout: 1000 }).should('be.visible')

    })

    it('Enviar formulario sin completar ningún campo', () => {
        cy.get(':nth-child(1) > .card > .card-footer > .btn').click()
        cy.get('#doReservation').click()
        cy.get('.btn-primary').click()
        cy.get('.alert').should('be.visible')

    })

    it('Verificar mensajes de error correspondientes', () => {
        cy.get(':nth-child(1) > .card > .card-footer > .btn').click()
        cy.get('#doReservation').click()
        cy.get('.btn-primary').click()
        cy.get('.alert').should('be.visible')
        cy.get('.alert').should('contain', 'Firstname should not be blank')
        cy.get('.alert').should('contain', 'size must be between 3 and 18')
        cy.get('.alert').should('contain', 'must not be empty')
        cy.get('.alert').should('contain', 'size must be between 11 and 21')
        cy.get('.alert').should('contain', 'Lastname should not be blank')
        cy.get('.alert').should('contain', 'size must be between 3 and 30')

    })

    it('Verificar que no se realizó ninguna reserva', () => {
        cy.get(':nth-child(1) > .card > .card-footer > .btn').click()
        cy.get('#doReservation').click()
        cy.get('.btn-primary').click()
        cy.get('.alert').should('be.visible')
        cy.url().should('not.include', 'confirmation')

    })

    it('Email sin dominio', () => {
        cy.get(':nth-child(1) > .card > .card-footer > .btn').click()
        cy.get('#doReservation').click()

        cy.fixture('reserva.json').then((reserva) => {
            cy.completarFormularioReserva(reserva.nombre, reserva.apellido, reserva.emailSinDominio, reserva.telefono)
        })

        cy.get('.btn-primary').click()
        cy.get('.alert').should('be.visible')
        cy.get('.alert').should('contain', 'must be a well-formed email address')
        cy.url().should('not.include', 'confirmation')
        
    })

    it('Teléfono con menos dígitos de los requeridos', () => {
        cy.get(':nth-child(1) > .card > .card-footer > .btn').click()
        cy.get('#doReservation').click()
        cy.fixture('reserva.json').then((reserva) => {
            cy.completarFormularioReserva(reserva.nombre, reserva.apellido, reserva.email, reserva.TelefonoCorto)
        })

        cy.get('.btn-primary').click()
        cy.get('.alert').should('be.visible')
        cy.get('.alert').should('contain', 'size must be between 11 and 21')
        cy.url().should('not.include', 'confirmation')

    })

    it('Nombre con un solo carácter', () => {
        cy.get(':nth-child(1) > .card > .card-footer > .btn').click()
        cy.get('#doReservation').click()
        cy.fixture('reserva.json').then((reserva) => {
            cy.completarFormularioReserva(reserva.nombreCorto, reserva.apellido, reserva.email, reserva.telefono)
        })

        cy.get('.btn-primary').click()
        cy.get('.alert').should('be.visible')
        cy.get('.alert').should('contain', 'size must be between 3 and 18')
        cy.url().should('not.include', 'confirmation')
        
    })

    it('Nombre con espacios al inicio y al final', () => {
        cy.get(':nth-child(1) > .react-datepicker-wrapper > .react-datepicker__input-container > .form-control').type('11/07/2026')
        cy.get(':nth-child(2) > .react-datepicker-wrapper > .react-datepicker__input-container > .form-control').type('13/07/2026')
        cy.get(':nth-child(1) > .card > .card-footer > .btn').click()
        cy.get('#doReservation').click()
        cy.fixture('reserva.json').then((reserva) => {
            cy.completarFormularioReserva(reserva.nombreConEspacios, reserva.apellidoConEspacios, reserva.email, reserva.telefono)
        })

        cy.get('.btn-primary').click()
        cy.get('.alert').should('not.exist')
        cy.get(':nth-child(1) > .col-lg-4 > .card > .card-body > .card-title').should('contain.text', 'Booking Confirmed') // Hay que cambiar los nombres para probarlo porque si no tira error!

    })

})  // ← cierra el describe