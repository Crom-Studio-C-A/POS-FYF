function debitoCallback(e) {
    const data = e.data;

    if (data.data) {
        if (typeof data.data === "string") {
            data.data = JSON.parse(data.data);
        } else {
            data.data = data.data;
        }
    }

    switch (data.event) {
        case "message":
            if (handler.config.onConnected && data.data.Sts == "DELI") {
                handler.config.onConnected(data);
            }
            if (handler.config.onSuccess && data.data.Sts == "ACCP") {
                handler.config.onSuccess(data);
            }
            if (
                handler.config.onReject &&
                ["RJCT", "AC00"].includes(data.data.Sts)
            ) {
                handler.config.onReject(data);
            }
            break;
        case "error":
            if (handler.config.onError) {
                handler.config.onError(data);
            }
            break;
        default:
            break;
    }
}

function registroCallback(e) {
    const data = e.data;

    if (data.data) {
        if (typeof data.data === "string") {
            data.data = JSON.parse(data.data);
        } else {
            data.data = data.data;
        }
    }

    switch (data.event) {
        case "message":
            if (handler.config.onSuccess && data.data.Sts == "ACCP") {
                handler.config.onSuccess(data);
            }
            if (
                handler.config.onReject &&
                ["RJCT", "AC00"].includes(data.data.Sts)
            ) {
                handler.config.onReject(data);
            }
            if (Array.isArray(data.data)) {
                handler.config.onSuccess(data);
            }
            break;
        case "error":
            if (handler.config.onError) {
                handler.config.onError(data);
            }
            break;
        default:
            break;
    }
}

const handler = {
    config: {},
    render(name) {
        const container = document.getElementById(name);

        container.innerHTML = `
        <div style="display: flex; justify-content: center; align-items: center; column-gap: 2.5rem; height: 70px; padding: 0.5rem">
            <div id='bpay_sts_req' title="Ingresa los datos de la transferencia realizada.">
                <span class="tooltiptext"></span>
            </div> 
            <div id='bpay_debito' title="Paga desde cualquier cuenta bancaria.">
                <span class="tooltiptext"></span>
            </div>             
        </div>
        <style>
            @import url('https://fonts.googleapis.com/css2?family=Roboto&display=swap');

            #bpay_sts_req {
                background-image: url("https://bpay.btc.com.ve/images/imagen_botones/registro_pago.png");
            }

            #bpay_debito {
                background-image: url("https://bpay.btc.com.ve/images/imagen_botones/debito_inmediato.png");
            }
                
            #bpay_sts_req, #bpay_debito {
                z-index: 100;
                width: 140px;
                height: 100%;
                cursor: pointer;
                overflow: hidden;
                position: relative;
                display: inline-block;
                border-radius: 0.5rem;
                background-size: 100% 100%;
                background-position: center;
                background-repeat: no-repeat;
                box-shadow: #4516e6 1px 1px 4px;
            }

            .tooltip .tooltiptext {
                visibility: hidden;
                width: 120px;
                background-color: #555;
                color: #fff;
                text-align: center;
                border-radius: 6px;
                padding: 5px 0;
                position: absolute;
                z-index: 1;
                bottom: 125%;
                left: 50%;
                margin-left: -60px;
                opacity: 0;
                transition: opacity 0.3s;
            }

            .tooltip .tooltiptext::after {
                content: "";
                position: absolute;
                top: 100%;
                left: 50%;
                margin-left: -5px;
                border-width: 5px;
                border-style: solid;
                border-color: #555 transparent transparent transparent;
            }

            .tooltip:hover .tooltiptext {
                visibility: visible;
                opacity: 1;
            }
        </style>
        `;

        // BPAY DEBITO
        document.getElementById("bpay_debito").onclick = (e) => {
            /********* Llamar a variable ENV *******/
            // const APP_URL = "https://bpay.sencillo.com.ve"; // PRODUCCION
            const APP_URL = "https://bpay.btc.com.ve"; // DESARROLLO
            // const APP_URL = "http://localhost:8000"; // LOCAL
            /* ------ */

            const url = `${APP_URL}/bpay_debito?client_id=${this.config.clientId}&a=${this.config.amount}&r=${this.config.ref}`;

            const popup = this.popupWindow(url, "B'Pay", window, 538, 750);

            this.removeEventListeners();

            window.addEventListener("message", debitoCallback, false);
        };

        // BPAY REGISTRO PAGO
        document.getElementById("bpay_sts_req").onclick = (e) => {
            /********* Llamar a variable ENV *******/
            // const APP_URL = "https://bpay.sencillo.com.ve"; // PRODUCCION
            const APP_URL = "https://bpay.btc.com.ve"; // DESARROLLO
            // const APP_URL = "http://localhost:8000"; // LOCAL
            /* ------ */

            const url = `${APP_URL}/bpay_credito?client_id=${this.config.clientId}&a=${this.config.amount}&r=${this.config.ref}`;

            const popup = this.popupWindow(url, "B'Pay", window, 538, 750);

            this.removeEventListeners();

            window.addEventListener("message", registroCallback, false);
        };
    },

    popupWindow(url, windowName, win, w, h) {
        const y = win.top.outerHeight / 2 + win.top.screenY - h / 2;
        const x = win.top.outerWidth / 2 + win.top.screenX - w / 2;
        return win.open(
            url,
            windowName,
            `toolbar=no, location=no, directories=no, status=no, menubar=no, scrollbars=no, resizable=no, copyhistory=no, width=${w}, height=${h}, top=${y}, left=${x}`
        );
    },

    prepareMessage(message, btnClass = "alert-secondary") {
        return `<p class="alert ${btnClass} mx-4">${message}</p>`;
    },

    removeEventListeners() {
        window.removeEventListener("message", debitoCallback, false);
        window.removeEventListener("message", registroCallback, false);
    },

    // sendMessage(message, color) {
    //     const msgContainer = document.getElementById("message");
    //     const result = this.prepareMessage(message, color);
    //     msgContainer.insertAdjacentHTML("beforeend", result);
    // },
};

function bpay(config) {
    handler.config = config;
    return handler;
}
