const express = require('express')
const cors = require('cors')
const path = require('path')
const WebSocket = require('ws')
require('dotenv').config()

const app = express()

const ip = process.env.IP
const port = process.env.PORT

app.use(cors())
app.use(express.json())

let timers = new Map()

// Broadcast function to send timers to all connected clients
function broadcastTimer(timer) {
    const data = JSON.stringify({ addedTimer: timer })

    wss.clients.forEach((client) => {
        if (client.readyState === WebSocket.OPEN) {
            client.send(data)
        }
    })
}

app.use('/bootstrap', express.static(path.join(__dirname, 'node_modules', 'bootstrap', 'dist')))
app.use('/bootstrap-icons', express.static(path.join(__dirname, 'node_modules', 'bootstrap-icons', 'font')))
app.use(express.static(path.join(__dirname, 'frontend')))

app.post('/add-timer', (req, res) => {
    const { name, endTime, createdTime } = req.body

    if (name == '') {
        res.status(400).json({ message: 'Timer sem nome!' })
        return
    }

    if (!timers.has(name)) {
        timers.set(name, { createdTime, endTime })
        broadcastTimer({ [name]: timers.get(name) })
        console.log(`Timer adicionado: Nome: ${name}, Tempo de término: ${new Date(endTime).toLocaleTimeString()}`)
        res.status(201).json({ message: 'Timer adicionado com sucesso!' })
        return
    } else {
        res.status(400).json({ message: 'Timer já cadastrado!' })
        return
    }
})

app.post('/remove-timer', (req, res) => {
    const { name } = req.body
    if (timers.has(name)) {
        let timer = timers.get(name)
        timers.delete(name)
        console.log(`Timer removido: Nome: ${name}, Tempo de término: ${new Date(timer.endTime).toLocaleTimeString()}`)
    }
    res.sendStatus(200)
})

app.get('/timers', (req, res) => {
    const jsonObject = Object.fromEntries(timers)
    res.json(jsonObject)
})

app.get('/favicon.ico', (req, res) => {
    res.sendFile(__dirname + '/favicon.ico')
})

setInterval(() => {
    console.log('Timers ativos:', timers)
}, 60000) // 60000 milis = 1 min

const server = app.listen(port, ip, () => {
    console.log(`Servidor rodando em http://${ip}:${port}`)
})

const wss = new WebSocket.Server({ server })