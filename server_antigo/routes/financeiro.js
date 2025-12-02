const express = require('express')
const router = express.Router()
const fs = require('fs')
const dbFile = __dirname + '/../data/financeiro.json'

function read() {
  try {
    return JSON.parse(fs.readFileSync(dbFile))
  } catch (e) {
    return []
  }
}
function write(data) {
  fs.writeFileSync(dbFile, JSON.stringify(data, null, 2))
}

router.get('/', (req, res) => {
  res.json(read())
})

router.post('/add', (req, res) => {
  const { descricao, tipo, valor, data } = req.body
  const arr = read()
  const item = {
    id: Date.now(),
    descricao,
    tipo,
    valor: Number(valor),
    data: data || new Date().toISOString(),
  }
  arr.unshift(item)
  write(arr)
  res.json({ message: 'ok', item })
})

router.delete('/:id', (req, res) => {
  const id = Number(req.params.id)
  let arr = read()
  arr = arr.filter((x) => x.id !== id)
  write(arr)
  res.json({ message: 'removed' })
})

module.exports = router
