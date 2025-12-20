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
        { href: "/provas", label: "Provas" },
        { href: "/presenca", label: "Presença" },
        { href: "/estatisticas", label: "Estatísticas" },
        { href: "/recompensas", label: "Recompensas" },
    ]

    return (
        <header className="w-full bg-header-bg text-white shadow-md py-4 px-6 lg:px-8">
            <div className="max-w-7xl mx-auto flex items-center justify-between">
                <div className="flex items-center justify-between w-full">
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
                        <button className="bg-[#2DD4BF] hover:bg-[#28BFAA] transition-colors rounded-full px-4 py-2 text-sm font-semibold flex items-center space-x-2 text-header-bg">
                            <span className="material-symbols-outlined text-base">local_fire_department</span>
                            <span>{streak} dias</span>
                        </button>
                        <LogoutButton className="bg-transparent hover:bg-white/10 transition-colors rounded-full px-4 py-2 text-sm font-semibold flex items-center space-x-2 text-white" />
                    </div>

                    {/* Mobile Menu Button */}
                    <button
                        className="md:hidden p-2 text-white"
                        onClick={() => setIsMenuOpen(!isMenuOpen)}
                    >
                        {isMenuOpen ? (
                            <span className="material-symbols-outlined">close</span>
                        ) : (
                            <span className="material-symbols-outlined">menu</span>
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
                        <button className="flex items-center gap-2 bg-[#2DD4BF] text-header-bg font-semibold px-3 py-1 rounded-full text-sm">
                            <span className="material-symbols-outlined text-base">local_fire_department</span>
                            <span>{streak} dias</span>
                        </button>
                        <LogoutButton className="text-white" />
                    </div>
                </div>
            )}
        </header>
    )
}
