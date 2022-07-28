class Sprite{
    constructor({position,imageSrc,scale=1,frameMax=1}){
        this.position=position
        this.width=50
        this.height=150
        this.img=new Image()
        this.img.src=imageSrc
        this.scale=scale
        this.framesMax=frameMax
        this.frameCurrent=0
        this.framesElapsed=0
        this.framesHold=10
    }

    draw(){
       c.drawImage(
        this.img,
        this.frameCurrent*(this.img.width/this.framesMax),
        0,
        this.img.width/this.framesMax,
        this.img.height,
        this.position.x,
        this.position.y,
        this.img.width/this.framesMax*this.scale,
        this.img.height*this.scale
        )
    }

    update(){
        this.draw()
        this.framesElapsed++

        if(this.framesElapsed%this.framesHold===0){
        
            if(this.frameCurrent<this.framesMax-1){
                this.frameCurrent++
            }else{
                this.frameCurrent=0
            }
        }
    }

}


////////--- Fighters class---///////

class Figther extends Sprite{
    constructor({position,velocity,offset,
    color='navy'}){
        this.position=position
        this.velocity=velocity
        this.height=150
        this.width=50
        this.lastKey=''
        this.attackBox={
            position:{
                x:this.position.x,
                y:this.position.y
            },
            offset,
            width: 100,
            height:50
        }
        this.color=color
        this.isAttackig
        this.health=100
    }

    draw(){
        c.fillStyle='red'
        c.fillRect(this.position.x,this.position.y,this.width,150)
        
        if(this.isAttackig){
            c.fillStyle='pink'
            c.fillRect(
                this.attackBox.position.x,
                this.attackBox.position.y,
                this.attackBox.width,
                this.attackBox.height)
        }
    }

    update(){
        this.draw()
        this.attackBox.position.x=this.position.x-this.attackBox.offset.x
        this.attackBox.position.y=this.position.y
        
        this.position.x+=this.velocity.x 
        this.position.y +=this.velocity.y

        if(this.position.y+this.height +this.velocity.y>=canvas.height-10){
            this.velocity.y=0
        }else{
            this.velocity.y+=gravity
        }
   
    }

    attack(){
        this.isAttackig=true
        setTimeout(()=>{
          this.isAttackig=false
        },100)  
      }

}