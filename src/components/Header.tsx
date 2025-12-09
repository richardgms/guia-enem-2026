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
        <header className="sticky top-0 z-50 w-full bg-header-bg text-white shadow-md">
            <div className="container mx-auto px-4 md:px-6">
                <div className="flex h-16 items-center justify-between">
                    <div className="flex items-center gap-2">
                        <Link href="/dashboard" className="flex items-center gap-2">
                            <span className="text-xl font-bold text-white">
                                Guia ENEM 2026
                            </span>
                        </Link>
                    </div>

                    {/* Desktop Nav */}
                    <nav className="hidden md:flex items-center gap-8">
                        {links.map((link) => (
                            <Link
                                key={link.href}
                                href={link.href}
                                className={cn(
                                    "text-sm font-semibold pb-2 border-b-2 transition-colors",
                                    pathname === link.href
                                        ? "border-white text-white"
                                        : "border-transparent text-slate-300 hover:border-white/50 hover:text-white"
                                )}
                            >
                                {link.label}
                            </Link>
                        ))}
                    </nav>

                    <div className="hidden md:flex items-center gap-4">
                        <div className="flex items-center gap-2 bg-[#2DD4BF] text-header-bg font-semibold px-4 py-2 rounded-full hover:bg-[#28BFAA] transition-colors text-sm">
                            <Flame className="h-4 w-4 fill-header-bg" />
                            <span>{streak} dias</span>
                        </div>
                        <LogoutButton className="text-white hover:bg-white/10" />
                    </div>

                    {/* Mobile Menu Button */}
                    <button
                        className="md:hidden p-2 text-white"
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
                <div className="md:hidden border-t border-white/10 p-4 space-y-4 bg-header-bg">
                    <nav className="flex flex-col gap-4">
                        {links.map((link) => (
                            <Link
                                key={link.href}
                                href={link.href}
                                onClick={() => setIsMenuOpen(false)}
                                className={cn(
                                    "text-sm font-medium transition-colors p-2 rounded-md hover:bg-white/10 text-slate-300",
                                    pathname === link.href
                                        ? "text-white bg-white/10"
                                        : ""
                                )}
                            >
                                {link.label}
                            </Link>
                        ))}
                    </nav>
                    <div className="flex items-center justify-between pt-4 border-t border-white/10">
                        <div className="flex items-center gap-2 bg-[#2DD4BF] text-header-bg font-semibold px-3 py-1 rounded-full text-sm">
                            <Flame className="h-4 w-4 fill-header-bg" />
                            <span>{streak} dias</span>
                        </div>
                        <LogoutButton className="text-white" />
                    </div>
                </div>
            )}
        </header>
    )
}
