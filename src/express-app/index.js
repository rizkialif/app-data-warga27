const express = require('express')
const routes = require('./routes')

const app = express()

app.use(express.json())

// ✅ Route root
app.get('/', (req, res) => {
  res.send(`Selamat datang di CRM Resident 27`)
})

// API routes
app.use('/api', routes)

const PORT = 3000

app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`)
})
