// Carregando Módulos
  const express = require('express');
  const handlebars = require('express-handlebars');
  const bodyParser = require('body-parser');
  const app = express();
  const admin = require('./routes/admin');
  const path = require('path');
  const mongoose = require('mongoose');
  const session = require('express-session');
  const flash = require('connect-flash');
  require('./models/Postagem');
  const Postagem = mongoose.model('postagens');
  require('./models/Categoria');
  const Categoria = mongoose.model('categorias');
  const usuarios = require('./routes/usuario');
  const passport = require('passport');
  require('./config/auth')(passport);
  const db = require('./config/db')

//Configurações
  //Sessão
    app.use(session({
      secret: 'criarsenha',
      resave: true,
      saveUninitialized: true
    }))
    app.use(passport.initialize());
    app.use(passport.session());
    app.use(flash());
  //Middleware (Váriáveis globais)
    app.use((req, res, next)=>{
      res.locals.success_msg = req.flash('success_msg');
      res.locals.error_msg = req.flash('error_msg');
      res.locals.error = req.flash('error');
      res.locals.user = req.user || null;
      next();
    })
  //Body Parser
    app.use(bodyParser.urlencoded({extended: true}));
    app.use(bodyParser.json());
  //Handlebars
    const hbs = handlebars.create({defaultLayout: 'main'});
    app.engine("handlebars", hbs.engine);
    app.set("view engine", "handlebars");
  //Mongoose
    mongoose.Promise = global.Promise;
    //LOCALHOST
    //mongoose.connect('mongodb://localhost/blogapp').then(()=>{
    //NUVEM
    //mongoose.connect('mongodb+srv://alexpaiva:alexmpx01@cluster0.ibewe.mongodb.net/blogapp?retryWrites=true&w=majority').then(()=>{
    //Conectando pelo arquivo ./config/db.js
    mongoose.connect(db.mongoURI).then(()=>{
      console.log('Conectado ao MongoDB - ' + db.mongoURI);
    }).catch((erro)=>{
      console.log('Erro ao se conectar no DB: '+erro);
    })
  //Pulic
    app.use(express.static(path.join(__dirname,'public')));

//Rotas
    //Rotas administrativas (se não declarar, não terá acesso)
    app.use('/admin', admin);
    app.use('/usuarios', usuarios);

  app.get('/', (req, res)=>{
    Postagem.find().lean().populate('categoria').sort({data:'desc'}).then((postagens)=>{
      res.render('index', {postagens: postagens});  
    }).catch((erro)=>{
      req.flash('error_msg', 'Houve um erro interno ao carregar as categorias');
      res.redirect('/404');
      }) 
  })

  app.get('/404', (req, res)=>{
      res.send('Erro 404!');
  })

  app.get('/postagem/:slug', (req, res)=>{
    Postagem.findOne({slug: req.params.slug}).lean().then((postagem)=>{
        if(postagem){
            res.render('postagem/index', {postagem});
        }else{
            req.flash('error_msg', 'Está postagem não existe');
            res.redirect('/');
        }
    }).catch((error)=>{
        req.flash('error_msg', 'Houve um erro interno');
        res.redirect('/');
    })
  })

  app.get('/categorias', (req, res)=>{
    Categoria.find().lean().then((categorias)=>{
      res.render('categorias/index', {categorias: categorias});
      
  }).catch((error)=>{
      req.flash('error_msg', 'Houve um erro interno ao listar as categorias');
      res.redirect('/');
    })
})

app.get('/categorias/:slug', (req, res)=>{
  Categoria.findOne({slug: req.params.slug}).lean().then((categoria)=>{
      if(categoria){
          Postagem.find({categoria: categoria._id}).lean().then((postagens)=>{
            res.render('categorias/postagens', {postagens: postagens, categoria: categoria})
          }).catch((error)=>{
            req.flash('error_msg', 'Houve um erro ao listar as Postagens');
            res.redirect('/');
        })
      }else{
          req.flash('error_msg', 'Está categoria não existe');
          res.redirect('/');
      }
  }).catch((error)=>{
      req.flash('error_msg', 'Houve um erro interno ao carregar a categoria');
      res.redirect('/');
  })
})


//Outros
//const PORT = 8081  (rodando localmente)
const PORT = process.env.PORT || 8089
app.listen(PORT,()=> {
    console.log('Servidor rodando!!!');
})