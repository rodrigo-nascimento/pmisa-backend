// importando modulos necessarios para criacao do webservice
const restful = require('node-restful')
const mongoose = restful.mongoose



//mapeamento dos atributos necessarios para os usuarios do sistema
const rubbleCollectionSchema = new mongoose.Schema({

    place_name: { type: String, require: true },
    gps_position: { type:String, require:true },
    description: { type: String, require: true },
    date_insert: { type: Date, require: true },
    actions: { type: String, require: false, enum: [] },
    solution_date: { type: Date, rquire: false},
    assessment: { type: String, require: false },
    score_assessment: { type: Number, min: 0, max: 5, require: false}    

})

// exportando o squema de ciclos de pagamentos para os outros modulos
module.exports = restful.model('RubbleCollection', rubbleCollectionSchema)

