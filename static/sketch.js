const availableModels = ['bird', 'ant','ambulance','angel','alarm_clock','antyoga','backpack','barn','basket','bear','bee','beeflower','bicycle','book','brain','bridge','bulldozer','bus','butterfly','cactus','calendar','castle','cat','catbus','catpig','chair','couch','crab','crabchair','crabrabbitfacepig','cruise_ship','diving_board','dog','dogbunny','dolphin','duck','elephant','elephantpig','everything','eye','face','fan','fire_hydrant','firetruck','flamingo','flower','floweryoga','frog','frogsofa','garden','hand','hedgeberry','hedgehog','helicopter','kangaroo','key','lantern','lighthouse','lion','lionsheep','lobster','map','mermaid','monapassport','monkey','mosquito','octopus','owl','paintbrush','palm_tree','parrot','passport','peas','penguin','pig','pigsheep','pineapple','pool','postcard','power_outlet','rabbit','rabbitturtle','radio','radioface','rain','rhinoceros','rifle','roller_coaster','sandwich','scorpion','sea_turtle','sheep','skull','snail','snowflake','speedboat','spider','squirrel','steak','stove','strawberry','swan','swing_set','the_mona_lisa','tiger','toothbrush','toothpaste','tractor','trombone','truck','whale','windmill','yoga', 'yogabicycle'];

var model;
var rnnPath;
var x;
var y;
var c;
var penNext = "down";

var points = [];
var seedPath = [];
var personDrawing = false;
var rnnDrawing = false;

var sel;

function modelReady() {
	model.generate(gotSketch);
	background(255);
}

function gotSketch(err, res) {
	rnnPath = res;
}

function humanDrawing(evt){
	console.log('Mouse pressed');
	personDrawing = true;
	rnnDrawing = false;

	points = [];
	x = mouseX;
	y = mouseY;
	evt.preventDefault();
	evt.stopPropogation();
	return(false);
}

function rnnStart(event){
	console.log('Mouse released');
	seedPath = [];
	
	// Perform RDP Line Simplication
	const rdpPoints = [];
	x = w/2;
	y = h/2;

	if(points.length > 0){
		const total = points.length;
		const start = points[0];
		const end = points[total - 1];
		rdpPoints.push(start);
		rdp(0, total - 1, points, rdpPoints);
		rdpPoints.push(end);

		x = rdpPoints[rdpPoints.length - 1].x;
		y = rdpPoints[rdpPoints.length - 1].y;
	}

	// Drawing simplified path
	background(255);
	stroke(50);
	strokeWeight(3);
	beginShape();
	noFill();
	for (let v of rdpPoints) {
		vertex(v.x, v.y);
	}
	endShape();

	for(let i=1; i<rdpPoints.length; i++){
		let personPath = {
			dx: rdpPoints[i].x-rdpPoints[i-1].x,
			dy: rdpPoints[i].y-rdpPoints[i-1].y,
			pen: 'down'
		}
		seedPath.push(personPath);
	}

	model.generate(seedPath, gotSketch);

	personDrawing = false;
	rnnDrawing = true;
}

function clearBoard(){
	model.reset();
	rnnPath = null;
	points = [];
	rnnDrawing = false;
	humanDrawing = false;
	background(255);
}

function autoMode(){
	model.reset();
	rnnPath = null;
	points = [];
	x = w/2;
	y = h/2;
	rnnDrawing = true;
	humanDrawing = false;
	background(255);
	model.generate(gotSketch);
}

function mySelectEvent() {
	let item = sel.value();
	model = ml5.sketchRNN(item, modelReady);
	rnnPath = null;
	points = [];
	rnnDrawing = false;
	humanDrawing = false;
	background(255);
	push();
	stroke(0);
	strokeWeight(1);
	rectMode(CENTER);
	textAlign(CENTER);
	text('please wait', w/2, h/2, 200, 200);
	pop();
}

function setup() {
	w = windowWidth*0.9;
	h = windowHeight*2/3;

	c = createCanvas(w, h).parent('canvasHolder');
	c.touchStarted(humanDrawing);
	c.touchEnded(rnnStart);
	c.mousePressed(humanDrawing);
	c.mouseReleased(rnnStart);
	pixelDensity(1);

	clear_button = createButton('clear').parent('clearButton');
	clear_button.size(w/3,40);
	// draw_button.style("font-family","Comic Sans MS");
	clear_button.style("font-size","22px");
	clear_button.style("background-color","#eff");
	clear_button.style("color","#000");
	clear_button.mousePressed(clearBoard);

	draw_button = createButton('auto').parent('autoButton');
	draw_button.size(w/3,40);
	// draw_button.style("font-family","Comic Sans MS");
	draw_button.style("font-size","22px");
	draw_button.style("background-color","#dfd");
	draw_button.style("color","#000");
	draw_button.mousePressed(autoMode);

	sel = createSelect().parent('modelSelector');
	sel.size(w/3, 40);
	sel.style("font-size","22px");
	sel.style("background-color","#fec");
	sel.style("color","#000");
	for (var i = 0; i < availableModels.length; i++) {
		sel.option(availableModels[i]);
	}
	sel.changed(mySelectEvent);
	sel.value("cat")

	model = ml5.sketchRNN("cat", modelReady);
	push();
	stroke(0);
	strokeWeight(1);
	rectMode(CENTER);
	textAlign(CENTER);
	text('please wait', w/2, h/2, 200, 200);
	pop();

	// background(200);
	// stroke(100);
	// strokeWeight(3);
	// rect(0, 0, w, h);
}

function draw() {

	if(personDrawing){
		line(mouseX, mouseY, pmouseX, pmouseY);
    	points.push(createVector(mouseX, mouseY));
	}
	else if(rnnDrawing){

		stroke(50, 150);
		strokeWeight(3);

		if(rnnPath){
			if(penNext == "end"){
				model.reset();
				rnnPath = null;
				penNext = "down";
				rnnStart();
				return;
			}
			
			if(penNext == "down"){
				line(x, y, x + rnnPath.dx, y+rnnPath.dy);
			}
			x = x+rnnPath.dx;
			y = y+rnnPath.dy;
			penNext	= rnnPath.pen;

			rnnPath = null;
			model.generate(gotSketch);
		}
	}
}