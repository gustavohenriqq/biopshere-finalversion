const express = require('express')
const router = express.Router()
const fs = require('fs')
const dbFile = __dirname + '/../data/users.json'

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

router.get('/users', (req, res) => {
  res.json(read())
})

router.post('/users/add', (req, res) => {
  const { name, email, role } = req.body
  const arr = read()
  const user = { id: Date.now(), name, email, role }
  arr.unshift(user)
  write(arr)
  res.json({ message: 'user added', user })
})

module.exports = router
