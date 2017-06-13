var canvas=document.getElementById('canvas')
var stage,lead
var home
var textLevel
var gameLevel=1
var gameRunSuccess=0
var isGameEasy=true  //-----------------------------------------------------------
var leadFrameRate=10 //走路的帧数
var leadRunSpeed=250  //走路的速度
var runLeft,runRight,runUp,runDown,direction
var floorContainer=new createjs.Container()
var sexangleSize=50,sexangleStroke=3,row=10,cell=10 //六边形地板的大小
var width=Math.sqrt(3)*sexangleSize;
var floorContainerWidth,floorContainerHeight
var floorContainerUp=1/2*2*sexangleSize
var floorContainerLeft=1/4*2*sexangleSize
var leadRunDown //角色能走的最下面
var moveLength=150 //移动画板的临界值
var allFloor=[],failFloor=[],selectedFloor=[],tempArr=[],oneFloor
var startRun=false
var fps=60
var waitRun=[5000,3000]//等待开始跑格的时间
var blueFilter=new createjs.ColorFilter(0,0,0,1, 0,0,255,0)
var greenFilter=new createjs.ColorFilter(0,0,0,1, 0,255,0,0)


var $rightSound=$('.rightSound')
var $errorSound=$('.errorSound')
var $runEasy=$('#runEasy')
var $level=$('#level')
var $levelNum=$('#levelNum')
var $selectfail=$('#selectfail')
var $runsuccess=$('#runsuccess')
var $runfail=$('#runfail')
var $fps=$('#fps')

	$(function(){
		stage = new createjs.Stage("canvas");
		createjs.Ticker.addEventListener("tick", handleTick);
		createjs.Ticker.framerate=60; 
		function handleTick(e) {
  		  stage.update(e);
		}
		stage.enableMouseOver()
		stage.addChild(floorContainer)
		leadCreate()
		home()
		dragImg()
		canvas.ondblclick=requestFullscreen
		window.onblur=function(){
			runLeft=runRight=runUp=runDown=false
		}
		
		setInterval(function(){
			$fps.html(parseInt(createjs.Ticker.getMeasuredFPS()) )
		},1000)
		$('.progress').click(setFPS)
		autoScale()
		
	})
	
	function home(){
		home=new createjs.Container()
		var img=document.createElement('img')
		img.src='images/home.jpg'
		img.onload=function () {
			var bg=new createjs.Bitmap(img)
			bg.scaleX=canvas.width/img.width
			bg.scaleY=canvas.height/img.height
			home.addChild(bg)
			
			var text1=new createjs.Text('关卡难度',"bold 40px Arial",'green')
			text1.textAlign="center"
			text1.x=canvas.width/2
			text1.y=150
			home.addChild(text1)
			
			var text2=new createjs.Text('简单',"bold 40px Arial",'green')
			text2.textAlign="center"
			text2.x=canvas.width/2
			text2.y=250
			text2.cursor="pointer"
			text2.name="text2"
			text2.addEventListener('click',homeNext)
			home.addChild(text2)
			
			
			var text3=new createjs.Text('困难',"bold 40px Arial",'green')
			text3.textAlign="center"
			text3.x=canvas.width/2
			text3.y=350
			text3.cursor="pointer"
			text3.name="text3"
			text3.addEventListener('click',homeNext)
			home.addChild(text3)
			
			stage.addChild(home)
			
		}
	}
	
	function homeNext(e){
		if(e.target.name=='text2'){
			isGameEasy=true
		}
		else if (e.target.name=='text3') {
			isGameEasy=false
		}
		home.removeAllChildren()
		stage.removeChild(home)
		home=null
		gameStart()
	}
	
	function autoScale(){
		//alert(screen.width)950 600
		var a=$(window).width()/1030
		var b=$(window).height()/600
		var c=a>b?b:a
		$('.all').css('transform','scale('+c+')')
		$(window).resize(function(){
			var a=$(window).width()/1030
			var b=$(window).height()/600
			var c=a>b?b:a
			$('.all').css('transform','scale('+c+')')
			
		})
	}
	
	function dragImg(){
		if(window.localStorage&&window.localStorage.img){
			$('#img').attr('src',localStorage.img)
		}
		else{
			$('#img').attr('src','images/aa.jpg')
		}
		document.ondragover=function(e){
			e.preventDefault()
		}
		document.ondrop=function(e){
			e.preventDefault()
			var str=e.dataTransfer.files[0].name.split('.').pop().toUpperCase()
			if(str=='PNG'||str=="JPG"||str=='JPEG'){
				var fileReader=new FileReader()
				fileReader.readAsDataURL(e.dataTransfer.files[0])
				fileReader.onload=function(e){
					localStorage.img=e.target.result
					$('#img').attr('src',e.target.result)
				}
			}
			else{
				alert('图片格式不支持')
			}
		}
	}
	
	function requestFullscreen(){
		if(canvas.webkitRequestFullscreen){
			canvas.webkitRequestFullscreen()
		}
		else if(canvas.requestFullscreen){
			canvas.requestFullscreen()
		}
		else if(canvas.mozRequestFullScreen){
			canvas.mozRequestFullScreen()
		}
		else if(canvas.msRequestFullscreen)
			canvas.msRequestFullscreen()
	}
	
	function setFPS(e){
		var a=e.offsetX/$(this).width()
		var b=parseInt(a*100)+'%'
		$('.progress-bar span').html(parseInt(120*a)+'帧率')
		$('.progress-bar').css('width',b)
		createjs.Ticker.framerate=parseInt(a*120)
		fps=parseInt(a*120)
	}
	
	function gameStart(){
		startRun=false
		gameRunSuccess=0
		clearFloorContainer()
		drawFiveFloor()
		keyboardControl()
		setTimeout(function(){
			randomFloor(5+gameLevel/2)
		},waitRun[0])	
		showTextLevel()
		$runEasy.html(isGameEasy?'简单':'困难')
		$level.html(gameLevel)
		$levelNum.html(gameLevel+5)
	}
	
	function showTextLevel () {
		var str="第"+gameLevel+"关"
		textLevel=new createjs.Text(str,"40px Arial",'white')
		textLevel.textAlign="center"
		textLevel.x=canvas.width/2
		textLevel.y=canvas.height/2
		textLevel.alpha=0.5
		stage.addChild(textLevel)
		createjs.Tween.get(textLevel, {override:true})
         .to({alpha:1,scaleX:2,scaleY:2}, 1000 )
         .wait(500)
         .call(function () {
			stage.removeChild(textLevel)
			textLevel=null
    });
    
	}
	
	function clearFloorContainer(){
		floorContainer.removeAllChildren()
	}

	function leadCreate(){
		var data = {
		    images: ["images/lead.png"],
		    frames: {
		        width: 122,
		        height: 136,
		        count: 16
		    },
		    animations: {
		        downStand:[0],
		        downWalk:[1,3],
		        leftStand:[4],
		        leftWalk:[5,7],
		        rightStand:[8],
		        rightWalk:[9,11],
		        upStand:[12],
		        upWalk:[13,15]
		     }
		};
		var spriteSheet = new createjs.SpriteSheet(data)
		lead = new createjs.Sprite(spriteSheet, "downStand");
		spriteSheet.framerate=leadFrameRate
		lead.scaleX=lead.scaleY=0.6
		lead.regX=63
		lead.regY=110
		lead.x=canvas.width/2
		lead.y=canvas.height/2
		lead.addEventListener('tick',leadTick)
		floorContainer.addChild(lead);
		var shadow=new createjs.Shadow('black',5,5,10)
		lead.shadow=shadow
	}
	
	function keyboardControl(){
		$(window).on('keydown',keydown)
		$(window).on('keyup',keyup)
	}
	
	function keydown(e){
		switch(e.keyCode){
			case 38:case 87:runUp=true;break;
			case 40:case 83:runDown=true;break;
			case 37:case 65:runLeft=true;break;
			case 39:case 68:runRight=true;break;
		}
		e.preventDefault()
	}
	
	function keyup(e){
		switch(e.keyCode){
			case 38:case 87:runUp=false;break;
			case 40:case 83:runDown=false;break;
			case 37:case 65:runLeft=false;break;
			case 39:case 68:runRight=false;break;
		}
	}
	
	function leadTick(e){
		moveContainer()
		run()
		if(runUp || runDown || runLeft || runRight){
			if(runUp){
				lead.y-=parseFloat(leadRunSpeed/fps) 
				if(lead.y<0){
					lead.y=0
				}
				if(direction!='up'){
					direction='up'
					lead.gotoAndPlay('upWalk')
				}
			}
			else if(runDown){
				lead.y+=parseFloat(leadRunSpeed/fps) 
				if(lead.y>leadRunDown){
					lead.y=leadRunDown
				}
				if(direction!='down'){
					direction='down'
					lead.gotoAndPlay('downWalk')
				}
			}
			if(runLeft){
				lead.x-=parseFloat(leadRunSpeed/fps) 
				if(lead.x<0){
					lead.x=0
				}
				if(!(runUp || runDown)){
					if(direction!='left'){
						direction='left'
						lead.gotoAndPlay('leftWalk')
					}
				}
			}
			if(runRight){
				lead.x+=parseFloat(leadRunSpeed/fps) 
				if(lead.x>floorContainerWidth){
					lead.x=floorContainerWidth
				}
				if(!(runUp || runDown)){
					if(direction!='right'){
						direction='right'
						lead.gotoAndPlay('rightWalk')
					}
				}
			}
		}
		else{
			if(direction==''){
				return
			}
			switch(direction){
				case 'up':lead.gotoAndStop('upStand');break;
				case 'down':lead.gotoAndStop('downStand');break;
				case 'left':lead.gotoAndStop('leftStand');break;
				case 'right':lead.gotoAndStop('rightStand');break;
			}
			direction=''
		}	
	}
	
	function moveContainer(){
		var stagePositionx = floorContainer.x+lead.x;
		var rightEdge = canvas.width-moveLength;
		var leftEdge = moveLength;
		if (stagePositionx > rightEdge) {
			floorContainer.x+=rightEdge-stagePositionx
			if (floorContainer.x < canvas.width-floorContainerWidth){
				floorContainer.x = canvas.width-floorContainerWidth
			} 
		}
		if (stagePositionx < leftEdge) {
			floorContainer.x+=leftEdge-stagePositionx
			if (floorContainer.x >floorContainerLeft){
				floorContainer.x = floorContainerLeft
			} 
		}
		
		var stagePositiony = floorContainer.y+lead.y;
		var downEdge = canvas.height-moveLength;
		var upEdge = moveLength;
		if (stagePositiony > downEdge) {
			floorContainer.y+=downEdge-stagePositiony
			if (floorContainer.y < canvas.height-floorContainerHeight){
				floorContainer.y = canvas.height-floorContainerHeight
			} 
		}
		if (stagePositiony < upEdge) {
			floorContainer.y+=upEdge-stagePositiony
			if (floorContainer.y >floorContainerUp){
				floorContainer.y = floorContainerUp
			} 
		}
	}
	
	function drawFiveFloor(){
		row=10+gameLevel/2
		cell=10+gameLevel/2
		floorContainerWidth=(cell-0.5)*(width+sexangleStroke)
		floorContainerHeight=(row-1)*3/4*2*sexangleSize+2*sexangleSize
		leadRunDown=(row-1)*3/4*sexangleSize*2+1/4*sexangleSize*2
		allFloor=[]
		var img=document.createElement('img')
		if(localStorage.img){
			img.src=localStorage.img
		}
		else{
			img.src='images/aa.jpg'
		}
		img.onload=function(){
			for(var i=0;i<row;i++){
				for(var j=0;j<cell;j++){
					var ma=new createjs.Matrix2D(1,0,0,1,0,0)
					ma.rotate(-90)
					var scaleX=(floorContainerWidth+width/2)/img.width
					var scaleY=(floorContainerWidth+width/2)/img.height
					var sexangle=new createjs.Shape()
					sexangle.rotation=90
					sexangle.y=i*(sexangleSize*3/2+sexangleStroke/2)
					if(i%2==0){
						sexangle.x=j*(width+sexangleStroke/2)
						ma.translate(-j*(width+sexangleStroke/2)-width/2,-i*(sexangleSize*3/2+sexangleStroke/2)-sexangleSize)
					}
					else{
						sexangle.x=j*(width+sexangleStroke/2)+sexangleSize-sexangleStroke-2
						ma.translate(-(j*(width+sexangleStroke/2)+sexangleSize-sexangleStroke-2)-width/2,-i*(sexangleSize*3/2+sexangleStroke/2)-sexangleSize)
					}
					ma.scale(scaleX,scaleY)
			sexangle.graphics.beginBitmapFill(img,'repeat',ma).beginStroke('black').setStrokeStyle(sexangleStroke).drawPolyStar( 0, 0, sexangleSize, 6, 0, 0 )
					floorContainer.addChild(sexangle)
					allFloor.push(sexangle)
				}
			}
		floorContainer.addChild(lead)	
		}
	}

	function randomFloor(n){
		$(window).off('keydown',keydown)
		$(window).off('keyup',keyup)
		runLeft=runRight=runUp=runDown=false
		selectedFloor=[]
		failFloor=[]
		oneFloor=allFloor[Math.floor(Math.random()*allFloor.length)]
		selectedFloor.push(oneFloor)
		for(var i=0;i<n-1;i++){
			tempArr=[]
			selectOne(selectedFloor[selectedFloor.length-1])
			if(tempArr.length>0){
				selectedFloor.push(tempArr[Math.floor(Math.random()*tempArr.length)])	
			}
			else{
				findError()
				return
			}
		}
		for(var j=0;j<allFloor.length;j++){
			var a=true
			for(var k=0;k<selectedFloor.length;k++){
				if(allFloor[j]==selectedFloor[k]){
					a=false
				}
			}
			if(a){
				failFloor.push(allFloor[j])
			}
		}
		showSelect()
	}
	
	function selectOne(moveieClip){
		for(var i=0;i<allFloor.length;i++){
			var distancex=allFloor[i].x-moveieClip.x
			var distancey=allFloor[i].y-moveieClip.y
			var distance=Math.sqrt(Math.pow(distancex,2)+Math.pow(distancey,2))
			if(distance<2*sexangleSize){
				var a=true
				for(var j=0;j<selectedFloor.length;j++){
					if(allFloor[i]==selectedFloor[j]){
						a=false
					}
				}
				if(a){
					tempArr.push(allFloor[i])
				}
				a=true
			}
		}
	}
	
	function showSelect(){
		var i=0
		var dir=''
		var interval=setInterval(
			function(){
				selectedFloor[i].filters=[blueFilter]
				selectedFloor[i].cache(-width/2-10,-sexangleSize,width+30,sexangleSize*2)
				if(i==0){
					lead.x=selectedFloor[i].x
					lead.y=selectedFloor[i].y
				}
				else{
					createjs.Tween.get(lead, {override:true}).to({x:selectedFloor[i].x, y:selectedFloor[i].y}, 500)
					if(selectedFloor[i].y>selectedFloor[i-1].y){
						lead.gotoAndPlay('downWalk')
						dir='down'
					}
					else if(selectedFloor[i].y<selectedFloor[i-1].y){
						lead.gotoAndPlay('upWalk')
						dir='up'
					}
					else if(selectedFloor[i].x>selectedFloor[i-1].x){
						lead.gotoAndPlay('rightWalk')
						dir='right'
					}
					else if(selectedFloor[i].x<selectedFloor[i-1].x){
						lead.gotoAndPlay('leftWalk')
						dir='left'
					}
					
				}
				i++
				if(i>=selectedFloor.length){
					clearInterval(interval)	
				}
		},500)
		setTimeout(function(){
			if(isGameEasy){
						$('#toData').attr('src',stage.toDataURL())
					}
			switch(dir){
				case 'up':lead.gotoAndStop('upStand');break;
				case 'down':lead.gotoAndStop('downStand');break;
				case 'left':lead.gotoAndStop('leftStand');break;
				case 'right':lead.gotoAndStop('rightStand');break;
			}
		},(selectedFloor.length+1)*500)
		setTimeout(function(){
			$(window).on('keydown',keydown)
			$(window).on('keyup',keyup)
			lead.x=selectedFloor[0].x
			lead.y=selectedFloor[0].y
			startRun=true
			for(var i=0;i<selectedFloor.length;i++){
				selectedFloor[i].filters=[]
				selectedFloor[i].cache(-width/2-10,-sexangleSize,width+30,sexangleSize*2)
			}
		},(selectedFloor.length+2)*500)
	}
	
	function run(){
		if(!startRun)
		return
		for(var i=0;i<failFloor.length;i++){
			var distancex=failFloor[i].x-lead.x
			var distancey=failFloor[i].y-lead.y
			var distance=Math.sqrt(Math.pow(distancex,2)+Math.pow(distancey,2))
			if(distance<width/2){
				runFail()
			}
		}
		for(var j=0;j<selectedFloor.length;j++){
			var distancex=selectedFloor[j].x-lead.x
			var distancey=selectedFloor[j].y-lead.y
			var distance=Math.sqrt(Math.pow(distancex,2)+Math.pow(distancey,2))
			if(distance<width/2){
				if(!isGameEasy){
					if(j!=0){
						runFail()
						return
					}
				}
				selectedFloor[j].filters=[greenFilter]
				selectedFloor[j].cache(-width/2-10,-sexangleSize,width+30,sexangleSize*2)
				selectedFloor.splice(j,1)
			}
		}
		if(selectedFloor.length==0){
			runSuccess()
		}
	}
	
	function findError(){
		gameRunSuccess++
		var val=parseInt($selectfail.html())
		$selectfail.html(++val)
		startRun=false
		floorContainer.removeChild(oneFloor)
		for(var i=0;i<allFloor.length;i++){
			if(allFloor[i]==oneFloor)
			allFloor.splice(i,1)
		}
		if(gameRunSuccess%(gameLevel+5)==0){
			gameLevel++
			gameStart()
		}
		else{
			$levelNum.html(gameLevel+5-gameRunSuccess)
			setTimeout(function(){
			randomFloor(5+gameLevel/2)
			},waitRun[1])
		}	
	}
	
	function runSuccess(){
		$rightSound[0].play()
		gameRunSuccess++
		var val=parseInt($runsuccess.html())
		$runsuccess.html(++val)
		startRun=false
		floorContainer.removeChild(oneFloor)
		for(var i=0;i<allFloor.length;i++){
			if(allFloor[i]==oneFloor)
			allFloor.splice(i,1)
		}
		if(gameRunSuccess%(gameLevel+5)==0){
			gameLevel++
			gameStart()
		}
		else{
			$levelNum.html(gameLevel+5-gameRunSuccess)
			setTimeout(function(){
				toNoFilters()
				randomFloor(5+gameLevel/2)
			},waitRun[1])
		}
		
	}
	
	function runFail(){
		$errorSound[0].play()
		var val=parseInt($runfail.html())
		$runfail.html(++val)
		startRun=false
		setTimeout(function(){
			toNoFilters()
			randomFloor(5+gameLevel/2)
		},waitRun[1])
	}
	
	function toNoFilters(){
		for(var i=0;i<allFloor.length;i++){
			allFloor[i].filters=[]
			allFloor[i].cache(-width/2-10,-sexangleSize,width+30,sexangleSize*2)
		}
	}
