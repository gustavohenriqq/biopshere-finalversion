// server.js
import app from './app.js';

const port = 3001; // mesmo port usado no front: http://localhost:3001/api/...

app.listen(port, () => {
  console.log();
  console.log(`Servidor rodando no endereço http://localhost:${port}`);
  
});
