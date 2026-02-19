/**author:Sarbjeet Singh, contact:https://www.sarbzone.com*/

import { BounceLoader } from "react-spinners";







const Loading:React.FC = ()=>{
return(<div style={{height:window.innerHeight, width:window.innerWidth, display:'flex', flexDirection:'column', justifyContent:'center', alignItems:'center'}}>
 
 <BounceLoader size={100}/>
 <div style={{marginTop:30, fontFamily:'Anton', fontSize:30, color:'gray'}}>Loading Model</div>
<div style={{fontFamily:'monospace', textAlign:'center'}}>Developed by<br/>SarbZone</div>
</div>);


}
export default Loading;
