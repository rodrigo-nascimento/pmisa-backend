const _ = require('lodash')
const jwt = require('jsonwebtoken')
const bcrypt = require('bcrypt')
const systemUsers = require('./systemUsers.js')
const env = require('../../.env')

const emailRegex = /^(([^<>()\[\]\\.,;:\s@"]+(\.[^<>()\[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/
const passwordRegex = /((?=.*\d)(?=.*[a-z])(?=.*[A-Z])(?=.*[@#$%]).{6,16})/
const cpfRegex = /([0-9]{2}[\.]?[0-9]{3}[\.]?[0-9]{3}[\/]?[0-9]{4}[-]?[0-9]{2})|([0-9]{3}[\.]?[0-9]{3}[\.]?[0-9]{3}[-]?[0-9]{2})/
const cepRegex = /[0-9]{5}-[0-9]{3}/
const logradouroRegex = /[A-Z0-9]/
const telefoneRegex = /[0-9]{8}|[0-9]{9}/

const sendErrorsFromDB = (res, dbErrors) => {
    const errors = []
    _.forIn(dbErrors.errors, error => errors.push(error.message))
    return res.status(400).json({ errors })
}

const login = (req, res, next) => {
    const email = req.body.email || ''
    const password = req.body.password || ''
    systemUsers.findOne({ email }, (err, user) => {
        if (err) {
            return sendErrorsFromDB(res, err)
        } else if (user && bcrypt.compareSync(password, user.password)) {
            const token = jwt.sign(user.toJSON(), env.authSecret, {
                expiresIn: "4h"
            })
            const { name, email } = user
            res.json({ name, email, token })
        } else {
            return res.status(400).send({ errors: ['Usuário/Senha inválidos'] });
        }
    });
}

const validateToken = (req, res, next) => {
    const token = req.body.token || ''
    jwt.verify(token, env.authSecret, function (err, decoded) {
        return res.status(200).send({ valid: !err })
    })
}

const signup = (req, res, next) => {
    console.log('signup')
    const name = req.body.name || ''
    const cpf = req.body.cpf || ''
    const email = req.body.email || ''
    const password = req.body.password || ''
    const confirmPassword = req.body.confirm_password || ''
    const active = req.body.active || ''
    if (!email.match(emailRegex)) {
        return res.status(400).send({ errors: ['O e-mail informado está inválido'] })
    }
    if (!cpf.match(cpfRegex)) {
        return res.status(400).send({
            errors: [
                "CPF Informado está incorreto."
            ]
        })
    }
    if (!password.match(passwordRegex)) {
        return res.status(400).send({
            errors: [
                "Senha precisar ter: uma letra maiúscula, uma letra minúscula, um número, uma caractere especial(@#$%) e tamanho entre 6-16."
            ]
        })
    }
    const salt = bcrypt.genSaltSync()
    const passwordHash = bcrypt.hashSync(password, salt)
    if (!bcrypt.compareSync(confirmPassword, passwordHash)) {

        return res.status(400).send({ errors: ['Senhas não conferem.'] })
    }
    systemUsers.findOne({ "documents.name": "CPF", "documents.value": cpf }, (err, user) => {
        if (err) {
            return sendErrorsFromDB(res, err)
        } else if (user) {
            return res.status(400).send({ errors: ['Usuário já cadastrado.'] })
        } else {
            const newUser = new systemUsers({ name, email, password: passwordHash, active, documents: [{ name: 'CPF', value: cpf }] })
            newUser.save(err => {
                if (err) {
                    return sendErrorsFromDB(res, err)
                } else {
                    login(req, res, next)
                }
            })
        }
    })
}

const count = (req, res, next) => {

    systemUsers.count(function (error, value) {

        if (error) {

            // convencao para tratamento de erros, sendo sempre um objeto com um atributo que posusi um array de mensagens
            res.status(500).json({ errors: [error] })

        } else {

            res.json(value)

        }

    })

}


const cadastra = (req, res, next) => {
    console.log('cadastra')
    const cep = req.body.cep || ''
    const logradouro = req.body.logradouro || ''
    const telefone = req.body.telefone || ''


    if (!cep.match(cepRegex)) {
        return res.status(400).send({ errors: ['O CEP informado é inválido'] })
    }
    if (!logradouro.match(logradouroRegex)) {
        return res.status(400).send({
            errors: [
                "Logradouro informado está incorreto."
            ]
        })
    } 
    if (!telefone.match(telefoneRegex)) {
        return res.status(400).send({
            errors: [
                "O número informado é inválido."
            ]
        }) 
    } 
}



/* const list = (req, res, next) => {

    let limit = req.body.obj[0] || 0;
    let skip = req.body.obj[1] || 0;

    systemUsers.find(function (error, users) {

        if (error) {
            return sendErrorsFromDB(res, err)
        } else {
            res.json({ users })
        }

    }).limit(limit).skip(skip)
}
 */

module.exports = { login, signup, validateToken }