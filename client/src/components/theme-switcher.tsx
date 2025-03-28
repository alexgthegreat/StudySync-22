import { useTheme } from "@/hooks/use-theme";
import { Button } from "@/components/ui/button";
import { 
  DropdownMenu, 
  DropdownMenuContent, 
  DropdownMenuItem, 
  DropdownMenuTrigger 
} from "@/components/ui/dropdown-menu";
import { 
  Sun, 
  Moon, 
  CloudSun, 
  Palette 
} from "lucide-react";

export function ThemeSwitcher() {
  const { theme, setTheme } = useTheme();

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" size="icon" className="w-9 h-9 rounded-full">
          {theme === 'dark' && <Moon className="h-5 w-5" />}
          {theme === 'ocean' && <CloudSun className="h-5 w-5" />}
          {theme === 'yellow' && <Sun className="h-5 w-5" />}
          {theme === 'default' && <Palette className="h-5 w-5" />}
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end">
        <DropdownMenuItem 
          className="flex items-center gap-2 cursor-pointer" 
          onClick={() => setTheme('default')}
        >
          <Palette className="h-4 w-4" />
          <span>Default</span>
        </DropdownMenuItem>
        <DropdownMenuItem 
          className="flex items-center gap-2 cursor-pointer" 
          onClick={() => setTheme('ocean')}
        >
          <CloudSun className="h-4 w-4" />
          <span>Ocean Blue</span>
        </DropdownMenuItem>
        <DropdownMenuItem 
          className="flex items-center gap-2 cursor-pointer" 
          onClick={() => setTheme('dark')}
        >
          <Moon className="h-4 w-4" />
          <span>Dark Mode</span>
        </DropdownMenuItem>
        <DropdownMenuItem 
          className="flex items-center gap-2 cursor-pointer" 
          onClick={() => setTheme('yellow')}
        >
          <Sun className="h-4 w-4" />
          <span>Sunshine</span>
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}