/// <reference types="cypress" />

describe('Formulario de Contacto - Shady Meadows', () => {

    beforeEach(() => {
        // Ignorar errores de React/Next.js
        cy.on('uncaught:exception', (err) => {
            if (err.message.includes('Minified React error #418')) {
                return false;
            }
            return true;
        });

        cy.visit('https://automationintesting.online/');
        cy.get('body').should('be.visible');
        cy.scrollTo('bottom');
        cy.get('form').last().should('be.visible');
    });

    describe('Formulario de contacto', () => {

        it('Debería completar el formulario con datos válidos y mostrar confirmación', () => {
            const datos = {
                name: 'Juan Perez',
                email: 'juan.perez@test.com',
                phone: '12345678901',
                subject: 'Consulta sobre disponibilidad',
                message: 'Hola, me gustaría saber si tienen habitaciones disponibles para el próximo fin de semana. Necesito una habitación doble para 3 noches.'
            };

            // ✅ URL correcta: /api/message
            cy.intercept('POST', '/api/message').as('contactRequest');

            cy.get('form').last().within(() => {
                cy.get('#name').type(datos.name);
                cy.get('#email').type(datos.email);
                cy.get('#phone').type(datos.phone);
                cy.get('#subject').type(datos.subject);
                cy.get('#description').type(datos.message);

                cy.get('button[type="button"]').click();
            });

            // ✅ Esperar y validar que la respuesta sea exitosa (200 o 204)
            cy.wait('@contactRequest').then((interception) => {
                // Verificar que la respuesta sea exitosa (200 o 204)
                const status = interception.response.statusCode;
                expect(status).to.be.oneOf([200, 204]);
                cy.log(`✅ API respondió con código: ${status} (éxito)`);
            });

            // Validar UI
            cy.contains(`Thanks for getting in touch ${datos.name}!`).should('be.visible');
            cy.contains(datos.subject).should('be.visible');
            cy.contains('as soon as possible.').should('be.visible');
        });
    });
});