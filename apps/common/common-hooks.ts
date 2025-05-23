import { useTheme } from "next-themes";
import { useEffect, useMemo, useState } from "react";

/** Used for client-only side rendering. 
 */
export const useIsClient: () => boolean = () => {
    const [isClient, setIsClient] = useState(false);
    useEffect(() => setIsClient(true), [])
    return isClient
}

/** Uses NextJS's theme picker but computes the system preference when the picker value equals "system" 
 */
export const useConstellationTheme: () => "dark" | "light" = () => {
    const { theme } = useTheme()
    const pickedTheme: "dark" | "light" = useMemo(() =>
        theme === "dark" || theme === "light" ? theme :
        window.matchMedia("(prefers-color-scheme: dark)").matches ? "dark" : "light"
    , [theme]);
    return pickedTheme
}
