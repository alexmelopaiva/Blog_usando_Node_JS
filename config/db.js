if(process.env.NODE_ENV == 'production'){
    module.exports = {mongoURI: 'mongodb+srv://alexpaiva:alexmpx01@cluster0.ibewe.mongodb.net/blogapp?retryWrites=true&w=majority'}
}else{
    module.exports = {mongoURI: 'mongodb://localhost/blogapp'}
}