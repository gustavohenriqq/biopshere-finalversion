const express = require('express')
const cors = require('cors')

const financeiro = require('./routes/financeiro')
const admin = require('./routes/admin')

const app = express()
app.use(cors())
app.use(express.json())

app.use('/api/financeiro', financeiro)
app.use('/api/admin', admin)

const PORT = process.env.PORT || 3001
app.listen(PORT, () => console.log(`API rodando em http://localhost:${PORT}`))
