(window.webpackJsonp=window.webpackJsonp||[]).push([[0],{36:function(e,n,t){"use strict";t.r(n);var r=t(1),o=t(0),i=t.n(o),a=t(31),c=t(32),d=t.n(c),s=t(34),l=t.n(s),u=[6710886,11184810],m=0,p=function(){return m=(m+1)%u.length,new a.Color(u[m])},w=function(e){var n=[];for(m=0;m<e;m++)n.push(new a.Vector3(2*Math.random()-1,3*Math.random()-.75,3*Math.random()-.75));return n},f={flex:1,padding:"3px",display:"flex",flexDirection:"column"},h={flex:1,border:"1px solid #444",overflow:"hidden"},v=function(e){function n(){var n=null!==e&&e.apply(this,arguments)||this;return n.sumVector=new a.Vector3(0,0,0),n.resizeHandler=d()((function(){n.camera.aspect=n.content.clientWidth/n.content.clientHeight,n.camera.updateProjectionMatrix(),n.renderer.setSize(n.content.clientWidth,n.content.clientHeight)}),100),n.init=function(){n.scene=new a.Scene,n.camera=new a.PerspectiveCamera(30,null,.1,1e3),n.camera.position.set(40,15,40),n.camera.lookAt(new a.Vector3(0,0,0)),n.renderer=new a.WebGLRenderer({alpha:!0,antialias:!0}),n.control=new(l()(a))(n.camera,n.renderer.domElement),n.control.zoomSpeed=.2,n.renderer.render(n.scene,n.camera),n.renderer.setSize(n.content.clientWidth,n.content.clientHeight),n.content.appendChild(n.renderer.domElement),n.resizeHandler(),window.addEventListener("resize",n.resizeHandler),n.animate()},n.addAxis=function(){var e=new a.GridHelper(100,30,2105376,1381653);n.scene.add(e)},n.animate=function(){n.control.update(),requestAnimationFrame(n.animate),n.renderer.render(n.scene,n.camera)},n.setContent=function(e){return n.content=e},n.renderArrows=function(){w(60).forEach((function(e){n.addArrow(e,2*Math.random()+2,p()),n.sumVector.add(e)})),n.addArrow(n.sumVector,15,new a.Color("cyan"))},n.addArrow=function(e,t,r){void 0===t&&(t=10),void 0===r&&(r=16776960),e.normalize();var o=new a.Vector3(0,0,0),i=new a.ArrowHelper(e,o,t,r,.5);n.scene.add(i)},n}return Object(r.b)(n,e),n.prototype.componentDidMount=function(){this.init(),this.addAxis(),this.renderArrows()},n.prototype.componentWillUnmount=function(){window.removeEventListener("resize",this.resizeHandler)},n.prototype.render=function(){return i.a.createElement("div",{style:f},i.a.createElement("div",{ref:this.setContent,style:h}))},n}(i.a.Component);n.default=v}}]);