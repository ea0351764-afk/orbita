require('dotenv').config();
const express = require('express');
const mongoose = require('mongoose');
const session = require('express-session');
const path = require('path');
const Usuario = require('./models/Usuario');

const app = express();
const PORT = process.env.PORT || 3000;

// 📂 Servir archivos estáticos desde la carpeta "publico"
app.use(express.static(path.join(__dirname, 'publico')));

// 📝 Leer datos de formularios
app.use(express.urlencoded({ extended: true }));
app.use(express.json());

// 🔐 Configuración de sesiones
app.use(session({
    secret: process.env.SESSION_SECRET || 'secreto_orbita',
    resave: false,
    saveUninitialized: false,
    cookie: {
        maxAge: 24 * 60 * 60 * 1000, // 1 día
        httpOnly: true
    }
}));

// 🗄️ Conectar a MongoDB
mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/orbita_db')
    .then(() => console.log('✅ Conectado a MongoDB 🗄️'))
    .catch(err => console.error('❌ Error al conectar a MongoDB:', err));

// 🌍 Hacer el usuario disponible en todas las vistas
app.use((req, res, next) => {
    res.locals.usuarioActual = req.session.usuario || null;
    next();
});

// ==========================================
// 📝 RUTAS DE AUTENTICACIÓN
// ==========================================

// Página de Inicio
app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'publico', 'index.html'));
});

// Registro
app.post('/api/registro', async (req, res) => {
    try {
        const { nombreCompleto, usuario, correo, contrasena, biografia } = req.body;
        
        // Verificar si ya existe
        const existeUsuario = await Usuario.findOne({ $or: [{ usuario }, { correo }] });
        if (existeUsuario) {
            return res.json({ exito: false, mensaje: '❌ El usuario o correo ya está registrado' });
        }
        
        // Crear nuevo usuario
        const nuevoUsuario = new Usuario({
            nombreCompleto,
            usuario,
            correo,
            contrasena,
            biografia
        });
        
        await nuevoUsuario.save();
        res.json({ exito: true, mensaje: '✅ ¡Cuenta creada con éxito!' });
    } catch (error) {
        res.json({ exito: false, mensaje: '❌ Error al registrar: ' + error.message });
    }
});

// Inicio de Sesión
app.post('/api/login', async (req, res) => {
    try {
        const { usuario, contrasena } = req.body;
        
        const usuarioEncontrado = await Usuario.findOne({
            $or: [{ usuario }, { correo: usuario }]
        });
        
        if (!usuarioEncontrado) {
            return res.json({ exito: false, mensaje: '❌ Usuario o contraseña incorrectos' });
        }
        
        const contrasenaCorrecta = await usuarioEncontrado.compararContrasena(contrasena);
        if (!contrasenaCorrecta) {
            return res.json({ exito: false, mensaje: '❌ Usuario o contraseña incorrectos' });
        }
        
        // Guardar sesión
        req.session.usuario = {
            id: usuarioEncontrado._id,
            usuario: usuarioEncontrado.usuario,
            nombreCompleto: usuarioEncontrado.nombreCompleto,
            correo: usuarioEncontrado.correo,
            biografia: usuarioEncontrado.biografia
        };
        
        res.json({ exito: true, usuario: req.session.usuario });
    } catch (error) {
        res.json({ exito: false, mensaje: '❌ Error al iniciar sesión: ' + error.message });
    }
});

// Cerrar Sesión
app.get('/api/logout', (req, res) => {
    req.session.destroy(err => {
        if (err) return res.redirect('/');
        res.clearCookie('connect.sid');
        res.redirect('/');
    });
});

// Verificar sesión
app.get('/api/sesion', (req, res) => {
    res.json({ usuario: req.session.usuario || null });
});

// ==========================================
// 🎨 RUTAS DE PROYECTOS
// ==========================================

// Obtener mis proyectos
app.get('/api/mis-proyectos', async (req, res) => {
    if (!req.session.usuario) {
        return res.json({ exito: false, mensaje: 'No hay sesión activa' });
    }
    
    try {
        const usuario = await Usuario.findById(req.session.usuario.id);
        res.json({ exito: true, proyectos: usuario.proyectos });
    } catch (error) {
        res.json({ exito: false, mensaje: 'Error: ' + error.message });
    }
});

// Agregar proyecto
app.post('/api/proyectos', async (req, res) => {
    if (!req.session.usuario) {
        return res.json({ exito: false, mensaje: 'No hay sesión activa' });
    }
    
    try {
        const { titulo, descripcion, imagen, publico } = req.body;
        const usuario = await Usuario.findById(req.session.usuario.id);
        
        usuario.proyectos.unshift({ titulo, descripcion, imagen, publico });
        await usuario.save();
        
        res.json({ exito: true, proyectos: usuario.proyectos });
    } catch (error) {
        res.json({ exito: false, mensaje: 'Error al guardar: ' + error.message });
    }
});

// Cambiar visibilidad
app.post('/api/proyectos/:id/visibilidad', async (req, res) => {
    if (!req.session.usuario) {
        return res.json({ exito: false });
    }
    
    try {
        const usuario = await Usuario.findById(req.session.usuario.id);
        const proyecto = usuario.proyectos.id(req.params.id);
        proyecto.publico = !proyecto.publico;
        await usuario.save();
        res.json({ exito: true, proyectos: usuario.proyectos });
    } catch (error) {
        res.json({ exito: false });
    }
});

// Eliminar proyecto
app.delete('/api/proyectos/:id', async (req, res) => {
    if (!req.session.usuario) {
        return res.json({ exito: false });
    }
    
    try {
        const usuario = await Usuario.findById(req.session.usuario.id);
        usuario.proyectos.pull(req.params.id);
        await usuario.save();
        res.json({ exito: true, proyectos: usuario.proyectos });
    } catch (error) {
        res.json({ exito: false });
    }
});

// Obtener proyectos públicos
app.get('/api/proyectos-publicos', async (req, res) => {
    try {
        const usuarios = await Usuario.find({});
        const resultado = usuarios.map(u => ({
            _id: u._id,
            nombreCompleto: u.nombreCompleto,
            biografia: u.biografia,
            proyectos: u.proyectos.filter(p => p.publico)
        })).filter(u => u.proyectos.length > 0);
        
        res.json({ exito: true, usuarios: resultado });
    } catch (error) {
        res.json({ exito: false, mensaje: 'Error: ' + error.message });
    }
});

// ==========================================
// 🚀 Iniciar servidor
// ==========================================
app.listen(PORT, () => {
    console.log(`🌐 Servidor corriendo en: http://localhost:${PORT}`);
    console.log(`📂 Carpeta pública: ${path.join(__dirname, 'public')}`);
});