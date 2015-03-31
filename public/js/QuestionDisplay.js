var QuestionDisplay = function( flare ) {
    THREE.Object3D.apply(this);
	var that = this;

	this.mode;

	var answerBox = new AnswerBox();
	this.add(answerBox);

	var questionFontSize = 50;
	var sideQuestionScale = .6;
	var questionLeftPos = -2900;
	var questionRightPos = 2900;
	var questionLeftOff = -4000;
	var questionRightOff = 4000;
	var questionWidth, questionHeight;
	
	
	// CREATE CENTER QUESTION MESH
	var questionMat = new THREE.MeshLambertMaterial({color:0xFFFFFF});
	var questionMesh = new THREE.Mesh(new THREE.Geometry(), questionMat);
	

	var question = new THREE.Object3D();
	question.visible = false;

	question.add(questionMesh);
	this.add(question);
	
	// CREATE SIDE QUESTION MESHES
	var questionMeshLeft = new THREE.Mesh(questionMesh.geometry.clone(), questionMat);
	var questionMeshRight = new THREE.Mesh(questionMesh.geometry.clone(), questionMat);
	questionMeshLeft.scale.set(sideQuestionScale, sideQuestionScale, sideQuestionScale);
	questionMeshRight.scale.set(sideQuestionScale, sideQuestionScale, sideQuestionScale);
	var questionLeft = new THREE.Object3D();
	var questionRight = new THREE.Object3D();
	questionLeft.add(questionMeshLeft);
	questionRight.add(questionMeshRight);
	questionLeft.position.x = questionLeftOff;
	questionRight.position.x= questionRightOff;
	this.add(questionLeft);
	this.add(questionRight);
	
	// SET UP FLARES
	var flare1 = new THREE.Mesh(flare.geometry, flare.material);
	var flare2 = new THREE.Mesh(flare.geometry, flare.material);
	this.add(flare1, flare2);
	
	flare1.position.x = -3500;
	flare2.position.x = 3500;
	flare1.position.z = 50;
	flare2.position.z = 50;
	flare1.scale.y = 100;
	flare1.scale.x = 200;
	flare2.scale.y = 100;
	flare2.scale.x = 200;

	this.setQuestion = function(questionData){
		questionMesh.geometry.dispose();
		questionMesh.geometry = getText(questionData.questionText.toUpperCase());
		questionMesh.geometry.needsUpdate = true;
		questionMesh.geometry.computeBoundingBox();		
		
		questionWidth = questionMesh.geometry.boundingBox.max.x - questionMesh.geometry.boundingBox.min.x;
		questionHeight = questionMesh.geometry.boundingBox.max.y - questionMesh.geometry.boundingBox.min.y;

		questionMesh.position.x = -questionWidth/2;
		questionMesh.position.y = -questionHeight/2;
		
		//questionBacker.scale.x = 500;//questionWidth + 30;
		//questionBacker.scale.y = 500;//questionHeight + 10;
		flare1.scale.x = questionWidth;
		flare2.scale.x = questionWidth;
		
		questionMeshLeft.geometry.dispose();
		questionMeshLeft.geometry = questionMesh.geometry.clone();
		questionMeshLeft.geometry.needsUpdate = true;
		
		questionMeshRight.geometry.dispose();
		questionMeshRight.geometry = questionMesh.geometry.clone();
		questionMeshRight.geometry.needsUpdate = true;
		
		questionMeshRight.position.x = - questionWidth * sideQuestionScale;
		questionMeshLeft.position.x = 0;
		

		var answers = [];
		for (var i=1; i<=6; i++){
			if (questionData['answer' + i.toString()]){
				answers.push( {answer:questionData['answer' + i.toString()], result:questionData['result' + i.toString()]} );
			}
		}
		if (answers.length > 1) {
			answerBox.addEventListener('ready', function(){
				setTimeout( function(){
					answerBox.setAnswers(answers);
				}, 1000)
			});
		}
	}
	
	this.updateQuestion = function(questionData){
		if (that.visible && answerBox.visible) {
			var activeQuestion = SystemSettings.findOne({name:'activeQuestion'}).value;
			if ( questionData._id == activeQuestion ) {
				answerBox.updateAnswers(questionData);
			}
		}
	}
	
	this.setMode = function(mode){
		var dur = 0;
		if ( that.visible ){
			dur = .5;
		}
		if (mode == 'answer'){
			TweenLite.to( question.rotation, dur/2, {x:Math.PI*2/4, onComplete:function(){
				question.visible = false;
			}} );
			answerBox.reveal(dur/2, dur/2);
			TweenLite.to( flare2.scale, dur/2, {x:1, y:1, onComplete:function(){
    			flare2.visible = false;
			}});
			TweenLite.to( questionLeft.position, dur/2, {x:questionLeftPos});
			TweenLite.to( questionRight.position, dur/2, {x:questionRightPos});
		} else if (mode == 'question'){
			answerBox.hide( dur/2, 0 );
			TweenLite.to( question.rotation, dur/2, {x:0, delay:dur/4, onStart:function(){
				question.visible = true;
			}});
			flare2.visible = true;
			TweenLite.to( flare2.scale, dur/2, {x:questionWidth, y:50});
			TweenLite.to( questionLeft.position, dur/2, {x:questionLeftOff});
			TweenLite.to( questionRight.position, dur/2, {x:questionRightOff});			
		}
	}
	
	this.setQuestion({questionText:'INITIAL QUESTION'});

	this.reveal = function(delay){
			
		setTimeout( function(){
			flare1.scale.y = 100;
			flare1.scale.x = 200;
			flare2.scale.y = 100;
			flare2.scale.x = 200;
			flare1.position.x = -3500;
			flare2.position.x = 3500;
			flare1.visible = true;
			flare2.visible = true;
			question.visible = false;
			that.visible = true;
			TweenLite.to(flare1.position, .5, {x:0, ease:Linear.easeInOut});
			TweenLite.to(flare2.position, .5, {x:0, ease:Linear.easeInOut});
			setTimeout( function(){
						question.visible = true;
						TweenLite.from(question.rotation, .5, {x:Math.PI*2 * .75});
						TweenLite.to(flare1.position, .2, {x:-500, y:30, ease:Linear.easeInOut});
						TweenLite.to(flare1.scale, .2, {x:1, y:1, ease:Linear.easeInOut, onComplete:function(){
    						flare1.visible = false;
						}});
						
						//TweenLite.to(flare1.scale, .2, {x:2, y:2});
						TweenLite.to(flare2.scale, .2, {x:questionWidth*2, y:questionHeight, onComplete:function(){
							TweenLite.to(flare2.position, .5, {y:-32, ease:Linear.easeInOut});
							TweenLite.to(flare2.scale, .5, {x:questionWidth, y:50});
						}});
				}, 500);			
		}, delay*1000);
	};
	
	this.hide = function(){
		TweenLite.to(flare1.scale, .2, {x:1, y:1, onComplete:function(){
			question.visible = false;
		}});
		TweenLite.to(flare2.scale, .2, {x:1, y:1});
		TweenLite.to(flare1.position, .5, {x:-3500, y:0});
		TweenLite.to(flare2.position, .5, {x:3500, y:0, onComplete:function(){
			that.visible = false;
			that.setMode('question');
			var questionModeSetting = SystemSettings.findOne({name:'questionMode'});
			SystemSettings.update(questionModeSetting._id, {$set:{value:'question'}});
		}});
	};
	
	this.tick = function(){
		answerBox.tick();
	}
	
	this.hide();
	
	function getText(text){
		return new THREE.TextGeometry( text, {
									size: questionFontSize,
									height: 3,
									curveSegments: 3,
				
									font: 'swis721 bt',
									weight: 'bold',
									//style: 'bold',
				
									bevelThickness: 2,
									bevelSize: 1.3,
									bevelEnabled: true,	
								});
	}



}
QuestionDisplay.prototype = Object.create(THREE.Object3D.prototype);
QuestionDisplay.prototype.constructor = QuestionDisplay;

