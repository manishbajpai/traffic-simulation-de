
// notice: activate caterpillars, trafficLights etc: 
// uncomment the 3 lines/blocks  with "depot" 
// a defined depot also needed for canvas_gui.dragRoad
// for dragging also canvas_gui.dragRoad needs to be extended to case roundabout, 
// and gridTrajectories needs to be called (only if significant changes in length)
// => geometry change

//#############################################################
// adapt standard slider settings from control_gui.js
// and define variables w/o sliders in this scenario
//#############################################################

// sliders with default inits need not to be reassigned here


truckFrac=0.15;
factor_v0_truck=0.9; // truck v0 always slower than car v0 by this factor
                     // (incorporated/updated in sim by updateModels) 
MOBIL_mandat_bSafe=15; // standard 42
MOBIL_mandat_bThr=0;   
MOBIL_mandat_bias=10;


qIn=qInInit=2000./3600;
slider_qIn.value=3600*qIn;
slider_qInVal.innerHTML=3600*qIn+" veh/h";

mainFrac=mainFracInit=0.8;
slider_mainFrac.value=100*mainFrac;
slider_mainFracVal.innerHTML=100*mainFrac+"%";

leftTurnFrac=leftTurnFracInit=0.25;
slider_leftTurnFrac.value=100*leftTurnFrac;
slider_leftTurnFracVal.innerHTML=100*leftTurnFrac+"%";

timewarp=timewarpInit=2;
slider_timewarp.value=timewarpInit;
slider_timewarpVal.innerHTML=timewarpInit +" times";

IDM_v0=IDM_v0Init=50./3.6;
slider_IDM_v0.value=3.6*IDM_v0Init;
slider_IDM_v0Val.innerHTML=3.6*IDM_v0Init+" km/h";

IDM_a=0.9; // low to allow stopGo; 
slider_IDM_a.value=IDM_a;
slider_IDM_aVal.innerHTML=IDM_a+" m/s<sup>2</sup>";
factor_a_truck=1; // to allow faster slowing down of the uphill trucks

MOBIL_bBiasRight_car=0.0
slider_MOBIL_bBiasRight_car.value=MOBIL_bBiasRight_car;
slider_MOBIL_bBiasRight_carVal.innerHTML
	=MOBIL_bBiasRight_car+" m/s<sup>2</sup>";

MOBIL_bBiasRight_truck=0.0
slider_MOBIL_bBiasRight_truck.value=MOBIL_bBiasRight_truck;
slider_MOBIL_bBiasRight_truckVal.innerHTML
	=MOBIL_bBiasRight_truck+" m/s<sup>2</sup>";

MOBIL_bThr=0.0
slider_MOBIL_bThr.value=MOBIL_bThr;
slider_MOBIL_bThrVal.innerHTML=MOBIL_bThr+" m/s<sup>2</sup>";




/*######################################################
 Global overall scenario settings and graphics objects
 see onramp.js for more details

 refSizePhys  => reference size in m (generally smaller side of canvas)
 refSizePix   => reference size in pixel (generally smaller side of canvas)
 scale = refSizePix/refSizePhys 
       => roads have full canvas regardless of refSizePhys, refSizePix

 (1) refSizePix=Math.min(canvas.width, canvas.height) determined during run  

 (2) refSizePhys smaller  => all phys roadlengths smaller
  => vehicles and road widths appear bigger for a given screen size 
  => chose smaller for mobile, 

######################################################*
*/

var scenarioString="Roundabout";
console.log("\n\nstart main: scenarioString=",scenarioString);

var simDivWindow=document.getElementById("contents");
var canvas = document.getElementById("canvas"); 
var ctx = canvas.getContext("2d"); // graphics context
canvas.width  = simDivWindow.clientWidth; 
canvas.height  = simDivWindow.clientHeight;
var aspectRatio=canvas.width/canvas.height;


console.log("before addTouchListeners()");
addTouchListeners();
console.log("after addTouchListeners()");


//##################################################################
// overall scaling (critAspectRatio should be consistent with 
// width/height in css.#contents)
//##################################################################

var refSizePhys=110;  // constants => all objects scale with refSizePix

var critAspectRatio=120./95.; // from css file width/height of #contents

var refSizePix=Math.min(canvas.height,canvas.width/critAspectRatio);
var scale=refSizePix/refSizePhys;


//##################################################################
// Specification of physical road geometry and vehicle properties
// If refSizePhys changes, change them all => updatePhysicalDimensions();
//##################################################################

// all relative "Rel" settings with respect to refSizePhys, not refSizePix!

var center_xRel=0.63;
var center_yRel=-0.55;

var center_xPhys=center_xRel*refSizePhys; //[m]
var center_yPhys=center_yRel*refSizePhys;
var rRing=0.15*refSizePhys; // roundabout radius [m] (laneWidth=width variable)
var r1=(rRing/Math.sqrt(2)-0.5*laneWidth)/(1-0.5*Math.sqrt(2));
var lArm=4*rRing;

function updatePhysicalDimensions(){ // only if sizePhys changed (mobile)
    center_xPhys=center_xRel*refSizePhys;
    center_yPhys=center_yRel*refSizePhys;
    rRing=0.15*refSizePhys; // roundabout radius [m] (laneWidth=width variable)
    r1=(rRing/Math.sqrt(2)-0.5*laneWidth)/(1-0.5*Math.sqrt(2));
    lArm=4*rRing;
}



// the following remains constant 
// => road becomes more compact for smaller screens

var car_length=5; // car length in m
var car_width=3; // car width in m
var truck_length=12; // trucks
var truck_width=4; 
var laneWidth=4; 




//###############################################################
// physical (m) roads
//###############################################################


var nLanes_arm=1;
var nLanes_ring=1;


// central ring (all in physical coordinates)

function trajRing_x(u){ 
    var dxPhysFromCenter=rRing*Math.cos(u/rRing);
    return center_xPhys+dxPhysFromCenter;
}

function trajRing_y(u){ 
    var dyPhysFromCenter=rRing*Math.sin(u/rRing);
    return center_yPhys+dyPhysFromCenter;
}


// arms 1 and 2 (ingoing/outgoing east arms)

var uc1=lArm-0.25*Math.PI*r1;
var xc1=(rRing+r1)/Math.sqrt(2)
var yc1=(rRing+r1)/Math.sqrt(2)
var x01=xc1+lArm-0.25*Math.PI*r1

function traj1_x(u){ 
    var dxPhysFromCenter=(u<uc1) ? x01-u : xc1-r1*Math.sin((u-uc1)/r1);
    return center_xPhys+dxPhysFromCenter;
}

function traj1_y(u){ 
    var dyPhysFromCenter=(u<uc1) ? 0.5*laneWidth : yc1-r1*Math.cos((u-uc1)/r1);
    return center_yPhys+dyPhysFromCenter;
}

function traj2_x(u){ 
    return traj1_x(lArm-u);
}

function traj2_y(u){ 
    return -traj1_y(lArm-u)+2*center_yPhys;
}


// arms 3 and 4 (ingoing/outgoing south arms)

function traj3_x(u){ 
    return traj1_y(u)-center_yPhys+center_xPhys;
}

function traj3_y(u){ 
    return -traj1_x(u)+center_xPhys+center_yPhys;
}

function traj4_x(u){ 
    return traj2_y(u)-center_yPhys+center_xPhys;
}

function traj4_y(u){ 
    return -traj2_x(u)+center_xPhys+center_yPhys;
}


// arms 5 and 6 (ingoing/outgoing west arms)

function traj5_x(u){ 
    return -traj1_x(u)+2*center_xPhys;;
}

function traj5_y(u){ 
    return -traj1_y(u)+2*center_yPhys;
}

function traj6_x(u){ 
    return -traj2_x(u)+2*center_xPhys;;
}

function traj6_y(u){ 
    return -traj2_y(u)+2*center_yPhys;
}

// arms 7 and 8 (ingoing/outgoing north arms)

function traj7_x(u){ 
    return -traj3_x(u)+2*center_xPhys;;
}

function traj7_y(u){ 
    return -traj3_y(u)+2*center_yPhys;
}

function traj8_x(u){ 
    return -traj4_x(u)+2*center_xPhys;;
}

function traj8_y(u){ 
    return -traj4_y(u)+2*center_yPhys;
}





//##################################################################
// Specification of logical road network
//##################################################################


var speedInit=20; // m/s
var densityInit=0.00;

//new road(ID,length,laneWidth,nLanes,traj_x,traj_y,
//		       densityInit,speedInit,truckFracInit,isRing);


var ring=new road(10,2*Math.PI*rRing,laneWidth,nLanes_ring,trajRing_x,trajRing_y,
		  0,0,0,true);

var arm=[]; 
arm[0]=new road(1,lArm,laneWidth,nLanes_arm,traj1_x,traj1_y,0,0,0,false);
arm[1]=new road(2,lArm,laneWidth,nLanes_arm,traj2_x,traj2_y,0,0,0,false);
arm[2]=new road(3,lArm,laneWidth,nLanes_arm,traj3_x,traj3_y,0,0,0,false);
arm[3]=new road(4,lArm,laneWidth,nLanes_arm,traj4_x,traj4_y,0,0,0,false);
arm[4]=new road(5,lArm,laneWidth,nLanes_arm,traj5_x,traj5_y,0,0,0,false);
arm[5]=new road(6,lArm,laneWidth,nLanes_arm,traj6_x,traj6_y,0,0,0,false);
arm[6]=new road(7,lArm,laneWidth,nLanes_arm,traj7_x,traj7_y,0,0,0,false);
arm[7]=new road(8,lArm,laneWidth,nLanes_arm,traj8_x,traj8_y,0,0,0,false);


//var offrampIDs=[2];
//var offrampLastExits=[umainDiverge+lrampDev];
//var offrampToRight=[true];
//ring.setOfframpInfo(offrampIDs,offrampLastExits,offrampToRight);
//ring.duTactical=duTactical;


//################################################################
// define routes
// 1=E-arm, ingoing, 3=S-arm, ingoing,  5=W-arm, ingoing, 7=N-arm, ingoing
// 2=E-arm, outgoing, 4=S-arm, outgoing,  6=W-arm, outgoing, 8=N-arm, outgoing
//################################################################

var route1L=[1,10,4];  // in E-arm, left turn
var route1C=[1,10,6];  // in E-arm, straight ahead
var route1R=[1,10,8];  // in E-arm, right turn
var route3L=[3,10,6];  // in E-arm, left turn
var route3C=[3,10,8];  // in E-arm, straight ahead
var route3R=[3,10,2];  // in E-arm, right turn
var route5L=[5,10,8];  // in E-arm, left turn
var route5C=[5,10,2];  // in E-arm, straight ahead
var route5R=[5,10,4];  // in E-arm, right turn
var route7L=[7,10,2];  // in E-arm, left turn
var route7C=[7,10,4];  // in E-arm, straight ahead
var route7R=[7,10,6];  // in E-arm, right turn



//############################################################
// add standing virtual vehicle at the end of the merging arms
// new vehicle (length, width, u, lane, speed, type)
// prepending=unshift
//############################################################

var virtualStandingVeh1=new vehicle(2, laneWidth, lArm-2, 0, 0, "obstacle");
var virtualStandingVeh3=new vehicle(2, laneWidth, lArm-2, 0, 0, "obstacle");
var virtualStandingVeh5=new vehicle(2, laneWidth, lArm-2, 0, 0, "obstacle");
var virtualStandingVeh7=new vehicle(2, laneWidth, lArm-2, 0, 0, "obstacle");

// need longmodel because of lagVeh?
var longModelObstacle=new ACC(0,IDM_T,IDM_s0,0,IDM_b);
var LCModelObstacle=undefined;
//virtualStandingVeh2.longModel=longModelObstacle; // check if needed
//virtualStandingVeh2.LCModel=LCModelObstacle;

// prepending=unshift

for(var i=0; i<8; i+=2){
    arm[i].veh.unshift(new vehicle(2, laneWidth, lArm-2, 0, 0, "obstacle"));
}






//#########################################################
// model specifications (ALL default parameters set in control_gui.js)
//#########################################################

var longModelCar;
var longModelTruck;
var LCModelCar;
var LCModelTruck;
var LCModelMandatory; // left right disting in road.updateModelsOfAllVehicles	
updateModels(); //  from control_gui.js  => define the 5 standard  models

// behavior if driving through ring and merge/diverges (car and trucks)
// |lateral accel| <= comf deceleration b

var v0CarRing=Math.min(IDM_v0, Math.sqrt(longModelCar.b*rRing));
var v0TruckRing=Math.min(factor_v0_truck*IDM_v0, Math.sqrt(longModelTruck.b*rRing));
var longModelCarRing=new ACC(v0CarRing,IDM_T,IDM_s0,IDM_a,IDM_b); 
var longModelTruckRing=new ACC(v0TruckRing,factor_T_truck*IDM_T,
			       IDM_s0,factor_a_truck*IDM_a,IDM_b); 

//####################################################################
// Global graphics specification and image file settings
//####################################################################

var hasChanged=true; // window dimensions have changed (responsive design)

var drawBackground=true; // if false, default unicolor background
var drawRoad=true; // if false, only vehicles are drawn
var userCanvasManip; // true only if user-driven geometry changes

var drawColormap=false;
var vmin_col=0; // min speed for speed colormap (drawn in red)
var vmax_col=70/3.6; // max speed for speed colormap (drawn in blue-violet)


//#########################################################
// The images
//#########################################################


// init background image

var background = new Image();
background.src ='figs/backgroundGrass.jpg'; 
 

// init vehicle image(s)

carImg = new Image();
carImg.src = 'figs/blackCarCropped.gif';
truckImg = new Image();
truckImg.src = 'figs/truck1Small.png';


// init traffic light images

traffLightRedImg = new Image();
traffLightRedImg.src='figs/trafficLightRed_affine.png';
traffLightGreenImg = new Image();
traffLightGreenImg.src='figs/trafficLightGreen_affine.png';


// init obstacle images

obstacleImgs = []; // srcFiles[0]='figs/obstacleImg.png'
for (var i=0; i<10; i++){
    obstacleImgs[i]=new Image();
    obstacleImgs[i].src = (i==0)
	? 'figs/obstacleImg.png'
	: "figs/constructionVeh"+i+".png";
}


// init road images

roadImgs1 = []; // road with lane separating line
roadImgs2 = []; // road without lane separating line

for (var i=0; i<4; i++){
    roadImgs1[i]=new Image();
    roadImgs1[i].src="figs/road"+(i+1)+"lanesCropWith.png"
    roadImgs2[i]=new Image();
    roadImgs2[i].src="figs/road"+(i+1)+"lanesCropWithout.png"
}

ringImg1 = new Image();
ringImg1=roadImgs1[nLanes_ring-1];
ringImg2 = new Image();
ringImg2=roadImgs2[nLanes_ring-1];

armImg1 = new Image();
armImg1=roadImgs1[nLanes_arm-1];

armImg2 = new Image();
armImg2=roadImgs2[nLanes_arm-1];



//####################################################################
// vehicleDepot(nImgs,nRow,nCol,xDepot,yDepot,lVeh,wVeh,containsObstacles)
//####################################################################

/*
var smallerDimPix=Math.min(canvas.width,canvas.height);
var depot=new vehicleDepot(obstacleImgs.length, 3,3,
			   0.7*smallerDimPix/scale,
			   -0.5*smallerDimPix/scale,
			   20,20,true);
*/

//############################################
// run-time specification and functions
//############################################

var time=0;
var itime=0;
var fps=30; // frames per second
var dt=timewarp/fps;




//#################################################################
function updateSim(){
//#################################################################

    // update times

    time +=dt; // dt depends on timewarp slider (fps=const)
    itime++;

    //##############################################################
    // (1) transfer effects from slider interaction and mandatory regions
    // to the vehicles and models:
    // also initialize models for new cars entering at inflow points
    //##############################################################

 
    // updateModelsOfAllVehicles also selectively sets LCModelMandatory
    // to offramp vehs based on their routes!

    ring.updateModelsOfAllVehicles(longModelCar,longModelTruck,
				       LCModelCar,LCModelTruck,
				       LCModelMandatory);
    for(var i=0; i<arm.length; i++){
        arm[i].updateModelsOfAllVehicles(longModelCar,longModelTruck,
					 LCModelCar,LCModelTruck,
					 LCModelMandatory);
    }

     //such things as road.setLCMandatory(lArm-lrampDev, lDev, false); needed?



    //##############################################################
    // (2) do central simulation update of vehicles
    //##############################################################

    var routeIn=(Math.random()<0.5) ? route1L : route1C; //!!!

    arm[0].calcAccelerations();  
    arm[0].updateSpeedPositions();
    arm[0].updateBCdown();
    arm[0].updateBCup(0.5*qIn,dt,routeIn);

    arm[1].updateLastLCtimes(dt); // needed since LC from ring!!?

    
    var du_antic=20; //shift anticipation decision point upstream by du_antic

    // umainDiverge, umainMerge updated in canvas_gui.handleDependencies
    //template: mergeDiverge(newRoad,offset,uStart,uEnd,isMerge,toRight)


    /*
    ring.mergeDiverge(arm[1],-umainDiverge,
			  umainDiverge+taperLen,
			  umainDiverge+lrampDev-du_antic,
			  false,true);
    arm[1].mergeDiverge(ring, umainMerge-(arm[1].roadLen-lrampDev),
			   arm[1].roadLen-lrampDev, 
			   arm[1].roadLen-taperLen, 
			   true,false);
 
*/

 
     //!!!
/*
    if(depotVehZoomBack){
	var res=depot.zoomBackVehicle();
	depotVehZoomBack=res;
	userCanvasManip=true;
    }
*/


}//updateSim




//##################################################
function drawSim() {
//##################################################


    /* (0) redefine graphical aspects of road (arc radius etc) using
     responsive design if canvas has been resized 
     */

    var hasChanged=false;

    if(false){
        console.log(" new total inner window dimension: ",
		window.innerWidth," X ",window.innerHeight,
		" (full hd 16:9 e.g., 1120:630)",
		" canvas: ",canvas.width," X ",canvas.height);
    }


    if ((canvas.width!=simDivWindow.clientWidth)
	||(canvas.height != simDivWindow.clientHeight)){
	hasChanged=true;
	canvas.width  = simDivWindow.clientWidth;
        canvas.height  = simDivWindow.clientHeight;
	aspectRatio=canvas.width/canvas.height;
	refSizePix=Math.min(canvas.height,canvas.width/critAspectRatio);

	scale=refSizePix/refSizePhys; // refSizePhys=constant unless mobile

	updatePhysicalDimensions();

        // gridTrajectories only needed if roads can be distorted by mouse

        arm[0].gridTrajectories(traj1_x,traj1_y);
        arm[1].gridTrajectories(traj2_x,traj2_y);
        arm[2].gridTrajectories(traj3_x,traj3_y);
        arm[3].gridTrajectories(traj4_x,traj4_y);
        arm[4].gridTrajectories(traj5_x,traj5_y);
        arm[5].gridTrajectories(traj6_x,traj6_y);
        arm[6].gridTrajectories(traj7_x,traj7_y);
        arm[7].gridTrajectories(traj8_x,traj8_y);
    }

 
    // (1) update heading of all vehicles rel. to road axis
    // (for some reason, strange rotations at beginning)

    ring.updateOrientation();  // check if needed


    // (2) reset transform matrix and draw background
    // (only needed if no explicit road drawn)
    // "%20-or condition"
    //  because some older firefoxes do not start up properly?

    ctx.setTransform(1,0,0,1,0,0); 
    if(drawBackground){
	if(userCanvasManip ||hasChanged
	   ||(itime<=1) || (itime===20) || false || (!drawRoad)){
	  ctx.drawImage(background,0,0,canvas.width,canvas.height);
      }
    }


    // (3) draw mainroad and arms (deviation "bridge" => draw last)
    // and vehicles (directly after frawing resp road or separately, depends)
    // (always drawn; changedGeometry only triggers building a new lookup table)
    //!!! sometimes road elements are moved as though they were vehicles
    // check/debug with omitting drawing of the road (changedGeometry=false)!


    // roads
    
    var changedGeometry=userCanvasManip || hasChanged||(itime<=1); 
    for(var i=0; i<arm.length; i++){
	arm[i].draw(armImg1,armImg2,scale,changedGeometry);
    }
    ring.draw(ringImg1,ringImg2,scale,changedGeometry);


    // vehicles

    for(var i=0; i<arm.length; i++){
        arm[i].drawVehicles(carImg,truckImg,obstacleImgs,scale,vmin_col,vmax_col);
    }
    ring.drawVehicles(carImg,truckImg,obstacleImgs,scale,vmin_col,vmax_col);

      
    
    // (5) !!! draw depot vehicles

    //depot.draw(obstacleImgs,scale,canvas);

    // (6) draw simulated time

    displayTime(time);


     // (7) draw the speed colormap

    if(drawColormap){ 
	displayColormap(0.22*refSizePix,
			0.43*refSizePix,
			0.1*refSizePix, 0.2*refSizePix,
			vmin_col,vmax_col,0,100/3.6);
    }


    // revert to neutral transformation at the end!
    ctx.setTransform(1,0,0,1,0,0); 
}// drawSim
 

 //##################################################
// Running function of the sim thread (triggered by setInterval)
//##################################################

function main_loop() {
    updateSim();
    drawSim();
    userCanvasManip=false;
}
 


 //############################################
// start the simulation thread
// THIS function does all the things; everything else 
// only functions/definitions
// triggers:
// (i) automatically when loading the simulation 
// (ii) when pressing the start button 
//  ("myRun=setInterval(main_loop, 1000/fps);")
//############################################

console.log("first main execution");
showInfo();
var myRun=setInterval(main_loop, 1000/fps);



 

 
