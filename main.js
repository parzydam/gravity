// there is a hidden bug with values in planet.acc turning to NaN, but seems to be patched with fixnabug


let canvas = document.getElementById("canvas")
let ctx = canvas.getContext("2d")
canvas.style.background = "black"
canvas.height = 3000
canvas.width = 3000
let canvasRect = canvas.getBoundingClientRect()

console.log(document.body.style)

localStorage.setItem("buildNewStar",0)
localStorage.setItem("newStarMass",0)
localStorage.setItem("newStarRadius",0)
localStorage.setItem("newStarColor",0)
var buildNewPlanet = false
var newStarMass, newStarColor, newStarRadius
var mousePos,newPlanetIndex
newPlanetIndex = 0
var G = 0.001
function cleanTheScreen(){
    ctx.fillStyle = "black"
    ctx.globalAlpha = 1
    ctx.fillRect(0-canvasRect.x-50,0-canvasRect.y-50,window.innerWidth+50,window.innerHeight+50)
    canvasRect = canvas.getBoundingClientRect()
}

function round(num,n=2){
    return Math.round(num*10**n)/10**n
}

var planets = []
var stars = []

class Vector {
    constructor(x,y){
        this.x = x
        this.y = y
    }

    static random(){
        let dirs = [-3,-2,-1,1,2,3]
        let x = dirs[Math.floor(Math.random()*(5+1))]
        let y = dirs[Math.floor(Math.random()*(5+1))]

        return new Vector(x,y)
    }

    add(B,return_= false){

        if(return_){
            return new Vector(this.x+B.x,this.y+B.y)
        }

        this.x+=B.x
        this.y += B.y
    }

    scale(scalar){
        this.x*= scalar
        this.y*= scalar
    }
    
    round(n_decimals=2){
        this.x = round(this.x,n_decimals)
        this.y = round(this.y,n_decimals)
    }

    magnitude(){
        return Math.hypot(this.x,this.y)
    }

    normalize(){
        this.scale(1/this.magnitude())
    }

    getDirTo(B){
        let x = B.x - this.x
        let y = B.y - this.y
        
        let dirVec = new Vector(x,y)
        dirVec.normalize()
        dirVec.round()
        return dirVec
    }

    static getDist(A,B){
        return Math.sqrt(
            Math.pow(A.x-B.x,2) +
            Math.pow(A.y-B.y,2)
            )
    }

    copy(){
        return new Vector(this.x,this.y)
    }


}


class Planet{
    constructor(startPos,startVel,speed,r,w,color){
        this.pos = startPos
        this.acc = new Vector(0,0)
        this.velocity = startVel
        this.velocity.normalize()
        this.velocity.scale(speed)
        this.r = parseInt(r)
        this.w = parseInt(w)
        this.isStar = this.w>50
        this.color = color
        this.starClicked = false
        this.collided = false
        this.piece = false
    }
    fixAccNaNBug(){
        if(isNaN(parseFloat(this.acc.x))){
            this.acc = new Vector(0,0)
        }
    }
    move(){
        if(!this.isStar){
            this.velocity.add(this.acc)
            this.pos.add(this.velocity)
            this.acc.scale(0)
            if(this.acc.x == NaN){
                clearInterval(interval)
                console.log("stopped")
            }
        }
        if(this.piece){
            this.r*=0.99
        }
    }

    getDirToOtherPlanets(planets){
        for(let i in planets){
            if(planets[i]!=this){
            let dir = this.pos.getDirTo(planets[i].pos)
            console.log(dir)
            dir.scale(100)
            console.log(dir)
            ctx.beginPath()
            ctx.strokeStyle = "red"
            ctx.moveTo(this.pos.x,this.pos.y)
            let end = this.pos.add(dir,true)
            ctx.lineTo(end.x,end.y)
            ctx.stroke()
            ctx.closePath()
            }
        }
    }

    collide(planets){
        planets = planets.filter(planet=>planet.r>=2)
        if(!this.collided&!this.isStar){
            for(let i in planets){
                if(planets[i]!=this){
                    let dist = Vector.getDist(this.pos,planets[i].pos)
                    if(dist<(this.r+planets[i].r)){
                        this.collided = true
                        planets[i].collided = true
                    }
                }
            }
        }
    }

    burst(){
        if(this.collided&!this.isStar&!this.piece){
            planets = planets.filter(x=>x!=this)
            let n = Math.floor(Math.random() * (3 - 2 + 1) + 2)
            for(let i = 1;i<=n;i++){
                let randomPos = Vector.random()
                randomPos.normalize()
                randomPos.add(this.pos)

                let randomVel = Vector.random()
                let newPiece = new Planet(randomPos,randomVel,3,this.r/n,this.w/n,this.color)
                newPiece.piece = true
                planets.push(newPiece)
            }
        }
    }

    gravity(planets){
        for(let i in planets){
            if(planets[i]!=this){
                let dir = this.pos.getDirTo(planets[i].pos)
                let force = calculateGravityForce(this,planets[i])
                dir.scale(force)
                this.acc.add(dir)
                this.acc.round()


            }
        }
    }

    show(){
        ctx.beginPath()

        ctx.fillStyle = this.color
        ctx.arc(this.pos.x,this.pos.y,this.r,0,Math.PI*2)
        ctx.fill()

        ctx.closePath()
    }

    updateClick(){
        this.starClicked = !this.starClicked
    }
}

function calculateGravityForce(A,B){
    let force = G*A.w*B.w/Vector.getDist(A.pos,B.pos)**1.8
    return force
}
let uranus = new Planet(new Vector(700,500),new Vector(-1,1.5),1.43,20,2.3,"yellow")
let mercury = new Planet(new Vector(500,500),new Vector(1.5,-1),1.7,12,2.4,"pink")
let star = new Planet(new Vector(600,900),new Vector(0,0),0,5,333000,"red",true)
let earth = new Planet(new Vector(800,300),new Vector(-1,2),1,15,1,"blue")
let venus = new Planet(new Vector(400,1000),new Vector(-0.6,-1.5),2,16,1.4,"purple")
let moon = new Planet(new Vector(600,1200),new Vector(1,-1.5),1.43,12,2.3,"green")
let pluto = new Planet(new Vector(1600,-200),new Vector(-0.6,1.5),2,16,10,"brown")


planets.push(star,earth,mercury,venus,uranus,moon,pluto)
var newPlanetIndex = planets.length

function animatePlanets(){
    for(let i in planets){
        planets[i].show()
    }
}

function movePlanets(){
    for(let i in planets){
        planets[i].move()
        
    }
}

function getDirs(){
    for(let i in planets){
        planets[i].gravity(planets)
    }
}

function collideAndBurst(){
    
    for(let i in planets){

        planets[i].collide(planets)
        planets[i].burst()
        planets[i].fixAccNaNBug()
    }
}

function createNewStar(){
    newStarMass = localStorage.getItem("newStarMass")
    newStarColor = localStorage.getItem("newStarColor")
    newStarRadius = localStorage.getItem("newStarRadius")
    newStarDirX = parseInt(localStorage.getItem("dirX"))
    newStarDirY = parseInt(localStorage.getItem("dirY"))
    planets[newPlanetIndex] = new Planet(mousePos,new Vector(newStarDirX,newStarDirY),3,newStarRadius,newStarMass,
                                                    newStarColor)

}

function run(){
    stars = planets.filter(x=>x.isStar)


    buildNewPlanet = JSON.parse(localStorage.getItem("buildNewStar"))
    if(buildNewPlanet){
        for(let i in planets){
            planets[i].fixAccNaNBug()
        }
        createNewStar()
        cleanTheScreen()
        animatePlanets()
    } else {
        cleanTheScreen()
        getDirs()
        for(let i in planets){
            planets[i].fixAccNaNBug()
        }
        movePlanets()
        animatePlanets()
        collideAndBurst()
    }

    let nanPlanets = planets.filter(X=>isNaN(parseFloat(X.acc.x)))
    console.log(nanPlanets)
}

function detectMouse(e){
    let rect = canvas.getBoundingClientRect()
    let x = e.clientX -rect.left
    let y = e.clientY - rect.top 
    mousePos = new Vector(x,y)
    var clickedStars = stars.filter(x=>x.starClicked)
    for(let i in clickedStars){
        clickedStars[i].pos = mousePos
    }
}

window.addEventListener("mousemove",detectMouse)
window.addEventListener("click",(e)=>{
    detectMouse(e)
    if(buildNewPlanet){
        localStorage.setItem("buildNewStar",false)
        localStorage.setItem("chooseDir",true)
        newPlanetIndex+=1
    } else {
        for(let i in stars){
            let dist = Vector.getDist(stars[i].pos,mousePos)
            if(dist<=stars[i].r){
                stars[i].updateClick()
            }
        }
    }
})

let constantSlider = document.getElementById("cosmConstant")

constantSlider.oninput = function(){
    G = Math.pow(10,-(constantSlider.value)/100000)
}

var interval = setInterval(run,10)

run()
let zero = new Vector(0,0)

let zero2 = new Vector(0,0)

zero.add(zero2)
zero.scale(0)
console.log(zero)