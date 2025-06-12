// importar los frameworks necesarios para ejecutar la app
const express = require('express');
const mongoose = require('mongoose');
const bodyParser = require('body-parser');
const cors = require('cors');
const bcrypt = require('bcrypt');

// crear una instancia de la aplicación express
const app = express();
const PORT = process.env.PORT || 3000;

// habilitar CORS para permitir peticiones
app.use(cors());

// permite a express entender el formato JSON
app.use(bodyParser.json());

// detectar archivos estáticos en la carpeta public
app.use(express.static('Público'));

// conectar a la base de datos de MongoDB
mongoose.connect(process.env.MONGODB_URI, {
    useNewUrlParser: true,
    useUnifiedTopology: true
})
.then(() => console.log('Conectado a MongoDBATLAS'))
.catch(err => console.error(err));

// Esquemas y modelos
const UsuarioSchema = new mongoose.Schema({
    nombre: String,
    email: String,
    password: String,
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

// Ruta para registrar un nuevo usuario
app.post('/registro', async (req, res) => {
    // Extrae nombre, email y password del cuerpo de la solicitud
    const { nombre, email, password } = req.body;
    // Encripta la contraseña antes de guardarla
    const hashedPassword = await bcrypt.hash(password, 10);
    // Crea un nuevo usuario con los datos recibidos y la contraseña encriptada
    const nuevoUsuario = new Usuario({ nombre, email, password: hashedPassword });
    // Guarda el usuario en la base de datos
    await nuevoUsuario.save();
    // Responde con un mensaje de éxito y código 201 (creado)
    res.status(201).send('Usuario registrado');
});

// Ruta de login
app.post('/login', async (req, res) => {
    const { email, password } = req.body;

    try {
        const usuario = await Usuario.findOne({ email });
        if (!usuario) return res.status(401).send('Usuario no encontrado');

        const valid = await bcrypt.compare(password, usuario.password);
        if (!valid) return res.status(401).send('Contraseña incorrecta');

        res.send('Bienvenido ' + usuario.nombre);
    } catch (err) {
        res.status(500).send('Error en el inicio de sesión');
    }
});

// CRUD Pasteles
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

// CRUD Empleados
app.get('/api/empleados', async (req, res) => {
    const empleados = await Empleado.find();
    res.json(empleados);
});

app.post('/api/empleados', async (req, res) => {
    const nuevo = new Empleado(req.body);
    await nuevo.save();
    res.status(201).send('Empleado creado');
});

app.delete('/api/empleados/:id', async (req, res) => {
    await Empleado.findByIdAndDelete(req.params.id);
    res.send('Empleado eliminado');
});

// Ruta para obtener todos los pedidos
app.get('/api/pedidos', async (req, res) => {
    // Busca todos los pedidos en la base de datos
    const pedidos = await Pedido.find();
    // Devuelve la lista de pedidos en formato JSON
    res.json(pedidos);
});

// Ruta para crear un nuevo pedido
app.post('/api/pedidos', async (req, res) => {
    // Crea un nuevo pedido con los datos recibidos en la solicitud
    const nuevo = new Pedido(req.body);
    // Guarda el pedido en la base de datos
    await nuevo.save();
    // Responde con mensaje de éxito y código 201 (creado)
    res.status(201).send('Pedido registrado');
});

// Ruta para eliminar un pedido por su ID
app.delete('/api/pedidos/:id', async (req, res) => {
    // Elimina el pedido cuyo ID se recibe en la URL
    await Pedido.findByIdAndDelete(req.params.id);
    // Responde con mensaje de éxito
    res.send('Pedido eliminado');
});

// Iniciar el servidor
app.listen(PORT, () => {
    console.log(`Servidor escuchando en http://localhost:${PORT}`);
});
