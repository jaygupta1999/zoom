const express = require('express');
const app = express();
const server = require('http').Server(app);
const io = require('socket.io')(server);
const { v4: uuidv4} = require('uuid');
const { ExpressPeerServer } = require('peer');
const peerServer = ExpressPeerServer(server,{
   debug: true
});

const rateLimit = require("express-rate-limit");
const limiter = rateLimit({
   windowMs: 60 * 1000, // 1 minutes
   max: 10, // limit each IP to 100 requests per windowMs
   message: 'Too many requests from this IP, Please try later after 10 mins'
 });

 
app.set('view engine','ejs'); 
app.use(express.static('public'));
app.use('/peerjs',peerServer);
app.use(express.json({ limit: '10kb' }));
app.use(limiter);

app.get('/', (req,res)=>{
   res.render('home',{roomId: uuidv4()})
   //res.redirect(`/${uuidv4()}`);
})

app.get('/:room', (req,res)=>{
   res.render('room',{ roomId: req.params.room})
})

io.on('connection', socket=>{

   socket.on('join-room',(roomId,userId)=>{
         socket.join(roomId);
         socket.to(roomId).broadcast.emit('user-connected', userId);
         socket.on('message', message=>{
         io.to(roomId).emit('createMessage', message)
      })
      
   })

});

server.listen(process.env.PORT || 3000,{
   console.log('Server listening at port 3000');
