// Agrupa todos los casos de prueba relacionados con la reserva de habitaciones.
describe('Reserva de habitaciones', () => {

    // Se ejecuta antes de cada caso de prueba (it).
    beforeEach(() => {

        // Ignora un error conocido de React para que no interrumpa la ejecución del test.
        cy.on('uncaught:exception', (err) => {

            if (err.message.includes('Minified React error #418')) {
                return false;
            }

        });

        // Accede a la página principal de la aplicación.
        cy.visit('https://automationintesting.online/');

        // Guarda el input de fecha de inicio como un alias
        // para reutilizarlo posteriormente.
        cy.get(':nth-child(1) > .react-datepicker-wrapper > .react-datepicker__input-container > .form-control')
            .as('fechaInicio');

        // Guarda el input de fecha de fin como un alias
        // para reutilizarlo posteriormente.
        cy.get(':nth-child(2) > .react-datepicker-wrapper > .react-datepicker__input-container > .form-control')
            .as('fechaFin');

    });

    // Caso de prueba:
    // Verifica que el costo de la estadía se calcule correctamente.
    it('Debe calcular correctamente el costo de la estadía', () => {

        // Carga los datos del fixture "availability.json".
        // Este archivo contiene las fechas que se ingresarán en los inputs.
        cy.fixture('availability').then((datos) => {

            // Ejecuta el comando personalizado que:
            // - Completa las fechas.
            // - Busca disponibilidad.
            // - Reserva la habitación.
            // - Calcula la cantidad de noches y la guarda como alias.
            cy.reservarHabitacion(datos);

            // Recupera la cantidad de noches calculada
            // dentro del comando personalizado.
            cy.get('@noches').then((noches) => {

                // Obtiene el precio por noche mostrado en la página.
                cy.get('.fs-2')
                    .invoke('text')
                    .then((textoPrecio) => {

                        // Elimina cualquier carácter que no sea un número
                        // (£, espacios, etc.) y convierte el resultado a Number.
                        const precioPorNoche = Number(
                            textoPrecio.replace(/[^\d]/g, '')
                        );

                        // Calcula el subtotal esperado:
                        // Precio por noche × cantidad de noches.
                        const subtotalEsperado =
                            precioPorNoche * noches;

                        // Busca la fila que contiene la palabra "nights".
                        cy.contains('nights')
                            .parent()
                            .find('span')
                            .eq(1)
                            .invoke('text')
                            .then((textoSubtotal) => {

                                // Obtiene el subtotal mostrado por la aplicación
                                // y lo convierte a número.
                                const subtotal = Number(
                                    textoSubtotal.replace(/[^\d]/g, '')
                                );

                                // Compara el subtotal calculado por el test
                                // con el subtotal mostrado por la aplicación.
                                expect(subtotal)
                                    .to.equal(subtotalEsperado);

                            });

                    });

            });

        });

    });

});