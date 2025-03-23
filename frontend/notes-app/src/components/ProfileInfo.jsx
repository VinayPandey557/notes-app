import { Link } from "react-router-dom";
import { getInitials } from "../utils/helper";







const ProfileInfo = ({ onLogout }) => {
    
  
    return (
        <div className="flex items-center gap-3">
           <div className="w-12 h-12 flex items-center justify-center rounded-full text-slate-950 font-medium bg-slate-200">
             {getInitials("Monu Pandey")}
           </div>
           <p className="text-sm font-medium">Monu Pandey</p>
           <button className="text-sm text-slate-700 underline hover:text-blue-700" onClick={onLogout}>Logout</button>
        </div>
    )
}


export default ProfileInfo;