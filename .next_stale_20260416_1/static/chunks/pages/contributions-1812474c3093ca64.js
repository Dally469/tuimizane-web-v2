(self.webpackChunk_N_E=self.webpackChunk_N_E||[]).push([[187],{4196:function(e,t,r){(window.__NEXT_P=window.__NEXT_P||[]).push(["/contributions",function(){return r(8725)}])},8725:function(e,t,r){"use strict";r.r(t),r.d(t,{default:function(){return $}});var n=r(5893),i=r(7294),a=r(1880),o=r(4237),s=r(1507),l=r(4919),d=r(3297),c=r(5473),u=r(635),h=r(512),p=r(266),x=r(917),m=r(1610),f=r(5870),g=r(8161),v=r(4590),b=r(6787);function y(e){return(0,b.ZP)("MuiSkeleton",e)}(0,v.Z)("MuiSkeleton",["root","text","rectangular","rounded","circular","pulse","wave","withChildren","fitContent","heightAuto"]);let j=e=>{let{classes:t,variant:r,animation:n,hasChildren:i,width:a,height:o}=e;return(0,p.Z)({root:["root",r,n,i&&"withChildren",i&&!a&&"fitContent",i&&!o&&"heightAuto"]},y,t)},w=x.F4`
  0% {
    opacity: 1;
  }

  50% {
    opacity: 0.4;
  }

  100% {
    opacity: 1;
  }
`,Z=x.F4`
  0% {
    transform: translateX(-100%);
  }

  50% {
    /* +0.5s of delay between each loop */
    transform: translateX(100%);
  }

  100% {
    transform: translateX(100%);
  }
`,C="string"!=typeof w?x.iv`
        animation: ${w} 2s ease-in-out 0.5s infinite;
      `:null,k="string"!=typeof Z?x.iv`
        &::after {
          animation: ${Z} 2s linear 0.5s infinite;
        }
      `:null,S=(0,m.ZP)("span",{name:"MuiSkeleton",slot:"Root",overridesResolver:(e,t)=>{let{ownerState:r}=e;return[t.root,t[r.variant],!1!==r.animation&&t[r.animation],r.hasChildren&&t.withChildren,r.hasChildren&&!r.width&&t.fitContent,r.hasChildren&&!r.height&&t.heightAuto]}})((0,f.Z)(({theme:e})=>{let t=String(e.shape.borderRadius).match(/[\d.\-+]*\s*(.*)/)[1]||"px",r=parseFloat(e.shape.borderRadius);return{display:"block",backgroundColor:e.vars?e.vars.palette.Skeleton.bg:e.alpha(e.palette.text.primary,"light"===e.palette.mode?.11:.13),height:"1.2em",variants:[{props:{variant:"text"},style:{marginTop:0,marginBottom:0,height:"auto",transformOrigin:"0 55%",transform:"scale(1, 0.60)",borderRadius:`${r}${t}/${Math.round(r/.6*10)/10}${t}`,"&:empty:before":{content:'"\\00a0"'}}},{props:{variant:"circular"},style:{borderRadius:"50%"}},{props:{variant:"rounded"},style:{borderRadius:(e.vars||e).shape.borderRadius}},{props:({ownerState:e})=>e.hasChildren,style:{"& > *":{visibility:"hidden"}}},{props:({ownerState:e})=>e.hasChildren&&!e.width,style:{maxWidth:"fit-content"}},{props:({ownerState:e})=>e.hasChildren&&!e.height,style:{height:"auto"}},{props:{animation:"pulse"},style:C||{animation:`${w} 2s ease-in-out 0.5s infinite`}},{props:{animation:"wave"},style:{position:"relative",overflow:"hidden",WebkitMaskImage:"-webkit-radial-gradient(white, black)","&::after":{background:`linear-gradient(
                90deg,
                transparent,
                ${(e.vars||e).palette.action.hover},
                transparent
              )`,content:'""',position:"absolute",transform:"translateX(-100%)",bottom:0,left:0,right:0,top:0}}},{props:{animation:"wave"},style:k||{"&::after":{animation:`${Z} 2s linear 0.5s infinite`}}}]}})),R=i.forwardRef(function(e,t){let r=(0,g.i)({props:e,name:"MuiSkeleton"}),{animation:i="pulse",className:a,component:o="span",height:s,style:l,variant:d="text",width:c,...u}=r,p={...r,animation:i,component:o,variant:d,hasChildren:!!u.children},x=j(p);return(0,n.jsx)(S,{as:o,ref:t,className:(0,h.Z)(x.root,a),ownerState:p,...u,style:{width:c,height:s,...l}})});var _=r(2133),A=r(4245),E=r(2044),z=r(5271),N=r(1153);function $(){var e,t,r,h;let{contributions:p,summary:x,fetchContributions:m,fetchSummary:f,approveContribution:g,rejectContribution:v,isLoading:b,error:y}=(0,E.S_)(),[j,w]=i.useState("ALL");i.useEffect(()=>{m("ALL"===j?void 0:{status:j}),f()},[m,f,j]);let Z=[{label:"Total amount",value:(0,N.xG)(null!==(e=null==x?void 0:x.totalAmount)&&void 0!==e?e:0),color:"primary"},{label:"Accepted",value:(null!==(t=null==x?void 0:x.acceptedContributions)&&void 0!==t?t:0).toString(),color:"success"},{label:"Pending",value:(null!==(r=null==x?void 0:x.pendingContributions)&&void 0!==r?r:0).toString(),color:"warning"},{label:"Rejected",value:(null!==(h=null==x?void 0:x.rejectedContributions)&&void 0!==h?h:0).toString(),color:"error"}];return(0,n.jsx)(A.c,{title:"Contributions",subtitle:"Collection activity",children:(0,n.jsxs)(a.Z,{sx:{display:"grid",gap:2.5},children:[y&&(0,n.jsx)(o.Z,{severity:"error",children:y}),(0,n.jsx)(a.Z,{sx:{display:"grid",gap:2,gridTemplateColumns:{xs:"1fr",md:"repeat(4, 1fr)"}},children:Z.map(e=>(0,n.jsxs)(s.Z,{sx:{borderRadius:"20px",p:3.5,bgcolor:"background.warm",boxShadow:"none"},children:[(0,n.jsx)(l.Z,{sx:{fontSize:13,textTransform:"uppercase",letterSpacing:"0.18em",color:"text.secondary"},children:e.label}),(0,n.jsx)(l.Z,{sx:{mt:1.5,fontSize:28,fontWeight:800},children:e.value}),(0,n.jsx)(d.Z,{label:e.label,size:"small",color:e.color,sx:{mt:1.5}})]},e.label))}),(0,n.jsxs)(s.Z,{sx:{borderRadius:"24px",p:3.5},children:[(0,n.jsxs)(a.Z,{sx:{display:"flex",justifyContent:"space-between",gap:2,flexDirection:{xs:"column",md:"row"}},children:[(0,n.jsxs)(a.Z,{children:[(0,n.jsx)(l.Z,{variant:"h4",children:"Contribution records"}),(0,n.jsx)(l.Z,{sx:{mt:1.25,fontSize:14,color:"text.secondary"},children:"Review contribution status and approve or reject records from the same sticky layout."})]}),(0,n.jsxs)(c.Z,{value:j,onChange:e=>w(e.target.value),size:"small",sx:{minWidth:180},children:[(0,n.jsx)(u.Z,{value:"ALL",children:"All statuses"}),Object.values(z.vp).map(e=>(0,n.jsx)(u.Z,{value:e,children:e},e))]})]}),(0,n.jsx)(a.Z,{sx:{mt:2.5,display:"grid",gap:1.5},children:b&&0===p.length?Array.from({length:4}).map((e,t)=>(0,n.jsx)(R,{variant:"rounded",height:120},t)):p.map(e=>(0,n.jsx)(s.Z,{sx:{p:3,borderRadius:"18px",bgcolor:"background.warm",boxShadow:"none"},children:(0,n.jsxs)(a.Z,{sx:{display:"flex",justifyContent:"space-between",gap:2,flexDirection:{xs:"column",md:"row"}},children:[(0,n.jsxs)(a.Z,{children:[(0,n.jsx)(l.Z,{sx:{fontSize:18,fontWeight:800},children:(0,N.xG)(e.amount,e.currency)}),(0,n.jsxs)(l.Z,{sx:{mt:.75,fontSize:14,color:"text.secondary"},children:["Date: ",(0,N.p6)(e.contributionDate)]}),(0,n.jsxs)(l.Z,{sx:{mt:.5,fontSize:14,color:"text.secondary"},children:["Method: ",(0,N.sH)(e.paymentMethod||"OTHER")]})]}),(0,n.jsxs)(a.Z,{sx:{display:"flex",gap:1.25,alignItems:"flex-start",flexWrap:"wrap"},children:[(0,n.jsx)(d.Z,{label:e.status,color:"ACCEPTED"===e.status?"success":"PENDING"===e.status?"warning":"error"}),"PENDING"===e.status&&(0,n.jsxs)(n.Fragment,{children:[(0,n.jsx)(_.Z,{variant:"contained",size:"small",onClick:()=>void g(e.id),children:"Approve"}),(0,n.jsx)(_.Z,{variant:"outlined",color:"error",size:"small",onClick:()=>void v(e.id),children:"Reject"})]})]})]})},e.id))})]})]})})}}},function(e){e.O(0,[143,321,363,297,20,98,630,44,551,774,888,179],function(){return e(e.s=4196)}),_N_E=e.O()}]);