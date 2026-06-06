(function(){
  "use strict";

  var TWO_PI=6.283185307179586;
  var FONT='ui-monospace,"SF Mono",SFMono-Regular,Menlo,Consolas,"Liberation Mono",monospace';
  var MAX_DPR=2;
  var GAINX=1.85;
  var ARC=0.05;
  var POWER=0.8;
  var F1=2.1;
  var F2=3.7;
  var F3=5.3;
  var FRAME_MS=80;

  function decode(data){
    var bin=atob(data),out=new Uint8Array(bin.length);
    for(var i=0;i<bin.length;i++)out[i]=bin.charCodeAt(i);
    return out;
  }

  function FieldRenderer(canvas,opts){
    opts=opts||{};
    this.canvas=canvas;
    this.ctx=canvas.getContext("2d",{alpha:true});
    this.source=opts.field||window.MF_FIELD;
    this.cols=this.source.cols|0;
    this.rows=this.source.rows|0;
    this.kCool=this.source.kCool|0;
    this.bytes=decode(this.source.data);
    this.palette=this.source.palette||[];
    this.glyphs=[];
    for(var i=0;i<this.source.chars.length;i++)this.glyphs[i]=this.source.chars.charAt(i);

    this.envelope=new Float64Array(this.cols);
    this.phase1=new Float64Array(this.cols);
    this.phase2=new Float64Array(this.cols);
    this.phase3=new Float64Array(this.cols);
    this.heightCurve=new Float64Array(this.rows);
    this.wave=new Float64Array(this.cols);
    this.running=false;
    this.raf=0;
    this.last=0;
    this.resizePending=false;

    for(var x=0;x<this.cols;x++){
      var px=x/(this.cols-1);
      this.envelope[x]=Math.min(1,Math.sin(Math.PI*px)/0.35);
      this.phase1[x]=TWO_PI*F1*px;
      this.phase2[x]=TWO_PI*F2*px;
      this.phase3[x]=TWO_PI*F3*px;
    }
    for(var y=0;y<this.rows;y++){
      this.heightCurve[y]=Math.pow((this.rows-1-y)/(this.rows-1),POWER);
    }
  }

  FieldRenderer.prototype.resize=function(){
    var w=Math.max(1,window.innerWidth|0);
    var h=Math.max(1,window.innerHeight|0);
    var dpr=Math.min(MAX_DPR,Math.max(1,window.devicePixelRatio||1));
    var pw=Math.ceil(w*dpr);
    var ph=Math.ceil(h*dpr);

    if(this.canvas.width!==pw)this.canvas.width=pw;
    if(this.canvas.height!==ph)this.canvas.height=ph;
    this.canvas.style.width=w+"px";
    this.canvas.style.height=h+"px";

    this.width=w;
    this.height=h;
    this.dpr=dpr;
    this.ctx.setTransform(dpr,0,0,dpr,0,0);
    this.cellH=h/this.rows;
    this.font=this.cellH+"px "+FONT;
    this.ctx.font=this.font;
    this.ctx.textBaseline="top";
    this.cellW=this.ctx.measureText("M").width||this.cellH*0.6;
    this.tileW=this.cols*this.cellW;
    this.tiles=Math.max(1,Math.ceil(w/this.tileW)+1);
    this.draw(0);
  };

  FieldRenderer.prototype.draw=function(t){
    var ctx=this.ctx;
    var cols=this.cols,rows=this.rows,bytes=this.bytes;
    var kCool=this.kCool,palette=this.palette,glyphs=this.glyphs;
    var cellW=this.cellW,cellH=this.cellH,tileW=this.tileW;
    var envelope=this.envelope,phase1=this.phase1,phase2=this.phase2,phase3=this.phase3;
    var heightCurve=this.heightCurve,wave=this.wave;
    var lastColor=-1;

    ctx.clearRect(0,0,this.width,this.height);
    ctx.font=this.font;
    ctx.textBaseline="top";

    for(var y=0;y<rows;y++){
      var yn=y/rows;
      var p1=-t/5200*TWO_PI+2.3*yn;
      var p2=-t/3500*TWO_PI+3.4*yn+1.7;
      var p3=-t/4400*TWO_PI+1.1*yn+4.0;
      for(var x=0;x<cols;x++){
        wave[x]=Math.sin(phase1[x]+p1)+0.6*Math.sin(phase2[x]+p2)+0.4*Math.sin(phase3[x]+p3);
      }

      var gx=heightCurve[y]*GAINX;
      var py=y*cellH;
      for(var tile=0;tile<this.tiles;tile++){
        var ox=tile*tileW;
        for(x=0;x<cols;x++){
          var D=gx*envelope[x]*(wave[x]-wave[cols-1-x]);
          var dy=ARC*D*D;
          if(dy>3)dy=3;

          var sx=Math.round(x-D);
          if(sx<0)sx=0;
          else if(sx>=cols)sx=cols-1;

          var sy=Math.round(y-dy);
          if(sy<0)sy=0;
          else if(sy>=rows)sy=rows-1;

          var b=bytes[sy*cols+sx];
          var ci=b&15;
          var cc=b>>4;
          if(ci===0||cc<kCool){
            b=bytes[y*cols+x];
            ci=b&15;
            cc=b>>4;
            if(cc>=kCool)ci=0;
          }

          if(ci!==0){
            if(cc!==lastColor){
              ctx.fillStyle=palette[cc]||"#7a8a86";
              lastColor=cc;
            }
            ctx.fillText(glyphs[ci],ox+x*cellW,py);
          }
        }
      }
    }
  };

  FieldRenderer.prototype.start=function(){
    if(this.running)return;
    this.running=true;
    this.last=0;
    var self=this;
    function loop(t){
      if(!self.running)return;
      self.raf=requestAnimationFrame(loop);
      if(t-self.last<FRAME_MS)return;
      self.last=t;
      self.draw(t);
    }
    this.raf=requestAnimationFrame(loop);
  };

  FieldRenderer.prototype.stop=function(){
    this.running=false;
    if(this.raf)cancelAnimationFrame(this.raf);
    this.raf=0;
  };

  FieldRenderer.prototype.destroy=function(){
    this.stop();
  };

  function mount(canvas,opts){
    opts=opts||{};
    if(!canvas||!window.MF_FIELD)return null;

    var renderer=new FieldRenderer(canvas,opts);
    var motion=window.matchMedia("(prefers-reduced-motion:reduce)");
    var shouldAnimate=opts.animate!==false;

    function resizeSoon(){
      if(renderer.resizePending)return;
      renderer.resizePending=true;
      requestAnimationFrame(function(){
        renderer.resizePending=false;
        renderer.resize();
      });
    }

    function syncMotion(){
      if(shouldAnimate&&!motion.matches)renderer.start();
      else{
        renderer.stop();
        renderer.draw(0);
      }
    }

    renderer.resize();
    syncMotion();
    window.addEventListener("resize",resizeSoon,{passive:true});
    if(motion.addEventListener)motion.addEventListener("change",syncMotion);
    else if(motion.addListener)motion.addListener(syncMotion);

    var destroy=renderer.destroy.bind(renderer);
    renderer.destroy=function(){
      destroy();
      window.removeEventListener("resize",resizeSoon);
      if(motion.removeEventListener)motion.removeEventListener("change",syncMotion);
      else if(motion.removeListener)motion.removeListener(syncMotion);
    };

    return renderer;
  }

  window.MFField={mount:mount};
})();
