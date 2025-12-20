"use client"

import { useState, useEffect } from "react"

interface MotivationalQuotesProps {
    nomeUsuario: string
}

export function MotivationalQuotes({ nomeUsuario }: MotivationalQuotesProps) {
    const quotes = [
        {
            text: `O mar pode estar agitado, ${nomeUsuario}, mas você é a capitã que sabe navegar até o objetivo! 🌊⛵`,
            icon: "waves"
        },
        {
            text: `Respire fundo, ${nomeUsuario}. Como o canto de uma baleia, sua mente tem um ritmo profundo e poderoso. 🐋✨`,
            icon: "sailing"
        },
        {
            text: `TDAH não é limite, é um jeito diferente de processar o mundo. Vamos no seu tempo, ${nomeUsuario}! 🧠⚡`,
            icon: "psychology"
        },
        {
            text: `Keep on rocking, ${nomeUsuario}! A cada tarefa concluída, você aumenta o volume do seu sucesso! 🎸🤘`,
            icon: "rock_out"
        },
        {
            text: `Um gatinho não desiste de alcançar o topo da estante, e você não vai desistir do ENEM! 🐾🐈`,
            icon: "pets"
        },
        {
            text: `Saboreie sua jornada como um kiwi: doce, refrescante e cheia de energia! 🥝💚`,
            icon: "eco"
        },
        {
            text: `As ondas do conhecimento estão vindo. Mergulhe fundo nessa revisão, ${nomeUsuario}! 🌊📖`,
            icon: "water"
        },
        {
            text: `Sua mente é um oceano vasto. Explore cada lição com a calma de quem ama o azul do mar. 🌊💙`,
            icon: "explore"
        },
        {
            text: `Mesmo com o "barulho" do TDAH, ${nomeUsuario}, você consegue encontrar sua melodia perfeita. 🎸🧠`,
            icon: "music_note"
        },
        {
            text: `Você é resiliente como as baleias que cruzam oceanos. O ENEM é só mais uma travessia! 🐋💪`,
            icon: "directions_boat"
        }
    ]

    const [currentIndex, setCurrentIndex] = useState(0)
    const [isFading, setIsFading] = useState(false)

    useEffect(() => {
        const interval = setInterval(() => {
            setIsFading(true)
            setTimeout(() => {
                setCurrentIndex((prev) => (prev + 1) % quotes.length)
                setIsFading(false)
            }, 500) // Meio segundo para fade out
        }, 10000) // Troca a cada 10 segundos

        return () => clearInterval(interval)
    }, [quotes.length])

    return (
        <div className="bg-gradient-to-br from-blue-50 to-indigo-50 shadow-custom rounded-2xl p-6 border border-blue-100 relative overflow-hidden min-h-[160px] flex items-center">
            {/* Decoração sutil */}
            <div className="absolute -right-4 -bottom-4 opacity-10">
                <span className="material-symbols-outlined text-8xl" style={{ fontFamily: 'Material Symbols Outlined' }}>
                    {quotes[currentIndex].icon}
                </span>
            </div>

            <div className={`transition-opacity duration-500 flex items-start gap-4 ${isFading ? 'opacity-0' : 'opacity-100'}`}>
                <div className="bg-white p-3 rounded-full shadow-sm">
                    <span className="material-symbols-outlined text-blue-600 text-2xl" style={{ fontFamily: 'Material Symbols Outlined' }}>
                        auto_awesome
                    </span>
                </div>
                <div>
                    <p className="text-lg font-medium text-slate-700 leading-relaxed italic">
                        "{quotes[currentIndex].text}"
                    </p>
                </div>
            </div>
        </div>
    )
}
