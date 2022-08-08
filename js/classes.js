class Sprite{
    constructor({
        position,
        imageSrc,
        scale=1,
        frameMax=1,
        width=50,
        height=150,
        offset={x:0,y:0}
    }){

        this.position=position
        this.width=width
        this.height=height
        this.image=new Image()
        this.image.src=imageSrc
        this.scale=scale
        this.framesMax=frameMax
        this.frameCurrent=0
        this.framesElapsed=0
        this.framesHold=10
        this.offset=offset
    }

    draw(){
       c.drawImage(
        this.image,
        this.frameCurrent*(this.image.width/this.framesMax),
        0,
        this.image.width/this.framesMax,
        this.image.height,
        this.position.x-this.offset.x,
        this.position.y-this.offset.y,
        this.image.width/this.framesMax*this.scale,
        this.image.height*this.scale
        )
    }

    animateFrames(){
        this.framesElapsed++

        if(this.framesElapsed%this.framesHold===0){
        
            if(this.frameCurrent<this.framesMax-1){
                this.frameCurrent++
            }else{
                this.frameCurrent=0
            }
        }
    }

    update(){
        this.draw()
        this.animateFrames()
    }

}


////////--- Fighters class---///////

class Figther extends Sprite{
    constructor({
        position,
        velocity,
        color='navy',
        imageSrc,
        scale=1,
        frameMax=1,
        offset={x:0,y:0},
        sprites,
        attackBox={offset:{},width:undefined,height:undefined}
    }){
        super({
            position,
            imageSrc,
            scale,
            frameMax,
            offset
      
        })
        this.velocity=velocity
        this.height=150
        this.width=350
        this.lastKey=''
        this.attackBox={
            position:{
                x:this.position.x,
                y:this.position.y
            },
            offset:attackBox.offset,
            width: attackBox.width,
            height:attackBox.height
        }
        this.color=color
        this.isAttackig
        this.health=100
        this.frameCurrent=0
        this.framesElapsed=0
        this.framesHold=10
        this.sprites=sprites
        this.dead=false

        for (const sprite in this.sprites) {
            sprites[sprite].image=new Image()
            sprites[sprite].image.src=sprites[sprite].imageSrc
        }

    }



    update(){
        this.draw()
        if(!this.dead)this.animateFrames()

        //Attack Box----------
        this.attackBox.position.x=this.position.x+this.attackBox.offset.x
        this.attackBox.position.y=this.position.y+this.attackBox.offset.y
        
        //Draw the attack box
        // c.fillRect(
        //     this.attackBox.position.x,
        //     this.attackBox.position.y,
        //     this.attackBox.width,
        //     this.attackBox.height)

        //Draw the character box
        // c.fillRect(
        //     this.position.x,
        //     this.position.y,
        //     this.width,
        //     this.height)



        this.position.x+=this.velocity.x 
        this.position.y +=this.velocity.y

        if(this.position.y+this.height +this.velocity.y>=canvas.height-10){
            this.velocity.y=0
            this.position.y=760
        }else{
            this.velocity.y+=gravity
        }
   
   
    }

    attack(){
        this.switchSprite('attack1')
        this.isAttackig=true
        
        // setTimeout(()=>{
        //   this.isAttackig=false
        // },100)  
      }

    takeHit(){
        
        this.health-=20
        if(this.health<=0){
            this.switchSprite('death')
        }else this.switchSprite('takeHit')
    }

    switchSprite(sprite){

        //The Hashima is death
        if(this.image===this.sprites.death.image){
            if(this.frameCurrent===this.sprites.death.frameMax-1)this.dead=true
            return
        }
        //Overriding all other animations with attack anim
        if(
            this.image===this.sprites.attack1.image&& 
            this.frameCurrent<this.sprites.attack1.frameMax-1)return

        if(
            this.image===this.sprites.takeHit.image&& 
            this.frameCurrent<this.sprites.takeHit.frameMax-1)return
        
        switch(sprite){
            case 'idle':
                if(this.image!=this.sprites.idle.image){
                this.image=this.sprites.idle.image
                this.frameMax=this.sprites.idle.frameMax     
                this.frameCurrent=0
                }
                break
            case 'run':
                if(this.image!=this.sprites.run.image){
                this.image=this.sprites.run.image
                this.frameMax=this.sprites.run.frameMax
                this.frameCurrent=0
                }           

                break
            case 'run2':
                if(this.image!=this.sprites.run2.image){
                this.image=this.sprites.run2.image
                this.frameMax=this.sprites.run2.frameMax
                this.frameCurrent=0
                }           

                break

            case 'jump':
                if(this.image!=this.sprites.jump.image){

                this.image=this.sprites.jump.image
                this.frameMax=this.sprites.jump.frameMax  
                this.frameCurrent=0
                }         
                break
            case 'fall':
                if(this.image!=this.sprites.fall.image){

                    this.image=this.sprites.fall.image
                    this.frameMax=this.sprites.fall.frameMax  
                    this.frameCurrent=0
                }         
                break   
            case 'attack1':
                if(this.image!=this.sprites.attack1.image){
                    this.image=this.sprites.attack1.image
                    this.frameMax=this.sprites.attack1.frameMax  
                    this.frameCurrent=0
                }         
                break    
                
            case 'takeHit':
                if(this.image!=this.sprites.takeHit.image){
                    this.image=this.sprites.takeHit.image
                    this.frameMax=this.sprites.takeHit.frameMax  
                    this.frameCurrent=0
                }         
                break      
            case 'death':
                if(this.image!=this.sprites.death.image){
                    this.image=this.sprites.death.image
                    this.frameMax=this.sprites.death.frameMax  
                    this.frameCurrent=0
                }         
                break                               
        }
    }
}