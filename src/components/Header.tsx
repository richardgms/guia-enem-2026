"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { useState } from "react"
import { Menu, X, Flame } from "lucide-react"
import { Button } from "@/components/ui/button"
import { LogoutButton } from "@/components/LogoutButton"
import { cn } from "@/lib/utils"

interface HeaderProps {
    streak?: number
}

export function Header({ streak = 0 }: HeaderProps) {
    const [isMenuOpen, setIsMenuOpen] = useState(false)
    const pathname = usePathname()

    const links = [
        { href: "/dashboard", label: "Dashboard" },
        { href: "/calendario", label: "Calendário" },
        { href: "/estatisticas", label: "Estatísticas" },
        { href: "/revisao", label: "Revisão" },
    ]

    return (
        <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
            <div className="container mx-auto px-4 md:px-6">
                <div className="flex h-16 items-center justify-between">
                    <div className="flex items-center gap-2">
                        <Link href="/dashboard" className="flex items-center gap-2">
                            <span className="text-xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                                Guia ENEM 2026
                            </span>
                        </Link>
                    </div>

                    {/* Desktop Nav */}
                    <nav className="hidden md:flex items-center gap-6">
                        {links.map((link) => (
                            <Link
                                key={link.href}
                                href={link.href}
                                className={cn(
                                    "text-sm font-medium transition-colors hover:text-primary",
                                    pathname === link.href
                                        ? "text-primary"
                                        : "text-muted-foreground"
                                )}
                            >
                                {link.label}
                            </Link>
                        ))}
                    </nav>

                    <div className="hidden md:flex items-center gap-4">
                        <div className="flex items-center gap-1 text-orange-500 font-medium bg-orange-50 px-3 py-1 rounded-full border border-orange-100">
                            <Flame className="h-4 w-4 fill-orange-500" />
                            <span className="text-sm">{streak} dias</span>
                        </div>
                        <LogoutButton />
                    </div>

                    {/* Mobile Menu Button */}
                    <button
                        className="md:hidden p-2"
                        onClick={() => setIsMenuOpen(!isMenuOpen)}
                    >
                        {isMenuOpen ? (
                            <X className="h-6 w-6" />
                        ) : (
                            <Menu className="h-6 w-6" />
                        )}
                    </button>
                </div>
            </div>

            {/* Mobile Nav */}
            {isMenuOpen && (
                <div className="md:hidden border-t p-4 space-y-4 bg-background">
                    <nav className="flex flex-col gap-4">
                        {links.map((link) => (
                            <Link
                                key={link.href}
                                href={link.href}
                                onClick={() => setIsMenuOpen(false)}
                                className={cn(
                                    "text-sm font-medium transition-colors hover:text-primary p-2 rounded-md hover:bg-muted",
                                    pathname === link.href
                                        ? "text-primary bg-muted"
                                        : "text-muted-foreground"
                                )}
                            >
                                {link.label}
                            </Link>
                        ))}
                    </nav>
                    <div className="flex items-center justify-between pt-4 border-t">
                        <div className="flex items-center gap-1 text-orange-500 font-medium">
                            <Flame className="h-4 w-4 fill-orange-500" />
                            <span className="text-sm">{streak} dias</span>
                        </div>
                        <LogoutButton />
                    </div>
                </div>
            )}
        </header>
    )
}
