import { useCallback, useState } from "react";
import { authStorage } from "../utils/storage";
export function useAuth(){ const [isAuthenticated,setIsAuthenticated]=useState(authStorage.isAuthenticated()); const signIn=useCallback(tokens=>{authStorage.setTokens(typeof tokens === "string" ? { token: tokens } : tokens);setIsAuthenticated(true)},[]); const signOut=useCallback(()=>{authStorage.clear();setIsAuthenticated(false)},[]); return {isAuthenticated,signIn,signOut}; }
