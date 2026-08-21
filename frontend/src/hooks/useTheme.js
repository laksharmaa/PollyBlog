import { useEffect,useState } from "react";
import { themeStorage } from "../utils/storage";
export function useTheme(){ const [dark,setDark]=useState(themeStorage.get()==="dark"); useEffect(()=>themeStorage.set(dark?"dark":"light"),[dark]); return {dark,toggleTheme:()=>setDark(v=>!v)}; }
