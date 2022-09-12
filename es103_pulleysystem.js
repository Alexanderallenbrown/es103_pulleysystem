var pulley;

var initw;
var simtime;
var recdata;
var simrunning;
var recorder;

var rectime;
var startrecrime;
var holdmasses;

function setup() {
  holdmasses=true;
  rectime = 0;
  startrectime = 0;
  simrunning = false;
  initw = 10.0;
  simtime = 10.0;
  recdata=false;
  
  createCanvas(700, 300);
  
  recorder = new Recorder();
  
  simtitle = createElement('h2','Pulley System Simulator');
  simtitle.position(width/2,0)
  //create an input for radius
  m1box = createInput();
  m1box.position(300,100);
  
  resetbutton = createButton('Reset Masses');
  resetbutton.position(m1box.x, m1box.y-m1box.height*1.5);
  resetbutton.mousePressed(resetBlocks);
  m1label = createElement('body', 'left mass (kg)');
  m1label.position(m1box.x+m1box.width, m1box.y);
  m1box.value('0.51');
  
  m2box = createInput();
  m2box.position(m1box.x,m1box.y+1.5*m1box.height);
  m2box.value('0.5');
  vellabel = createElement('body','right mass (kg)');
  vellabel.position(m2box.x+m2box.width,m2box.y);
  
  
  recbox = createCheckbox('Record Data: columns [time, omega (rad/s)]', false);
  recbox.position(m2box.x,m2box.y+m2box.height*1.5)
  //recbox.changed(setRec);
  
  
  runbox = createInput();
  runbox.position(recbox.x,recbox.y+m1box.height*1.5);
  runlabel = createElement('body','Record Time (s)');
  runlabel.position(runbox.x+runbox.width,runbox.y);
  runbox.value('5.0')
  
  runbtn = createButton('Run Experiment');
  runbtn.position(runbox.x,runbox.y+runbox.height*1.5);
  runbtn.mousePressed(runSim);
  
  
  
  pulley = new PulleySystem(100,100,250);
  
  pulleynote = createElement('h6','Steel pulley 0.01m thick, 0.05m radius');
  //filenote = createElement('body','datafile columns: [time, pulley angular velocity (rad/s)]')
  pulleynote.position(10,10);
}

function draw() {
  background(220);
  
  
  pulley.update(.01);
  
  rectime = millis()/1000.0-startrectime;
  if((rectime>simtime)){
    recdata=false;
    if(1){
      simrunning=false;
    }
    
  }
  else{
    if(simrunning){
      simrunning=true;
    }
    recording=true;
  }
  recorder.update(recdata,'pulleydata.txt',pulley.dt,[pulley.thetadot])
  
  
}

function PulleySystem(ixo,iyo,iscale){
  this.dt = 1.0/60.0
  this.oldtime = millis();
  this.spokes = 3;
  this.xo = ixo;
  this.yo = iyo;
  this.scale = iscale;
  this.density = 7850;//kg/m^3
  this.thick = 0.01;//m, thickness of pulley
  this.r = 0.05;//m, pulley radius
  this.m = PI*pow(this.r,2)*this.thick*this.density;//mass
  this.J = this.m/2*pow(this.r,2);//kg-m^2, moment of inertia
  this.b = 0.005;// damping constant of bearing
  this.tc = 0.000;//coulomb torque
  //bearing
  this.rinner = 0.01;//bearing radius.
  
  this.m1 = .5;
  this.m2 = .51;
  this.m1x = -.5;
  this.m2x = -.5;
  
  //dynamic variables
  this.theta = 0;
  this.thetadot = 0 ;
  
  this.updateRadius = function(r){
    this.r = r;//m, pulley radius
    this.m = PI*pow(this.r,2)*this.thick*this.density;//mass
    this.J = this.m/2*pow(this.r,2);//kg-m^2, moment of inertia
    
  }
  
  
  
  
  this.draw = function(){
    
    fill(this.masscolor);
    //now draw m1
    push();
    translate(this.xo,this.yo);
    scale(this.scale);
    strokeWeight(1.0/this.scale);
    translate(-this.r,-this.m1x);
    rectMode(CENTER);
    line(0,0,0,this.m1x);
    rect(0,0,this.r,this.r);
    pop();
    push();
    translate(this.xo,this.yo);
    scale(this.scale);
    strokeWeight(1.0/this.scale);
    translate(this.r,-this.m2x);
    rectMode(CENTER);
    line(0,0,0,this.m2x);
    rect(0,0,this.r,this.r);
    pop();
    
    push()
     console.log(this.theta)
    translate(this.xo,this.yo);
    scale(this.scale);
    strokeWeight(1.0/this.scale);
    var pulleyface = color(100,100,100);
    fill(pulleyface);
    stroke(0);
    ellipse(0,0,2*this.r,2*this.r);
    rotate(-this.theta);
    for(var t=0;t<(2*PI);t=t+(2*PI)/this.spokes){
      push();
      rotate(t);
      line(0,0,this.r,0);
      pop();
    }
    fill(color(250,170,0));
    ellipse(0,0,2*this.rinner,2*this.rinner);
    fill(0);
    ellipse(0,0,this.rinner,this.rinner);
    
    pop();
    
    
    
    
  }
  
  this.stateDerivs = function(th,thd){
    if(1){
      thdd=1.0/(this.J+pow(this.r,2)*(this.m1+this.m2))*(-this.b*thd-this.tc*sign(this.thd) +9.81*this.r*(this.m1-this.m2));
      //thdd=1.0/(this.J)*(-this.b*thd);
    }
    else{
      thdd=0
      thd=0
    }
    return[thd,thdd]
  }
  
  // this.doEuler = function(){
  //   thdd=1.0/(this.J+(pow(this.r),2)*(this.m1+this.m2))*(-this.b*thd-this.tc*sign(this.thd) +9.81*this.r*(this.m1-this.m2));
  //   if(this.thetadot>0){
  //     this.theta+=this.thetadot*this.dt;
  //     this.thetadot+=thdd*this.dt;
  //   }
  //   //console.log(this.thetadot,this.dt);
  // }
  
  this.doPhysics = function(){ 
    //console.log(this.m1x,this.m2x,this.theta,this.thetadot)
    //rk step 1 
    k1x=this.stateDerivs(this.theta,this.thetadot);
    thd_hat1 = this.thetadot+this.dt*k1x[1];
    th_hat1 = this.theta+this.dt*k1x[0];
    //rk step 2
    k2x = this.stateDerivs(th_hat1,thd_hat1);
    thd_hat2 = this.thetadot+this.dt/2*k2x[1];
    th_hat2 = this.theta+this.dt/2*k2x[0];
    //rk step 3
    k3x = this.stateDerivs(th_hat2,thd_hat2);
    thd_hat3 = this.thetadot+this.dt*k3x[1];
    th_hat3 = this.theta+this.dt*k3x[0];
    //rk step 4
    k4x = this.stateDerivs(th_hat3,thd_hat3);
    
    sum1th = k4x[0]+2*k3x[0];
    sum1thd = k4x[1]+2*k3x[1];
    
    sum2th = sum1th+2*k2x[0];
    sum2thd = sum1thd+2*k2x[1];
    
    sum3th = sum2th+k1x[0];
    sum3thd= sum2thd+k1x[1];
    
    thd_final = 1.0/6*sum3th;
    thdd_final = 1.0/6*sum3thd;
    
    if((this.m1x<(-1*this.r))&&(this.m2x<-1*this.r)&&!(holdmasses)){
      // console.log(this.m1x);
    this.theta = this.theta+this.dt*thd_final;
    this.thetadot = this.thetadot+this.dt*thdd_final;
    this.m1x-=this.thetadot*this.r*this.dt;
    this.m2x+=this.thetadot*this.r*this.dt;
    //console.log(this.theta,this.thetadot)
      this.masscolor = color(100,100,100);
    }
    else{
      this.thetadot=0;
      this.masscolor = color(255,0,0);
    }
    //console.log(this.thetadot)
    
  }
  
  this.update = function(dt){
    this.dt = millis()/1000.0-this.oldtime;
    this.oldtime = millis()/1000.0;
    if(this.dt>0.02){
      this.dt = 0.02;
    }
    this.doPhysics();
    this.draw(); 
  }
}


function sign(x){
  if(x>0){
    return 1.0;
  }
  else if(x<0){
    return -1.0;
  }
  else{
    return 0.0;
  }
}

function updateParams() {
  setRec();
  my_m1 = parseFloat(m1box.value());
  if(isNaN(my_m1)){
    alert('Not a Number, try again');
  }
  else if(my_m1<0){
    alert('Cannot be negative. Try again');
  }
  else if(my_m1>.6){
    alert('Too Large. Try less than 0.6kg')
  }
  else{
    pulley.m1 = my_m1;
  }
  
  my_m2 = parseFloat(m2box.value());
  if(isNaN(my_m2)){
    alert('Not a Number, try again');
  }
  else if(my_m2<0){
    alert('Cannot be negative. Try again');
  }
  else if(my_m2>.6){
    alert('Too Large. Try less than .6kg')
  }
  else{
    pulley.m2 = my_m2;
  }
  
  my_t = parseFloat(runbox.value());
  if(isNaN(my_t)){
    alert('Not a Number, try again');
  }
  else if(my_t<0){
    alert('Cannot be negative. Try again');
  }
  else if(my_t>20){
    alert('Too Large. Try less than 20 s')
  }
  else{
    simtime = my_t;
  }
  
  

  
}


function setRec(){
  if (recbox.checked()) {
    console.log(recbox.checked());
    recdata = recbox.checked();
    
  } else {
    console.log(recbox.checked());
    recdata = recbox.checked();
  }
}

function resetBlocks(){
  pulley.m1x=-0.5;
  pulley.m2x=-0.5;
  pulley.theta = 0;
  holdmasses=true;
}

function runSim(){
  if(!simrunning){
    resetBlocks();
    holdmasses=false;
    simrunning=true;
    startrectime = millis()/1000.0;
    updateParams();
    setRec();
  }
  
}




function Recorder(){

  this.data = "";
  this.type = "text/latex";
  this.t = 0;
  this.recording = false;
  this.wasrecording = false;



  this.update = function(active,name,dt,data){
    this.recording = active;

    if(this.recording){
      this.data+=String(this.t);
      this.data+="\t";
      for(i=0;i<data.length;i++){
        this.data+=String(data[i]);
        this.data+="\t";
      }
      this.data+="\r\n";
      this.t+=dt
    }
    else{
      if(this.wasrecording){
        this.doSave(name);
        this.t = 0
        this.data=[]

      }

    }
    this.wasrecording = this.recording;

  }

  this.doSave = function(name) {
  var blob;
  if (typeof window.Blob == "function") {
    blob = new Blob([this.data], {
      type: this.type
    });
  } else {
    var BlobBuilder = window.BlobBuilder || window.MozBlobBuilder || window.WebKitBlobBuilder || window.MSBlobBuilder;
    var bb = new BlobBuilder();
    bb.append(this.data);
    blob = bb.getBlob(this.type);
  }
  var URL = window.URL || window.webkitURL;
  var bloburl = URL.createObjectURL(blob);
  var anchor = document.createElement("a");
  if ('download' in anchor) {
    anchor.style.visibility = "hidden";
    anchor.href = bloburl;
    anchor.download = name;
    document.body.appendChild(anchor);
    var evt = document.createEvent("MouseEvents");
    evt.initEvent("click", true, true);
    anchor.dispatchEvent(evt);
    document.body.removeChild(anchor);
  } else if (navigator.msSaveBlob) {
    navigator.msSaveBlob(blob, name);
  } else {
    location.href = bloburl;
  }
}

}
