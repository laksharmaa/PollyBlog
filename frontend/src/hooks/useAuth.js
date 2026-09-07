import { useCallback, useState } from "react";
import { authStorage } from "../utils/storage";
import { api } from "../services/api";
export function useAuth(){ const [isAuthenticated,setIsAuthenticated]=useState(authStorage.isAuthenticated()); const signIn=useCallback(tokens=>{authStorage.setTokens(typeof tokens === "string" ? { token: tokens } : tokens);setIsAuthenticated(true)},[]); const signOut=useCallback(async()=>{const refreshToken=authStorage.getRefreshToken();try{if(refreshToken)await api("/logout",{method:"POST",body:JSON.stringify({refreshToken}),retry:false})}catch(logoutError){console.warn("Could not revoke the session",logoutError)}finally{authStorage.clear();setIsAuthenticated(false)}},[]); return {isAuthenticated,signIn,signOut}; }
