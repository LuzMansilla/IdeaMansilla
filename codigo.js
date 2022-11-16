//Utilice solo un HTML para el codigo que es el de mi index.html
//REALICE UN CARRITO DE COMPRAS DE CURSOS DE ENEAGRAMA Y UN FORMULARIO PARA RECIBIR MAS INFORMACION POR CELULAR

//EL CARRITO
let cursosJSON = [];
let totalCarrito;
let contenedor = document.getElementById("miscursos");
let botonCompra = document.getElementById("finalizarCompra");
let carrito = JSON.parse(localStorage.getItem("carrito")) || [];

(carrito.length != 0) && recuperarElCarrito();

// Agrego productos a mi carrito recuperados del LOCALSTORAGE
function recuperarElCarrito() {
    for (const curso of carrito) {
        let tablaBody = document.getElementById("tablabody")
        tablaBody.innerHTML += `
            <tr>
                <td>${curso.etapa}</td>
                <td>${curso.nombre}</td>
                <td>$${curso.precio}</td>
                <td>
                    <button class="btn btn-outline-light" onclick="eliminar(event)">
                        <i class="fa-solid fa-trash-can"></i>
                    </button>
                </td>
            </tr>
        `;
        tablaBody.style.color = "white";
    }
    totalCarrito = carrito.reduce((acumulador, curso) => acumulador + curso.precio, 0);
    document.getElementById("total").innerText = "Total a Pagar: " + totalCarrito;
}

//cargando las tarjetas a mi pagina
function cargarCursos() {
    for (const curso of cursosJSON) {
        contenedor.innerHTML += `
            <div class="card" id="card${curso.id}">
                <div class="card-header" id="titulo${curso.id}">${curso.nombre}</div>
                <div class="card-body">
                    <p class="card-text">${curso.etapa}</p>
                    <p class="card-text">${curso.duracion}</p>
                    <p class="card-text">$ ${curso.precio} ó USD ${(curso.precio/dolarCompra).toFixed(2)}</p>
                    <a href="#" class="btn btn-primary" id="btn${curso.id}">Lo Quiero</a>
                </div>
            </div>
        `;
        let cards = document.getElementById(`card${curso.id}`)
        cards.style.background = "transparent";
        let titulo = document.getElementById(`titulo${curso.id}`)
        titulo.style.background = "#d63d42c4";
    }
    contenedor.style.color = "#c2ab82"

    //Evento de agregado de curso al carro para cada boton
    cursosJSON.forEach(curso => {
        let boton = document.getElementById(`btn${curso.id}`)
        boton.addEventListener("click", function () {
            agregarAlCarrito(curso);
        });
        boton.style.background = "#c2ab82"
        boton.style.border = "#c2ab82"
        boton.style.color = "#fff"
    })
}
cargarCursos();

//El CARRITO impactado en una tabla
function agregarAlCarrito(cursoComprado) {
    carrito.push(cursoComprado);
    console.table(carrito);
    Swal.fire(
        "Curso: " + cursoComprado.nombre,
        'Agregado al Carrito',
        'success'
    );
    let tablaBody = document.getElementById("tablabody");
    console.log({
        tablaBody
    })
    if (tablaBody) {
        tablaBody.innerHTML += `
        <tr>
            <td>${cursoComprado.etapa}</td>
            <td>${cursoComprado.nombre}</td>
            <td>$${cursoComprado.precio}</td>
            <td>
                <button class="btn btn-outline-light" onclick="eliminar(event)">
                    <i class="fa-solid fa-trash-can"></i>
                </button>
            </td>
        </tr>
    `;
        carritoEnLS()
        tablaBody.style.color = "white";
        totalCarrito = carrito.reduce((acumulador, curso) => acumulador + curso.precio, 0);
        let infoTotal = document.getElementById("total");
        infoTotal.innerText = "Total a Pagar: " + totalCarrito;
    } else {
        alert('No existe tablabody')
    }

}

//Storage y JSON
const carritoEnLS = () => {
    localStorage.setItem("carrito", JSON.stringify(carrito));
}

//Eliminar Curso
function eliminar(ev) {
    //identifico quien es el padre de mi icono
    let fila = ev.target.parentElement.parentElement.parentElement
    //me pasaba que a veces el padre era un tr y en otros casos era el tableBody es por eso que hice este if...
    if (!fila.rowIndex) {
        fila = ev.target.parentElement.parentElement
    }
    let id = fila.children[0].innerText;
    let indice = carrito.findIndex(curso => curso.id == id);
    //remueve el producto identificado por el id del array carrito
    carrito.splice(indice, 1);
    //remueve la fila de la tabla
    fila.remove();
    //muestro en la consola los cursos que me quedan en el carro
    console.table(carrito);
    //vuelvo a dibujar la tabla
    let tablaBody = document.getElementById("tablabody");
    tablaBody.innerHTML = '';
    for (const producto of carrito) {
        tablaBody.innerHTML += `
        <tr>
            <td>${producto.etapa}</td>
            <td>${producto.nombre}</td>
            <td>$${producto.precio}</td>
            <td>
                <button class="btn btn-outline-light" onclick="eliminar(event)">
                    <i class="fa-solid fa-trash-can"></i>
                </button>
            </td>
        </tr>
    `;
    }

    //recalcular el total
    let preciosAcumulados = carrito.reduce((acumulador, curso) => acumulador + curso.precio, 0);
    total.innerText = "Total a pagar $: " + preciosAcumulados;
    //storage
    localStorage.setItem("carrito", JSON.stringify(carrito));
}

//Obtener valor del Dolar por una API que me lo actualiza de acuerdo al dia.. 
function obtenerDolar() {
    const URLDolar = "https://api.bluelytics.com.ar/v2/latest";
    fetch(URLDolar)
        .then(respuesta => respuesta.json())
        .then(cotizaciones => {
            const dolarBlue = cotizaciones.blue;
            console.log(dolarBlue);
            document.getElementById("cotizaciones").innerHTML += `
                <h3>Cotizacion del dolar en Argentina al dia de hoy</h3>
                <h4> Dolar Compra: $${dolarBlue.value_buy} </h4>
                <h4> Dolar Venta: $${dolarBlue.value_sell}</h4>
            `;
            dolarCompra = dolarBlue.value_buy;
            obtenerJSON();
        })
}
obtenerDolar()

// Ruta Local a Obtener cursos.json
async function obtenerJSON() {
    const URLJSON = "cursos.json";
    const response = await fetch(URLJSON)
    const datos = await response.json();
    cursosJSON = datos;
    //ya tengo el dolar y los cursos, cargo las cartas
    cargarCursos()
}

//Terminando la compra
botonCompra.onclick = () => {
    if (carrito.length == 0) {
        Swal.fire({
            icon: 'error',
            title: 'Oops...',
            text: 'Tu Carrito está Vacío!'
        })
    } else {
        //recalcular el total
        let preciosAcumulados = carrito.reduce((acumulador, curso) => acumulador + curso.precio, 0);
        total.innerText = "Total a pagar $: " + preciosAcumulados;
        carrito = [];
        document.getElementById("tablabody").innerHTML = ``;
        document.getElementById("total").innerText = "Total a Pagar: ";
        Swal.fire(
            "El TOTAL es: $" + preciosAcumulados,
            'GRACIAS POR TU COMPRA',
        );
        //storage
        localStorage.setItem("carrito", JSON.stringify(carrito));
    }
}


//FORMULARIO
const formulario = document.getElementById("formulario");
const inputs = document.querySelectorAll("#formulario input");
formulario.addEventListener('submit', onFormSubmit);

//uso expresiones para limitar las respuestas del usuario 
const expresiones = {
    nombre: /^[a-zA-ZÀ-ÿ\s]{1,20}$/, // Letras y espacios, pueden llevar acentos.
    apellido: /^[a-zA-ZÀ-ÿ\s]{1,20}$/, // Letras y espacios, pueden llevar acentos.
    edad: /^\d{1,2}$/, // 1 a 3 numeros.
    celular: /^\d{7,14}$/ // 7 a 14 numeros.
}

//array de todos los campos
const campos = {
    nombre: false,
    apellido: false,
    edad: false,
    celular: false,
}

//funcion validar formulario que requiere de otras funciones
const validarFormulario = (e) => {
    switch (e.target.name) {
        case "nombre":
            validarCampo(expresiones.nombre, e.target, "nombre");
            break;
        case "apellido":
            validarCampo(expresiones.apellido, e.target, "apellido");
            break;
        case "edad":
            validarCampo(expresiones.edad, e.target, "edad");
            break;
        case "celular":
            validarCampo(expresiones.celular, e.target, "celular");
            break;
    }
};

//validando cada input que sea completado de cada campo marcado en validarFormulario
const validarCampo = (expresion, input, campo) => {
    if (expresion.test(input.value)) {
        //si el usuario cumple con los requisitos que le solicito en las expresiones...
        document.getElementById(`grupo__${campo}`).classList.remove(`formulario__grupo-incorrecto`);
        document.getElementById(`grupo__${campo}`).classList.add(`formulario__grupo-correcto`);
        document.querySelector(`#grupo__${campo} i`).classList.add(`fa-circle-check`); //le agrego iconos que ayuden al entendimiento del usuario
        document.querySelector(`#grupo__${campo} i`).classList.remove(`fa-circle-xmark`);
        document.querySelector(`#grupo__${campo} .formulario__input-error`).classList.remove(`formulario__input-error-activo`);
        campos[campo] = true;
    } else {
        //el usuario no cumple con los requisitos de las expresiones
        document.getElementById(`grupo__${campo}`).classList.add(`formulario__grupo-incorrecto`);
        document.getElementById(`grupo__${campo}`).classList.remove(`formulario__grupo-correcto`);
        document.querySelector(`#grupo__${campo} i`).classList.add(`fa-circle-xmark`);
        document.querySelector(`#grupo__${campo} i`).classList.remove(`fa-circle-check`);
        document.querySelector(`#grupo__${campo} .formulario__input-error`).classList.add(`formulario__input-error-activo`);
        campos[campo] = false;
    }
}

inputs.forEach((input) => {
    input.addEventListener("keyup", validarFormulario);
    input.addEventListener("blur", validarFormulario);
});

//creo una nueva funcion para el evento submit
function onFormSubmit(e) {
    e.preventDefault()
    if (campos.nombre && campos.apellido && campos.edad && campos.celular) {
        formulario.reset();

        Swal.fire({
            position: 'top-center',
            icon: 'success',
            title: 'El formulario se envió correctamente.',
            showConfirmButton: false,
            timer: 1500
        });
        document.querySelectorAll(".formulario__grupo-correcto").forEach((icono) => {
            icono.classList.remove("formulario__grupo-correcto");
        });
        campos.apellido = false;
        campos.edad = false;
        campos.nombre = false;
        campos.celular = false;
    } else {
        Swal.fire({
            icon: 'error',
            title: 'Oops...',
            text: 'Tienes que llenar el Formulario!'
        })
    }
}