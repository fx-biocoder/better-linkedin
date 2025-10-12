// Donations page script for Better LinkedIn extension

document.addEventListener('DOMContentLoaded', function() {
    // Open PayPal donation page
    function openPayPal() {
        window.open('https://paypal.me/facumartinez680', '_blank');
    }

    // Open Ko-Fi donation page
    function openKoFi() {
        window.open('https://ko-fi.com/biocoder', '_blank');
    }

    // Open Mercado Pago donation page
    function openMercadoPago() {
        window.open('https://link.mercadopago.com.ar/betterlinkedin', '_blank');
    }

    // Add event listeners to buttons
    const buttons = document.querySelectorAll('.cta-button[data-action]');
    buttons.forEach(button => {
        button.addEventListener('click', function(e) {
            e.preventDefault();
            const action = this.getAttribute('data-action');
            
            switch(action) {
                case 'paypal':
                    openPayPal();
                    break;
                case 'kofi':
                    openKoFi();
                    break;
                case 'mercadopago':
                    openMercadoPago();
                    break;
            }
        });
    });
});
