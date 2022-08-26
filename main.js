const { response } = require("express");
const express = require("express");
const Conteiner = require("./Conteiner");
const exp = require("constants");
const { Server: HttpServer } = require("http");
const { Server: IOServer } = require("socket.io");
const { Router } = express;
const routerProductos = Router();
const app = express();
const port = process.env.PORT || 8080;
const conteiner = new Conteiner("Trabajo.txt");
const carrito = new Conteiner("carrito.txt")
const httpServer = new HttpServer(app);
const io = new IOServer(httpServer);

app.use(express.static("public"));


routerProductos.get("/", (req, res) => {
  try{
    res.sendFile("index.html");
  }
  catch(error){
    console.log(error)
  }

});
routerProductos.get("/carrito",  (req, res) =>{
  try {
    res.sendFile("index.html", { root: __dirname });
  } catch (error) {
    console.log(error)
  }

});

io.on("connection", async (socket) =>{
  try {
   
    let productos = await conteiner.bringAll();
    const mensaje = {
      productos,
    };
    socket.emit("mensaje-servidor", mensaje);
  } 
  catch (error){
    console.log(error)
  }
  socket.on("producto-nuevo", async (producto) =>{
    try {
    await conteiner.save(producto);
    let productos = await conteiner.bringAll();
    
    const mensaje = {productos,};
    
    io.sockets.emit("mensaje-servidor2", mensaje);
    } catch (error){
      console.log(error)
    }
   
  });

  socket.on("producto-modificado", async (datos) =>{
    try {
      console.log(datos.id)
      let producto = {
          nombre: datos.nombre,
          precio: datos.precio,
          url: datos.url,
          hora: datos.hora,
      }
     
      await conteiner.upById({id: parseInt(datos.id) , ...producto })

    let productos = await conteiner.bringAll();
    
    const mensaje = {productos,};
   
    io.sockets.emit("mensaje-servidor2", mensaje);
    } catch (error){
      console.log(error)
    }


  });

  socket.on("producto-borrar", async (id) =>{
    try {
      idParse = parseInt(id)
      await conteiner.deleteForId(idParse)
 let productos = await conteiner.bringAll();
 
 const mensaje = {productos,};
  
 io.sockets.emit("mensaje-servidor2", mensaje);
    } catch (error){
      console.log(error)
    }

   });
   socket.on("agregar-carrito", async (producto) =>{
    try {
      carrito.save(producto)
    } catch (error){
      
    }
  });

});

io.on("connection", async (socket) =>{
  try {
    let productos = await carrito.bringAll()
  
    const mensaje = {productos,};
    
    socket.emit("mensaje-servidor6", mensaje);
  } catch (error) {
    console.log(error)
  }

  socket.on("producto-borrar-carrito", async (id) =>{
    try {
      idParse = parseInt(id)
      await carrito.deleteForId(idParse)
     let productos = await carrito.bringAll();
     const mensaje ={productos,};
     io.sockets.emit("mensaje-servidor7", mensaje);
    }
     catch(error) {
      console.log(error)
    }
    
       });
})
app.use("/", routerProductos)


httpServer.listen(port, () =>{
  console.log(`Server listening on port ${port}`);
});

