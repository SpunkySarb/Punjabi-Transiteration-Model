/**author:Sarbjeet Singh, contact:https://www.sarbzone.com*/

import { BarLoader } from "react-spinners";








const TransliterationStatus:React.FC = ()=>{
return(<div style={{position:'absolute',top:200, flexDirection:'column', zIndex:2, width:window.innerWidth, justifyContent:'center', alignItems:'center', display:'flex'}}>
<BarLoader/>
 <div style={{fontFamily:'Anton'}}>TRANSLITERATING</div>
</div>);


}
export default TransliterationStatus;
