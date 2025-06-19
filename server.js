// IMPORTA EL FRAMEWORK EXPRESS PARA CREAR EL SERVIDOR WEB
const express = require('express');
// IMPORTA MONGOOSE PARA INTERACTUAR CON MONGODB
const mongoose = require('mongoose');
// IMPORTA BCRYPT PARA ENCRIPTAR CONTRASEÑAS
const bcrypt = require('bcrypt');
// IMPORTA CORS PARA PERMITIR SOLICITUDES DE DIFERENTES DOMINIOS
const cors = require('cors');
// IMPORTA BODY-PARSER PARA PROCESAR DATOS JSON EN LAS SOLICITUDES
const bodyParser = require('body-parser');

// CREA UNA INSTANCIA DE LA APLICACIÓN EXPRESS
const app = express();

// CAMBIO IMPORTANTE PARA RAILWAY: USA process.env.PORT
const PORT = process.env.PORT || 3000; // USA EL PUERTO QUE ASIGNE RAILWAY O LOCAL 3000

// MIDDLEWARE
app.use(cors()); // HABILITA CORS
app.use(bodyParser.json()); // PERMITE PARSEAR JSON
app.use(express.static('public')); // SIRVE ARCHIVOS ESTÁTICOS DESDE "public"

// CONEXIÓN A MONGODB ATLAS USANDO VARIABLE DE ENTORNO
mongoose.connect(process.env.MONGODB_URI, {
    useNewUrlParser: true,
    useUnifiedTopology: true
})
.then(() => console.log('CONECTADO A MONGODB ATLAS'))
.catch(err => console.error('ERROR DE CONEXIÓN:', err));

// ESQUEMAS Y MODELOS
const UsuarioSchema = new mongoose.Schema({
    nombre: String,
    email: String,
    password: String
});
const Usuario = mongoose.model('Usuario', UsuarioSchema);

const PastelSchema = new mongoose.Schema({
    nombre: String,
    precio: Number
});
const Pastel = mongoose.model('Pastel', PastelSchema);

const EmpleadoSchema = new mongoose.Schema({
    nombre: String,
    rol: String
});
const Empleado = mongoose.model('Empleado', EmpleadoSchema);

const PedidoSchema = new mongoose.Schema({
    cliente: String,
    producto: String
});
const Pedido = mongoose.model('Pedido', PedidoSchema);

// RUTAS DE AUTENTICACIÓN

app.post('/registro', async (req, res) => {
    const { nombre, email, password } = req.body;
    const hashedPassword = await bcrypt.hash(password, 10);
    const nuevoUsuario = new Usuario({ nombre, email, password: hashedPassword });
    await nuevoUsuario.save();
    res.status(201).send('Usuario registrado');
});

app.post('/login', async (req, res) => {
    const { email, password } = req.body;
    const usuario = await Usuario.findOne({ email });
    if (!usuario) return res.status(401).send('Usuario no encontrado');
    const valid = await bcrypt.compare(password, usuario.password);
    if (!valid) return res.status(401).send('Contraseña incorrecta');
    res.send('Inicio de sesión exitoso');
});

// CRUD PASTELES

app.get('/api/pasteles', async (req, res) => {
    const pasteles = await Pastel.find();
    res.json(pasteles);
});

app.post('/api/pasteles', async (req, res) => {
    const nuevo = new Pastel(req.body);
    await nuevo.save();
    res.status(201).send('Pastel creado');
});

app.delete('/api/pasteles/:id', async (req, res) => {
    await Pastel.findByIdAndDelete(req.params.id);
    res.send('Pastel eliminado');
});

// CRUD EMPLEADOS

app.get('/api/empleados', async (req, res) => {
    const empleados = await Empleado.find();
    res.json(empleados);
});

app.post('/api/empleados', async (req, res) => {
    const nuevo = new Empleado(req.body);
    await nuevo.save();
    res.status(201).send('Empleado agregado');
});

app.delete('/api/empleados/:id', async (req, res) => {
    await Empleado.findByIdAndDelete(req.params.id);
    res.send('Empleado eliminado');
});

// CRUD PEDIDOS

app.get('/api/pedidos', async (req, res) => {
    const pedidos = await Pedido.find();
    res.json(pedidos);
});

app.post('/api/pedidos', async (req, res) => {
    const nuevo = new Pedido(req.body);
    await nuevo.save();
    res.status(201).send('Pedido registrado');
});

app.delete('/api/pedidos/:id', async (req, res) => {
    await Pedido.findByIdAndDelete(req.params.id);
    res.send('Pedido eliminado');
});

// INICIAR SERVIDOR CON PUERTO DINÁMICO PARA PRODUCCIÓN
app.listen(PORT, () => {
    console.log(`Servidor escuchando en http://localhost:${PORT}`);
});

// Iniciar el servidor
app.listen(PORT, () => {
    console.log(`Servidor escuchando en http://localhost:${PORT}`);
});
