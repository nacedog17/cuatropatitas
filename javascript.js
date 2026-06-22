document.addEventListener('DOMContentLoaded', () => {
    
    // =========================================================================
    // 🌍 VARIABLES GLOBALES Y CONFIGURACIÓN COMÚN
    // =========================================================================
    const dateInput = document.getElementById('select-date');
    const timeSelect = document.getElementById('select-time');
    const appointmentForm = document.getElementById('appointment-form');
    const phoneNumber = "34661103145"; // Teléfono de Cuatro Patitas

    // Configurar fecha mínima (Hoy) para que no elijan días pasados
    if (dateInput) {
        const today = new Date().toISOString().split('T')[0];
        dateInput.min = today;
        dateInput.value = today; // Deja seleccionado el día de hoy por defecto
    }


    // =========================================================================
    // ⭐ FUNCIONES EXCLUSIVAS DEL SISTEMA PREMIUM (Calendario Inteligente)
    // =========================================================================
    
    // Lista de todas las horas que ofrece la peluquería originalmente
    const todasLasHoras = ["10:00", "11:00", "11:30", "12:00", "12:30"];

    // Función que filtra y borra del selector las horas que ya están ocupadas
    function actualizarHorasDisponibles() {
        const fechaSeleccionada = dateInput.value;
        if (!fechaSeleccionada) return;

        // Recuperamos las citas ya reservadas en esta demo desde el LocalStorage
        const citasOcupadas = JSON.parse(localStorage.getItem('citas_cuatro_patitas')) || [];
        
        // Limpiamos el selector de horas para rehacerlo desde cero
        timeSelect.innerHTML = '';

        let horasLibres = 0;
        todasLasHoras.forEach(hora => {
            // Buscamos si ya existe una cita guardada para esta misma fecha y hora
            const estaOcupada = citasOcupadas.some(cita => cita.fecha === fechaSeleccionada && cita.hora === hora);

            // Si está libre, creamos la opción en el desplegable
            if (!estaOcupada) {
                const option = document.createElement('option');
                option.value = hora;
                option.textContent = `${hora} h`;
                timeSelect.appendChild(option);
                horasLibres++;
            }
        });

        // Si no quedan horas libres para ese día, mostramos el aviso de bloqueado
        if (horasLibres === 0) {
            const option = document.createElement('option');
            option.value = "";
            option.textContent = "❌ Todo completo para hoy";
            option.disabled = true;
            timeSelect.appendChild(option);
        }
    }

    // Escuchar cuando el usuario cambia de fecha para recalcular las horas libres al instante
    if (dateInput) {
        dateInput.addEventListener('change', actualizarHorasDisponibles);
    }
    
    // Ejecutar la función la primera vez que carga la página para el día de hoy
    actualizarHorasDisponibles();


    // =========================================================================
    // 🚀 ENVÍO DE FORMULARIO (Lógica Premium + Generador de Mensaje)
    // =========================================================================
    if (appointmentForm) {
        appointmentForm.addEventListener('submit', (e) => {
            e.preventDefault(); // Evitamos que la página se recargue

            // Capturamos los valores seleccionados en el formulario
            const service = document.getElementById('select-service').value;
            const dateValue = dateInput.value;
            const time = timeSelect.value;

            // Si el día está completo y no hay hora, bloqueamos el envío
            if (!time) {
                alert("Por favor, selecciona un día con horas disponibles.");
                return;
            }

            // [LÓGICA PREMIUM] Guardamos la cita en la memoria local para que se borre de la lista
            const citasOcupadas = JSON.parse(localStorage.getItem('citas_cuatro_patitas')) || [];
            citasOcupadas.push({ fecha: dateValue, hora: time });
            localStorage.setItem('citas_cuatro_patitas', JSON.stringify(citasOcupadas));

            // Formateamos la fecha para el mensaje de WhatsApp (DD/MM/AAAA)
            const dateFormatted = dateValue.split('-').reverse().join('/');

            // Construcción del mensaje estructurado con los datos de la cita
            const whatsappMessage = `🐾 *¡Nueva cita programada desde la Web!* \n\n` +
                                    `🔹 *Servicio:* ${service}\n` +
                                    `📅 *Fecha:* ${dateFormatted}\n` +
                                    `⏰ *Hora:* ${time} h\n\n` +
                                    `✓ _Guardada automáticamente en la agenda de la web e inhabilitada para otros clientes._`;

            // Codificamos el texto para que la URL de WhatsApp sea válida
            const urlEncodedMessage = encodeURIComponent(whatsappMessage);
            const whatsappUrl = `https://wa.me/${phoneNumber}?text=${urlEncodedMessage}`;

            // [LÓGICA PREMIUM] Actualizamos el selector en directo para ver que la hora desaparece
            actualizarHorasDisponibles();

            // Abrimos el chat de WhatsApp en una pestaña nueva con toda la información
            window.open(whatsappUrl, '_blank');
        });
    }
});