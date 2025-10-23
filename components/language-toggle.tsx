"use client"

import { useLocale } from "next-intl"
import { useRouter, usePathname } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Globe } from "lucide-react"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"

export function LanguageToggle() {
  const locale = useLocale()
  const router = useRouter()
  const pathname = usePathname()

  const switchLocale = (newLocale: string) => {
    // Remove current locale from pathname and add new one
    const pathWithoutLocale = pathname.replace(/^\/(en|pt-br)/, "")
    router.push(`/${newLocale}${pathWithoutLocale}`)
  }

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="outline" size="icon">
          <Globe className="h-5 w-5" />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end">
        <DropdownMenuItem onClick={() => switchLocale("en")} className={locale === "en" ? "bg-accent" : ""}>
          🇺🇸 English
        </DropdownMenuItem>
        <DropdownMenuItem onClick={() => switchLocale("pt-br")} className={locale === "pt-br" ? "bg-accent" : ""}>
          🇧🇷 Português (Brasil)
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  )
}
