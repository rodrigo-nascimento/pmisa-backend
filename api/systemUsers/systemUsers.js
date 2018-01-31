// importando modulos necessarios para criacao do webservice
const restful = require('node-restful')
const mongoose = restful.mongoose


// schema for documents register
const docSystemUserSchema = new mongoose.Schema({

    name: { type: String, require: false, uppercase: true, enum: [ 'RG', 'CPF', 'CNH', 'CERTIDAO DE CASAMENTO', 'CERTIDAO DE NASCIMENTO' ] },
    value: {type: String, require: false},
    scan: { type: Buffer, contentType: String, require: false }

})

// schema for address register
const addressSystemUserSchema = new mongoose.Schema ({

    name: { type:String, require: true, enum: [ 'RESIDENCIAL', 'COMERCIAL' ] },
    street: { type: String, require: false },
    number:{type: String, require: false},
    complement: { type: String, require:false },
    neighborhood: { type: String, require: false},
    city: { type: String, require: false },
    zip_code: {type: String, require: false},
    state:{type: String, require: false}

})

// schema for phones register
const phoneSystemUserSchema = new mongoose.Schema ({

    name: { type: String, require: true, enum: [ 'COMERCIAL', 'RESIDENCIAL', 'CELULAR', 'RECADO' ] },
    number_phone: { type: String, require: false }
    
})


// schema for system users register
const systemUserSchema = new mongoose.Schema({
    
    name: { type: String, require: true },    
    email: { type: String, require: true },
    login: { type:String, require:true },
    password: { type: String, min: 6, max: 16, require: true },
    last_login: { type: Date, require: false },
    documents: [docSystemUserSchema],
    address: [addressSystemUserSchema],
    phone: [phoneSystemUserSchema],
    active: { type: Boolean, require:true }
        
})

// exportando o squema de ciclos de pagamentos para os outros modulos
module.exports = restful.model('SystemUsers', systemUserSchema)

