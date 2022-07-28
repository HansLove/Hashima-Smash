const canvas=document.querySelector('canvas')
const c=canvas.getContext('2d')

canvas.width=1500
canvas.height=800

c.fillRect(0,0,canvas.width,canvas.height)

const gravity=0.5


const background=new Sprite({
    position:{
        x:0,
        y:0
    },
    imageSrc:'./img/bk_1.png'
})

// const shop=new Sprite({
//     position:{
//         x:1000,
//         y:200
//     },
//     scale:0.2,
//     frameMax:4,
//     imageSrc:'./img/alen_1.png'
// })


const player=new Figther({
    position:{
        x:0,
        y:0
    },
    velocity:{
        x:0,
        y:10
    },
    offset:{
        x:0,
        y:0
    }

})
 
player.draw()

const enemy=new Figther({
    position:{
        x:400,
        y:100
    },
    velocity:{
        x:0,
        y:0
    },
    offset:{
        x:50,
        y:0
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
    // shop.update()
    
    player.update()
    enemy.update()

    player.velocity.x=0
    enemy.velocity.x=0

    if(keys.a.pressed&& player.lastKey==='a'){
        player.velocity.x=-5
    }else if(keys.d.pressed&&player.lastKey==='d'){
        player.velocity.x=5
    }

    if(keys.ArrowLeft.pressed&& enemy.lastKey==='ArrowLeft'){
        enemy.velocity.x=-5
    }else if(keys.ArrowRight.pressed&&enemy.lastKey==='ArrowRight'){
        enemy.velocity.x=5
    }

    if(
        rectangularCollision({
            rectangle1:player,
            rectangle2:enemy
        })&&
        player.isAttackig
        ){
            player.isAttackig=false
            enemy.health-=20
            document.querySelector('#enemyHealth').style.width=enemy.health+'%' 
        }

        if(
            rectangularCollision({
                rectangle1:enemy,
                rectangle2:player
            })&&
            enemy.isAttackig
            ){
                enemy.isAttackig=false
                player.health-=20
                document.querySelector('#playerHealth').style.width=player.health+'%' 
            }        


}



animate()

window.addEventListener('keydown',(event)=>{
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
    }
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