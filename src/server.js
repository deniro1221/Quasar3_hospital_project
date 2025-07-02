import express from 'express'
import bodyParser from 'body-parser'
import cors from 'cors'
import process from 'process'

// Uvozi rute za login, sestru i kuhare
import loginRouter from './api/login.js'
import nurseRouter from './api/crudNurse.js'
import chefRouter from './api/crudChef.js'
import loginNurse from './api/loginNurse.js'
import chefLoginRouter from './api/loginChef.js'
import meniRouter from './api/meni.js'
import inputPatientRouter from './api/inputPatient.js'

const app = express()

const port = process.env.PORT || 10000

const corsOptions = {
  origin: 'https://thalassockmenu.netlify.app', // Točna domena tvog frontenda
  methods: 'GET,HEAD,PUT,PATCH,POST,DELETE',
  credentials: true, // Ako koristiš kolačiće ili Authorization headere
  optionsSuccessStatus: 204, // Neki stariji browseri zahtijevaju 204 umjesto 200
}

app.use(cors(corsOptions)) // Koristi corsOptions
// Eksplicitno dozvoli OPTIONS preflight zahtjeve za sve rute
app.options('*', cors(corsOptions))

app.use(bodyParser.json())

// Rute za login
app.use('/', loginRouter)

// Rute za sestru
app.use('/nurse', nurseRouter)

// Rute za kuhare
app.use('/chef', chefRouter)

// Login sestra
app.use('/login_nurse', loginNurse)

// Login kuhar
app.use('/login_chef', chefLoginRouter)

// Meni
app.use('/', meniRouter)

// Input pacijent
app.use('/', inputPatientRouter)

app.listen(port, () => {
  console.log(`Server je pokrenut na http://localhost:${port}`)
})

//frontned app you can start on: https://thalassockmenu.netlify.app/
