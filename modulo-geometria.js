

/*

    Tareas:
    ------

    1) Modificar a función "generarSuperficie" para que tenga en cuenta los parametros filas y columnas al llenar el indexBuffer
       Con esta modificación deberían poder generarse planos de N filas por M columnas

    2) Modificar la funcion "dibujarMalla" para que use la primitiva "triangle_strip"

    3) Crear nuevos tipos funciones constructoras de superficies

        3a) Crear la función constructora "Esfera" que reciba como parámetro el radio

        3b) Crear la función constructora "TuboSenoidal" que reciba como parámetro la amplitud de onda, longitud de onda, radio del tubo y altura.
        (Ver imagenes JPG adjuntas)
        
        
    Entrega:
    -------

    - Agregar una variable global que permita elegir facilmente que tipo de primitiva se desea visualizar [plano,esfera,tubosenoidal]
    
*/


var superficie3D;
var mallaDeTriangulos;

var filas=30;
var columnas=30;

function getUrlVars() {
    var vars = {};
    var parts = window.location.href.replace(/[?&]+([^=&]+)=([^&]*)/gi,    
    function(m,key,value) {
      vars[key] = value;
    });
    return vars;
}

var forma= getUrlVars()["forma"]

function crearGeometria(){
    
    superficie3D = null;
    switch(forma){
        case "plano":
            superficie3D = new Plano(3,3);    
            break;
        case "esfera":
            superficie3D = new Esfera(2);
            break;
        case "cilindro":
            superficie3D = new Cilindro(2,2);
            break;
        case "tubo_senoidal":
            superficie3D = new TuboSenoidal(0.1,5,1,2);
            break;
        default:
            throw "Superficie: <" + forma + "> no existe"
    }
    
    mallaDeTriangulos=generarSuperficie(superficie3D,filas,columnas);
    
}

function dibujarGeometria(){

    dibujarMalla(mallaDeTriangulos);

}

function Plano(ancho,largo){

    this.getPosicion=function(u,v){
        /*supon u,v valores entre 0 y 1*/
        var x=(u-0.5)*ancho;
        var z=(v-0.5)*largo;
        return [x,0,z];
    }

    this.getNormal=function(u,v){
        /*plano perpendicular al eje y*/
        /*podria ser un parametro como ancho y largo*/
        return [0,1,0];
    }

    this.getCoordenadasTextura=function(u,v){
        return [u,v];
    }
}

function Esfera(radio){

    this.getPosicion=function(u,v){
        /*latitud -pi/2 y pi/2 o entre 0 y pi
        longitud entrfe 0 y 360*/
        var longitud = u * 2 * Math.PI;
        var latitud = v * Math.PI;
        var x = radio * Math.cos(longitud) * Math.sin(latitud);
        var y = radio * Math.sin(longitud) * Math.sin(latitud);
        var z = radio * Math.cos(latitud);
        
        return [x,y,z];
    }

    this.getNormal=function(u,v){
        //si parametro v es la latitud
        // si v esta por encima del maximo
        // puede darte negtivo la resta
        let p1 = this.getPosicion(u,v)
        return [0,1,0];
    }

    this.getCoordenadasTextura=function(u,v){
        return [u,v];
    }
}

function Cilindro(radio, altura){

    this.getPosicion=function(u,v){
        var longitud = u * 2 * Math.PI
        var x = radio * Math.cos(longitud);
        var y = v * altura;
        var z = radio * Math.sin(longitud);

        return [x,y,z];
    }

    this.getNormal=function(u,v){
        return [0,1,0];
    }

    this.getCoordenadasTextura=function(u,v){
        return [u,v];
    }
}

function TuboSenoidal(amplitud_onda, longitud_onda, radio, altura){

    this.getPosicion=function(u,v){
        var theta = u * 2 * Math.PI
        var delta = amplitud_onda * Math.sin(v * Math.PI * 2 * longitud_onda)
        //var delta = 0
        var y = v * altura;
        var x = (radio + delta) * Math.cos(theta);
        var z = (radio + delta) * Math.sin(theta);

        return [x,y,z];
    }

    this.getNormal=function(u,v){
        //mientras mas chico el delta mejor aproxima
        //para un punto determinado u,v
        // haciendo p1 - p0 y p2 - p0
        // ortogonales p1 y p0
        // ortogonales p2 y p0
        // y a eso el producto vectorial
        let p0 = this.getPosicion(u,v)
        let p1 = this.getPosicion(u+0.001,v)
        let p2 = this.getPosicion(u,v+0.001)
        return [0,1,0];
    }

    this.getCoordenadasTextura=function(u,v){
        return [u,v];
    }
}

// Truco para calcular normal de superficie
/*agarrar y decir para sierta posicion
a partir del getPosicion
podemos tomar tres puntos - uno determinado otro corrido*/ 



function generarSuperficie(superficie,filas,columnas){
    
    positionBuffer = [];
    normalBuffer = [];
    uvBuffer = [];

    for (var i=0; i < filas; i++) {
        for (var j=0; j < columnas; j++) {

            /*esto me da un valor entre 0 y 1*/
            var u=j/columnas;
            var v=i/filas;

            var pos=superficie.getPosicion(u,v);

            positionBuffer.push(pos[0]);
            positionBuffer.push(pos[1]);
            positionBuffer.push(pos[2]);

            var nrm=superficie.getNormal(u,v);

            normalBuffer.push(nrm[0]);
            normalBuffer.push(nrm[1]);
            normalBuffer.push(nrm[2]);

            var uvs=superficie.getCoordenadasTextura(u,v);

            uvBuffer.push(uvs[0]);
            uvBuffer.push(uvs[1]);

        }
    }

    // Buffer de indices de los triángulos
    
    indexBuffer=[];  
    
    for (i=0; i < filas-1; i++) {
        for (j=0; j < columnas-1; j++) {

            //agregar triangulos del quad i,j
            
            if(j == 0){
                indexBuffer.push(j + i * columnas);    
            }

            if((j == 0) && (i > 0) && (i < filas-1)){
                indexBuffer.push(j + i * columnas);
            }

            indexBuffer.push(j + (i+1) * columnas);
            indexBuffer.push((j+1) + i * columnas);
            
            if((j+1) == (columnas-1)){
                indexBuffer.push((j+1) + (i+1) * columnas);
            }

            if((j+1) == (columnas-1) && (i+1 < filas-1)){
                indexBuffer.push((j+1) + (i+1) * columnas);
            }
            
            
        }
    }

    // Creación e Inicialización de los buffers

    webgl_position_buffer = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, webgl_position_buffer);
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(positionBuffer), gl.STATIC_DRAW);
    webgl_position_buffer.itemSize = 3;
    webgl_position_buffer.numItems = positionBuffer.length / 3;

    webgl_normal_buffer = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, webgl_normal_buffer);
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(normalBuffer), gl.STATIC_DRAW);
    webgl_normal_buffer.itemSize = 3;
    webgl_normal_buffer.numItems = normalBuffer.length / 3;

    webgl_uvs_buffer = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, webgl_uvs_buffer);
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(uvBuffer), gl.STATIC_DRAW);
    webgl_uvs_buffer.itemSize = 2;
    webgl_uvs_buffer.numItems = uvBuffer.length / 2;


    webgl_index_buffer = gl.createBuffer();
    gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, webgl_index_buffer);
    gl.bufferData(gl.ELEMENT_ARRAY_BUFFER, new Uint16Array(indexBuffer), gl.STATIC_DRAW);
    webgl_index_buffer.itemSize = 1;
    webgl_index_buffer.numItems = indexBuffer.length;

    return {
        webgl_position_buffer,
        webgl_normal_buffer,
        webgl_uvs_buffer,
        webgl_index_buffer
    }
}

function dibujarMalla(mallaDeTriangulos){
    
    // Se configuran los buffers que alimentaron el pipeline
    gl.bindBuffer(gl.ARRAY_BUFFER, mallaDeTriangulos.webgl_position_buffer);
    gl.vertexAttribPointer(shaderProgram.vertexPositionAttribute, mallaDeTriangulos.webgl_position_buffer.itemSize, gl.FLOAT, false, 0, 0);

    gl.bindBuffer(gl.ARRAY_BUFFER, mallaDeTriangulos.webgl_uvs_buffer);
    gl.vertexAttribPointer(shaderProgram.textureCoordAttribute, mallaDeTriangulos.webgl_uvs_buffer.itemSize, gl.FLOAT, false, 0, 0);

    gl.bindBuffer(gl.ARRAY_BUFFER, mallaDeTriangulos.webgl_normal_buffer);
    gl.vertexAttribPointer(shaderProgram.vertexNormalAttribute, mallaDeTriangulos.webgl_normal_buffer.itemSize, gl.FLOAT, false, 0, 0);
       
    gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, mallaDeTriangulos.webgl_index_buffer);


    if (modo!="wireframe"){
        gl.uniform1i(shaderProgram.useLightingUniform,(lighting=="true"));                    
        /*
            Aqui es necesario modificar la primitiva por triangle_strip
        */
        gl.drawElements(gl.TRIANGLE_STRIP, mallaDeTriangulos.webgl_index_buffer.numItems, gl.UNSIGNED_SHORT, 0);
    }
    
    if (modo!="smooth") {
        gl.uniform1i(shaderProgram.useLightingUniform,false);
        gl.drawElements(gl.LINE_STRIP, mallaDeTriangulos.webgl_index_buffer.numItems, gl.UNSIGNED_SHORT, 0);
    }
 
}

