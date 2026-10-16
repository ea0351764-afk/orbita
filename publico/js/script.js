// ÓRBITA — JavaScript simplificado para archivos
document.addEventListener('DOMContentLoaded', function() {
    console.log('✅ JS cargado');

    const inputArchivos = document.getElementById('misArchivos');
    const listaArchivos = document.getElementById('lista-archivos');
    const form = document.getElementById('formContacto');
    let archivos = [];

    // Si no encuentra los elementos, avisa en consola
    if (!inputArchivos) { console.log('❌ No encontré #archivos'); return; }
    if (!listaArchivos) { console.log('❌ No encontré #lista-archivos'); return; }

    // Cuando se seleccionan archivos
    inputArchivos.addEventListener('change', function(e) {
        console.log('📂 Archivos elegidos:', e.target.files);
        
        for (let i = 0; i < e.target.files.length; i++) {
            archivos.push(e.target.files[i]);
        }
        
        mostrarLista();
        inputArchivos.value = '';
    });

    // Mostrar la lista visualmente
    function mostrarLista() {
        listaArchivos.innerHTML = '';
        
        archivos.forEach(function(archivo, indice) {
            let icono = '📄';
            if (archivo.type.startsWith('image/')) icono = '🖼️';
            else if (archivo.type.startsWith('video/')) icono = '🎬';
            else if (archivo.type === 'application/pdf') icono = '📕';

            let tamaño = (archivo.size / 1024).toFixed(1) + ' KB';

            // Crear elemento manualmente
            const item = document.createElement('div');
            item.style.cssText = `
                display: flex;
                align-items: center;
                justify-content: space-between;
                padding: 10px 14px;
                background: #f8fafc;
                border-radius: 8px;
                margin-top: 8px;
                border-left: 3px solid #1a73e8;
            `;

            item.innerHTML = `
                <div>
                    <strong>${icono} ${archivo.name}</strong>
                    <div style="font-size: 12px; color: #666;">${tamaño}</div>
                </div>
                <button type="button" data-i="${indice}" style="
                    background: none;
                    border: none;
                    color: red;
                    font-size: 18px;
                    cursor: pointer;
                    padding: 0 8px;
                ">✕</button>
            `;

            listaArchivos.appendChild(item);
        });

        // Agregar clic a cada botón ✕
        const botones = listaArchivos.querySelectorAll('button');
        botones.forEach(function(btn) {
            btn.addEventListener('click', function() {
                const i = parseInt(btn.getAttribute('data-i'));
                archivos.splice(i, 1);
                mostrarLista();
            });
        });
    }

    // Envío del formulario
    if (form) {
        form.addEventListener('submit', function(e) {
            e.preventDefault();
            alert('✅ ¡Mensaje enviado! Archivos adjuntos: ' + archivos.length);
            form.reset();
            archivos = [];
            listaArchivos.innerHTML = '';
        });
    }
});

// ==========================================
// 🔐 SISTEMA DE USUARIOS Y PORTAFOLIOS
// ==========================================

// ----------------------
// Registro de Usuarios
// ----------------------
const formRegistro = document.getElementById('formRegistro');
if (formRegistro) {
    formRegistro.addEventListener('submit', function(e) {
        e.preventDefault();
        
        const nombreCompleto = document.getElementById('nombreCompleto').value.trim();
        const usuario = document.getElementById('nuevoUsuario').value.trim().toLowerCase();
        const correo = document.getElementById('correo').value.trim();
        const contrasena = document.getElementById('nuevaContrasena').value;
        const biografia = document.getElementById('biografia').value.trim();
        const mensaje = document.getElementById('mensajeRegistro');

        // Obtener usuarios existentes
        const usuarios = JSON.parse(localStorage.getItem('orbita_usuarios') || '[]');
        
        // Verificar si ya existe
        if (usuarios.find(u => u.usuario === usuario || u.correo === correo)) {
            mensaje.style.display = 'block';
            mensaje.style.color = '#ef4444';
            mensaje.textContent = '❌ Este usuario o correo ya está registrado';
            return;
        }

        // Crear nuevo usuario
        const nuevoUsuario = {
            id: Date.now(),
            nombreCompleto,
            usuario,
            correo,
            contrasena,
            biografia,
            proyectos: [],
            fechaRegistro: new Date().toLocaleDateString('es-UY')
        };

        usuarios.push(nuevoUsuario);
        localStorage.setItem('orbita_usuarios', JSON.stringify(usuarios));
        
        mensaje.style.display = 'block';
        mensaje.style.color = '#10b981';
        mensaje.textContent = '✅ ¡Cuenta creada con éxito! Redirigiendo...';
        
        formRegistro.reset();
        
        setTimeout(() => {
            window.location.href = 'login.html';
        }, 1500);
    });
}

// ----------------------
// Inicio de Sesión
// ----------------------
const formLogin = document.getElementById('formLogin');
if (formLogin) {
    formLogin.addEventListener('submit', function(e) {
        e.preventDefault();
        
        const usuario = document.getElementById('usuario').value.trim().toLowerCase();
        const contrasena = document.getElementById('contrasena').value;
        const mensaje = document.getElementById('mensajeError');
        
        const usuarios = JSON.parse(localStorage.getItem('orbita_usuarios') || '[]');
        const usuarioEncontrado = usuarios.find(u => 
            (u.usuario === usuario || u.correo === usuario) && u.contrasena === contrasena
        );

        if (usuarioEncontrado) {
            // Guardar sesión
            localStorage.setItem('orbita_sesion_actual', JSON.stringify({
                id: usuarioEncontrado.id,
                usuario: usuarioEncontrado.usuario,
                nombreCompleto: usuarioEncontrado.nombreCompleto
            }));
            window.location.href = 'mi-portafolio.html';
        } else {
            mensaje.style.display = 'block';
            mensaje.textContent = '❌ Usuario o contraseña incorrectos';
        }
    });
}

// ----------------------
// Verificar Sesión y Cerrar Sesión
// ----------------------
function obtenerSesion() {
    return JSON.parse(localStorage.getItem('orbita_sesion_actual') || 'null');
}

const btnCerrarSesion = document.getElementById('btnCerrarSesion');
if (btnCerrarSesion) {
    btnCerrarSesion.addEventListener('click', function(e) {
        e.preventDefault();
        localStorage.removeItem('orbita_sesion_actual');
        window.location.href = 'index.html';
    });
}

// ----------------------
// Mi Portafolio — Cargar y Guardar Proyectos
// ----------------------
if (document.getElementById('mi-portafolio') || window.location.pathname.includes('mi-portafolio')) {
    const sesion = obtenerSesion();
    const contenido = document.getElementById('contenidoPortafolio');
    const sinSesion = document.getElementById('sinSesion');
    
    if (!sesion) {
        sinSesion.style.display = 'block';
    } else {
        contenido.style.display = 'block';
        cargarDatosUsuario();
        cargarMisProyectos();
    }

    function cargarDatosUsuario() {
        const usuarios = JSON.parse(localStorage.getItem('orbita_usuarios') || '[]');
        const usuarioActual = usuarios.find(u => u.id === sesion.id);
        if (usuarioActual) {
            document.getElementById('nombreUsuarioPortafolio').textContent = usuarioActual.nombreCompleto;
            document.getElementById('bioUsuario').textContent = usuarioActual.biografia || 'Sin biografía aún';
        }
    }

    // Agregar Proyecto
    const formProyecto = document.getElementById('formProyecto');
    if (formProyecto) {
        formProyecto.addEventListener('submit', function(e) {
            e.preventDefault();
            
            const titulo = document.getElementById('tituloProyecto').value.trim();
            const descripcion = document.getElementById('descripcionProyecto').value.trim();
            const imagen = document.getElementById('imagenProyecto').value.trim();
            const esPublico = document.getElementById('esPublico').checked;

            const usuarios = JSON.parse(localStorage.getItem('orbita_usuarios') || '[]');
            const indiceUsuario = usuarios.findIndex(u => u.id === sesion.id);
            
            if (indiceUsuario !== -1) {
                const nuevoProyecto = {
                    id: Date.now(),
                    titulo,
                    descripcion,
                    imagen: imagen || null,
                    publico: esPublico,
                    fecha: new Date().toLocaleDateString('es-UY')
                };
                
                usuarios[indiceUsuario].proyectos.unshift(nuevoProyecto);
                localStorage.setItem('orbita_usuarios', JSON.stringify(usuarios));
                
                formProyecto.reset();
                document.getElementById('esPublico').checked = true;
                
                alert('✅ ¡Proyecto guardado con éxito!');
                cargarMisProyectos();
            }
        });
    }

    function cargarMisProyectos() {
        const lista = document.getElementById('listaMisProyectos');
        const sinProyectos = document.getElementById('sinProyectos');
        const usuarios = JSON.parse(localStorage.getItem('orbita_usuarios') || '[]');
        const usuarioActual = usuarios.find(u => u.id === sesion.id);
        
        lista.innerHTML = '';
        
        if (!usuarioActual || usuarioActual.proyectos.length === 0) {
            sinProyectos.style.display = 'block';
            return;
        }
        
        sinProyectos.style.display = 'none';
        
        usuarioActual.proyectos.forEach(proyecto => {
            const tarjeta = document.createElement('div');
            tarjeta.className = 'tarjeta';
            tarjeta.innerHTML = `
                ${proyecto.imagen ? `<img src="${proyecto.imagen}" alt="${proyecto.titulo}" style="width: 100%; height: 150px; object-fit: cover; border-radius: 8px; margin-bottom: 1rem;">` : ''}
                <h3>${proyecto.titulo}</h3>
                <p>${proyecto.descripcion}</p>
                <p style="font-size: 0.85rem; color: var(--texto-claro); margin: 0.5rem 0;">
                    📅 ${proyecto.fecha} | ${proyecto.publico ? '🪐 Público' : '🔒 Privado'}
                </p>
                <div style="display: flex; gap: 0.5rem; margin-top: 1rem;">
                    <button onclick="cambiarVisibilidad(${proyecto.id})" class="btn" style="padding: 0.5rem 1rem; font-size: 0.85rem; background: ${proyecto.publico ? '#fef3c7' : '#d1fae5'}; color: ${proyecto.publico ? '#92400e' : '#065f46'};">
                        ${proyecto.publico ? '🔒 Hacer Privado' : '🪐 Hacer Público'}
                    </button>
                    <button onclick="eliminarProyecto(${proyecto.id})" class="btn" style="padding: 0.5rem 1rem; font-size: 0.85rem; background: #fee2e2; color: #991b1b;">
                        🗑️ Eliminar
                    </button>
                </div>
            `;
            lista.appendChild(tarjeta);
        });
    }

    // Cambiar visibilidad
    window.cambiarVisibilidad = function(idProyecto) {
        const usuarios = JSON.parse(localStorage.getItem('orbita_usuarios') || '[]');
        const indiceUsuario = usuarios.findIndex(u => u.id === sesion.id);
        const indiceProyecto = usuarios[indiceUsuario].proyectos.findIndex(p => p.id === idProyecto);
        
        if (indiceProyecto !== -1) {
            usuarios[indiceUsuario].proyectos[indiceProyecto].publico = 
                !usuarios[indiceUsuario].proyectos[indiceProyecto].publico;
            localStorage.setItem('orbita_usuarios', JSON.stringify(usuarios));
            cargarMisProyectos();
        }
    };

    // Eliminar proyecto
    window.eliminarProyecto = function(idProyecto) {
        if (confirm('¿Estás seguro de eliminar este proyecto? Esta acción no se puede deshacer.')) {
            const usuarios = JSON.parse(localStorage.getItem('orbita_usuarios') || '[]');
            const indiceUsuario = usuarios.findIndex(u => u.id === sesion.id);
            usuarios[indiceUsuario].proyectos = usuarios[indiceUsuario].proyectos.filter(p => p.id !== idProyecto);
            localStorage.setItem('orbita_usuarios', JSON.stringify(usuarios));
            cargarMisProyectos();
        }
    };
}

// ----------------------
// Portafolios Públicos
// ----------------------
if (document.getElementById('listaPortafoliosPublicos')) {
    cargarPortafoliosPublicos();
}

function cargarPortafoliosPublicos() {
    const lista = document.getElementById('listaPortafoliosPublicos');
    const sinPortafolios = document.getElementById('sinPortafolios');
    const usuarios = JSON.parse(localStorage.getItem('orbita_usuarios') || '[]');
    
    lista.innerHTML = '';
    let hayProyectosPublicos = false;
    
    usuarios.forEach(usuario => {
        const proyectosPublicos = usuario.proyectos.filter(p => p.publico);
        
        if (proyectosPublicos.length > 0) {
            hayProyectosPublicos = true;
            
            const seccionUsuario = document.createElement('div');
            seccionUsuario.style = 'margin-bottom: 3rem; padding-bottom: 2rem; border-bottom: 1px solid var(--borde);';
            seccionUsuario.innerHTML = `
                <h3 style="color: var(--primario); margin-bottom: 1rem;">👤 ${usuario.nombreCompleto}</h3>
                <p style="color: var(--texto-claro); font-style: italic; margin-bottom: 1.5rem;">${usuario.biografia || 'Sin biografía'}</p>
                <div class="grid-caracteristicas"></div>
            `;
            lista.appendChild(seccionUsuario);
            
            const gridProyectos = seccionUsuario.querySelector('.grid-caracteristicas');
            
            proyectosPublicos.forEach(proyecto => {
                const tarjeta = document.createElement('div');
                tarjeta.className = 'tarjeta';
                tarjeta.innerHTML = `
                    ${proyecto.imagen ? `<img src="${proyecto.imagen}" alt="${proyecto.titulo}" style="width: 100%; height: 150px; object-fit: cover; border-radius: 8px; margin-bottom: 1rem;">` : ''}
                    <h3>${proyecto.titulo}</h3>
                    <p>${proyecto.descripcion}</p>
                    <p style="font-size: 0.85rem; color: var(--texto-claro); margin-top: 0.5rem;">📅 ${proyecto.fecha}</p>
                `;
                gridProyectos.appendChild(tarjeta);
            });
        }
    });
    
    if (!hayProyectosPublicos) {
        sinPortafolios.style.display = 'block';
    } else {
        sinPortafolios.style.display = 'none';
    }
}

// ==========================================
// 📡 GESTIÓN GLOBAL DE SESIÓN EN TODAS LAS PÁGINAS
// ==========================================
function actualizarMenuSegunSesion() {
    const sesion = JSON.parse(localStorage.getItem('orbita_sesion_actual') || 'null');
    
    // Buscar el menú en la página actual
    const menu = document.querySelector('nav .menu');
    if (!menu) return;
    
    // Eliminar enlaces antiguos de sesión
    const elementosAntiguos = menu.querySelectorAll('.enlace-sesion');
    elementosAntiguos.forEach(el => el.remove());
    
    if (sesion) {
        // ✅ Hay sesión activa: mostrar "Mi Portafolio" y "Cerrar Sesión"
        const enlacePortafolio = document.createElement('li');
        enlacePortafolio.className = 'enlace-sesion';
        enlacePortafolio.innerHTML = `<a href="mi-portafolio.html">🎨 Mi Portafolio</a>`;
        menu.appendChild(enlacePortafolio);
        
        const enlaceUsuario = document.createElement('li');
        enlaceUsuario.className = 'enlace-sesion';
        enlaceUsuario.innerHTML = `<span style="color: var(--primario); font-weight: 500;">👤 ${sesion.nombreCompleto}</span>`;
        menu.appendChild(enlaceUsuario);
        
        const enlaceCerrar = document.createElement('li');
        enlaceCerrar.className = 'enlace-sesion';
        enlaceCerrar.innerHTML = `<a href="#" id="cerrarSesionBtn" style="color: #ef4444;">🚪 Cerrar Sesión</a>`;
        menu.appendChild(enlaceCerrar);
        
        // Agregar funcionalidad al botón de cerrar sesión
        const btnCerrar = document.getElementById('cerrarSesionBtn');
        if (btnCerrar) {
            btnCerrar.addEventListener('click', function(e) {
                e.preventDefault();
                localStorage.removeItem('orbita_sesion_actual');
                window.location.href = 'index.html';
            });
        }
    } else {
        // ❌ No hay sesión: mostrar "Iniciar Sesión" y "Crear Cuenta"
        const enlaceLogin = document.createElement('li');
        enlaceLogin.className = 'enlace-sesion';
        enlaceLogin.innerHTML = `<a href="login.html">🔑 Iniciar Sesión</a>`;
        menu.appendChild(enlaceLogin);
        
        const enlaceRegistro = document.createElement('li');
        enlaceRegistro.className = 'enlace-sesion';
        enlaceRegistro.innerHTML = `<a href="registro.html">📝 Crear Cuenta</a>`;
        menu.appendChild(enlaceRegistro);
    }
}

// Ejecutar cuando cargue cualquier página
document.addEventListener('DOMContentLoaded', actualizarMenuSegunSesion);