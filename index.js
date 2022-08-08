const canvas=document.querySelector('canvas')
const c=canvas.getContext('2d')

canvas.width=window.innerWidth-8
canvas.height=920

c.fillRect(0,0,canvas.width,canvas.height)

const gravity=0.5


const background=new Sprite({
    position:{
        x:160,
        y:-200
    },

    imageSrc:'./img/bk_1.png'
})




const player=new Figther({
    position:{
        x:0,
        y:0
    },
    velocity:{
        x:0,
        y:10
    },

    imageSrc:'./img/davi_neutral.png',
    frameMax:4,
    scale:0.5,
    offset:{
        x:150,y:250
    },
    sprites:{
        idle:{
            imageSrc:'./img/davi_neutral.png',
            frameMax:4
        },
        run:{
            imageSrc:'./img/sprite_davi.png',
            frameMax:4
        },  
        run2:{
            imageSrc:'./img/reverse.png',
            frameMax:4
        },         
        jump:{
            imageSrc:'./img/sprite_davi.png',
            frameMax:4
        },   
        fall:{
            imageSrc:'./img/sprite_davi.png',
            frameMax:4
        },
        attack1:{
            imageSrc:'./img/attack.png',
            frameMax:3
        },    
        takeHit:{
            imageSrc:'./img/takeHit_1.png',
            frameMax:2
        },  
        death:{
            imageSrc:'./img/death_1.png',
            frameMax:4
        },                            
        
    },
    attackBox:{
        offset:{
            x:250,
            y:0
        },
        width: 150,
        height: 50
    }

})
 
player.draw()

const enemy=new Figther({
    position:{
        x:600,
        y:00
    },
    velocity:{
        x:0,
        y:0
    },

    imageSrc:'./img/davi_neutral.png',
    frameMax:4,
    scale:0.5,
    offset:{
        x:100,y:250
    },
    sprites:{
        idle:{
            imageSrc:'./img/reverse.png',
            frameMax:4
        },
        run:{
            imageSrc:'./img/sprite_davi.png',
            frameMax:4
        },  
        run2:{
            imageSrc:'./img/reverse.png',
            frameMax:4
        },         
        jump:{
            imageSrc:'./img/reverse.png',
            frameMax:4
        },   
        fall:{
            imageSrc:'./img/reverse.png',
            frameMax:4
        },
        attack1:{
            imageSrc:'./img/reverse_attack.png',
            frameMax:4
        },      
        takeHit:{
            imageSrc:'./img/takeHit_2.png',
            frameMax:2
        },    
        death:{
            imageSrc:'./img/death_2.png',
            frameMax:4
        },                            
                                      
    },
    attackBox:{
        offset:{
            x:-150,
            y:0
        },
        width: 150,
        height: 50
    } 
    
})

enemy.draw()

const keys={
    a:{
        pressed:false
    },
    d:{
        pressed:false
    },
    w:{
        pressed:false
    },
    ArrowRight:{
        pressed:false
    },
    ArrowLeft:{
        pressed:false
    }
}

let lastKey



let timer=50
let timerId


decreaseTimer()

function animate(){
    window.requestAnimationFrame(animate)
    c.fillStyle='black'
    c.fillRect(0,0,canvas.width,canvas.height)
    
    background.update()
    
    
    player.update()
    enemy.update()

    player.velocity.x=0
    enemy.velocity.x=0

    if(keys.a.pressed&& player.lastKey==='a'){
        player.velocity.x=-5
        player.switchSprite('run2')
    }else if(keys.d.pressed&&player.lastKey==='d'){
        player.velocity.x=5
        player.switchSprite('run')
    }else{
        player.switchSprite('idle')

    }

    //jump
    if(player.velocity.y<0){
        player.switchSprite('jump')

    }else if(player.velocity.y>0){
        player.switchSprite('fall')
    }

    if(keys.ArrowLeft.pressed&& enemy.lastKey==='ArrowLeft'){
        enemy.switchSprite('run2')

        enemy.velocity.x=-5
    }else if(keys.ArrowRight.pressed&&enemy.lastKey==='ArrowRight'){
        enemy.switchSprite('run')

        enemy.velocity.x=5
    }else{
        enemy.switchSprite('idle')
    }
    //jump
    if(enemy.velocity.y<0){
        enemy.switchSprite('jump')

    }else if(enemy.velocity.y>0){
        enemy.switchSprite('fall')
    }


    //Detect collision and the enemy getting hit
    if(
        rectangularCollision({
            rectangle1:player,
            rectangle2:enemy
        })&&
        player.isAttackig&&
        player.frameCurrent===2
        ){
            enemy.takeHit()
            player.isAttackig=false
            
            document.querySelector('#enemyHealth').style.width=enemy.health+'%' 
        }
        if(player.isAttackig&&player.frameCurrent===2){
            player.isAttackig=false
        }

        if(
            rectangularCollision({
                rectangle1:enemy,
                rectangle2:player
            })&&
            enemy.isAttackig&&
            enemy.frameCurrent===2
            ){
                player.takeHit()
                enemy.isAttackig=false
                
                document.querySelector('#playerHealth').style.width=player.health+'%' 
            }  
            
            if(enemy.isAttackig&&enemy.frameCurrent===2){
                enemy.isAttackig=false
            }


}



animate()

window.addEventListener('keydown',(event)=>{
    if(!player.dead){  
    switch(event.key){
        case 'd':
            keys.d.pressed=true
            player.lastKey='d'
            break
        case 'a':
            keys.a.pressed=true
            player.lastKey='a'
            break
        case 'w':
            player.velocity.y=-10
            break  
        case ' ':
            player.attack()
            break              
    }}
    if(!enemy.dead){
        switch(event.key){            
        case 'ArrowRight':
            keys.ArrowRight.pressed=true
            enemy.lastKey='ArrowRight'
            break
        case 'ArrowLeft':
            keys.ArrowLeft.pressed=true
            enemy.lastKey='ArrowLeft'
            break
        case 'ArrowUp':
            enemy.velocity.y=-10
            break      
        case 'ArrowDown':
            enemy.attack()
            break                      
    }}
})

window.addEventListener('keyup',(event)=>{
    switch(event.key){
        case 'd':
            keys.d.pressed=false
            break
        case 'a':
            keys.a.pressed=false
            break
        case 'w':
            keys.w.pressed=false
            break            
    }

    //Enemy keys:
    switch(event.key){
        case 'ArrowRight':
            keys.ArrowRight.pressed=false
            break
        case 'ArrowLeft':
            keys.ArrowLeft.pressed=false
            break
        case 'ArrowUp':
            keys.ArrowUp.pressed=false
            break            
    }
})