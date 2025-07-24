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

const port = process.env.PORT || 3000

app.use(cors())

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

app.listen(port, '0.0.0.0', () => {
  console.log(`Server je pokrenut na portu ${port} i sluša na svim mrežnim interfejsima`)
})
