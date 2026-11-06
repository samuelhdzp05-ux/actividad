const express = require('express');
const path = require('path');

const app = express();
const PORT = 3000;

// Middleware para leer datos de formularios enviados por POST.
// Debe ir ANTES de las rutas que usan req.body.
app.use(express.urlencoded({ extended: true }));

// Evita que caracteres como < o > se interpreten como HTML.
function escapar(texto) {
  return String(texto)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');
}

// Si el campo llega vacío o no llega, muestra un texto en su lugar.
function valor(dato) {
  const texto = dato === undefined || dato === null ? '' : String(dato).trim();
  return texto === '' ? '(sin dato)' : escapar(texto);
}

// Devuelve una lista con los errores encontrados (vacía si todo está bien).
function validar(datos) {
  datos = datos || {};
  const limpio = (v) => (v === undefined || v === null ? '' : String(v).trim());
  const errores = [];

  const nombre = limpio(datos.nombre);
  const apellido = limpio(datos.apellido);
  const edad = limpio(datos.edad);
  const correo = limpio(datos.correo);
  const programa = limpio(datos.programa);

  if (nombre === '') errores.push('El nombre es obligatorio.');
  if (apellido === '') errores.push('El apellido es obligatorio.');

  if (edad === '') {
    errores.push('La edad es obligatoria.');
  } else if (!/^\d+$/.test(edad) || Number(edad) < 1 || Number(edad) > 120) {
    errores.push('La edad debe ser un número entero entre 1 y 120.');
  }

  if (correo === '') {
    errores.push('El correo electrónico es obligatorio.');
  } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(correo)) {
    errores.push('El correo electrónico no tiene un formato válido.');
  }

  if (programa === '') errores.push('El programa académico es obligatorio.');

  return errores;
}

function paginaError(metodo, errores) {
  const items = errores.map((e) => `<li>${escapar(e)}</li>`).join('\n      ');
  return `<!DOCTYPE html>
<html lang="es">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1">
  <title>Datos incompletos</title>
  <style>
    body { font-family: Georgia, 'Times New Roman', serif; background: #f2f5f7; color: #1d2b36; margin: 0; padding: 2rem 1rem; }
    main { max-width: 34rem; margin: 0 auto; background: #fff; border: 1px solid #c9d3da; border-radius: 6px; padding: 2rem; }
    h1 { font-size: 1.5rem; margin-top: 0; }
    .aviso { background: #fbe9e7; border-left: 4px solid #b3392b; padding: .75rem 1rem; margin-bottom: 1rem; }
    a { color: #1b5e8c; font-weight: bold; }
  </style>
</head>
<body>
  <main>
    <h1>No se pudo registrar</h1>
    <p class="aviso">Los datos recibidos mediante ${metodo} tienen errores. Corrígelos y vuelve a enviar.</p>
    <ul>
      ${items}
    </ul>
    <a href="/">Volver al formulario</a>
  </main>
</body>
</html>`;
}

function paginaRespuesta(metodo, datos) {
  datos = datos || {};
  return `<!DOCTYPE html>
<html lang="es">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1">
  <title>Datos recibidos por ${metodo}</title>
  <style>
    body { font-family: Georgia, 'Times New Roman', serif; background: #f2f5f7; color: #1d2b36; margin: 0; padding: 2rem 1rem; }
    main { max-width: 34rem; margin: 0 auto; background: #fff; border: 1px solid #c9d3da; border-radius: 6px; padding: 2rem; }
    h1 { font-size: 1.5rem; margin-top: 0; }
    .aviso { background: #e3f1ea; border-left: 4px solid #2f7d57; padding: .75rem 1rem; margin-bottom: 1.5rem; }
    dl { margin: 0 0 1.5rem; }
    dt { font-weight: bold; margin-top: .75rem; }
    dd { margin: .15rem 0 0; }
    a { color: #1b5e8c; font-weight: bold; }
  </style>
</head>
<body>
  <main>
    <h1>Registro recibido</h1>
    <p class="aviso">Los datos fueron recibidos mediante ${metodo}.</p>
    <dl>
      <dt>Nombre</dt><dd>${valor(datos.nombre)}</dd>
      <dt>Apellido</dt><dd>${valor(datos.apellido)}</dd>
      <dt>Edad</dt><dd>${valor(datos.edad)}</dd>
      <dt>Correo electrónico</dt><dd>${valor(datos.correo)}</dd>
      <dt>Programa académico</dt><dd>${valor(datos.programa)}</dd>
    </dl>
    <a href="/">Volver al formulario</a>
  </main>
</body>
</html>`;
}

// Sirve el formulario en http://localhost:3000
app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'formulario.html'));
});

// Datos por GET: viajan en la URL y se leen con req.query
app.get('/registro-get', (req, res) => {
  const errores = validar(req.query);
  if (errores.length > 0) {
    return res.status(400).send(paginaError('GET', errores));
  }
  res.send(paginaRespuesta('GET', req.query));
});

// Datos por POST: viajan en el cuerpo de la petición y se leen con req.body
app.post('/registro-post', (req, res) => {
  const errores = validar(req.body);
  if (errores.length > 0) {
    return res.status(400).send(paginaError('POST', errores));
  }
  res.send(paginaRespuesta('POST', req.body));
});

app.listen(PORT, () => {
  console.log(`Servidor ejecutándose en http://localhost:${PORT}`);
});