import { useState, useEffect } from "react"
import { Mic, MicOff, MessageSquare, X, Send, User, Bot, Loader2 } from "lucide-react"
import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"
import { usePersona } from "@/contexts/persona-context"
import { aiService } from "@/services/ai-service"

// FAB: Floating Action Button for Voice Assistant
export function VoiceFAB() {
    const [isOpen, setIsOpen] = useState(false)
    const [isListening, setIsListening] = useState(false)
    const [messages, setMessages] = useState<{ role: 'user' | 'assistant', content: string }[]>([])
    const [isLoading, setIsLoading] = useState(false)
    const { currentPersona } = usePersona()

    const toggleAssistant = () => setIsOpen(!isOpen)

    const handleListen = async () => {
        if (!isListening) {
            setIsListening(true)
            // Simulated voice input for demo
            setTimeout(async () => {
                const simulatedInput = "Create a lead for a new warehouse installation"
                setMessages(prev => [...prev, { role: 'user', content: simulatedInput }])
                setIsListening(false)

                setIsLoading(true)
                try {
                    const response = await aiService.getChatResponse(simulatedInput, currentPersona, messages)
                    setMessages(prev => [...prev, { role: 'assistant', content: response.text }])
                } catch (error) {
                    setMessages(prev => [...prev, { role: 'assistant', content: "Mafi kijiye, I encountered an error. Please try again." }])
                } finally {
                    setIsLoading(false)
                }
            }, 2000)
        } else {
            setIsListening(false)
        }
    }

    return (
        <div className="fixed bottom-6 right-6 z-50 flex flex-col items-end gap-4 pointer-events-none">
            {/* Assistant Modal Window - Using Tailwind for transitions */}
            <div
                className={cn(
                    "mb-2 w-96 max-h-[500px] flex flex-col rounded-2xl border bg-card p-4 shadow-2xl transition-all duration-300 origin-bottom-right transform",
                    isOpen
                        ? "opacity-100 scale-100 translate-y-0 visible pointer-events-auto"
                        : "opacity-0 scale-95 translate-y-4 invisible pointer-events-none"
                )}
            >
                <div className="flex items-center justify-between border-b pb-2 mb-4">
                    <div className="flex items-center gap-2">
                        <div className="h-2 w-2 rounded-full bg-green-500 animate-pulse" />
                        <span className="text-sm font-semibold capitalize font-heading">{currentPersona} Assistant</span>
                    </div>
                    <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => setIsOpen(false)}>
                        <X className="h-4 w-4" />
                    </Button>
                </div>

                <div className="flex-1 overflow-y-auto space-y-4 text-sm mb-4 min-h-[200px] pr-2 scrollbar-thin scrollbar-thumb-muted">
                    {messages.length === 0 && (
                        <p className="text-muted-foreground italic text-center mt-20">
                            {isListening ? "Listening..." : "Click the mic to start speaking (Urdu, Punjabi, Sindhi supported)"}
                        </p>
                    )}
                    {messages.map((msg, i) => (
                        <div key={i} className={cn(
                            "flex gap-2 max-w-[85%]",
                            msg.role === 'user' ? "ml-auto flex-row-reverse" : ""
                        )}>
                            <div className={cn(
                                "p-3 rounded-2xl",
                                msg.role === 'user'
                                    ? "bg-primary text-primary-foreground rounded-tr-none"
                                    : "bg-muted rounded-tl-none"
                            )}>
                                {msg.content}
                            </div>
                        </div>
                    ))}
                    {isLoading && (
                        <div className="flex items-center gap-2 text-muted-foreground animate-pulse">
                            <Loader2 className="h-4 w-4 animate-spin" />
                            <span>AI is thinking...</span>
                        </div>
                    )}
                </div>

                <div className="mt-auto flex items-center justify-center gap-4">
                    <Button
                        size="lg"
                        variant={isListening ? "destructive" : "default"}
                        className={cn(
                            "h-16 w-16 rounded-full shadow-lg transition-all",
                            isListening && "animate-pulse ring-4 ring-destructive/20"
                        )}
                        onClick={handleListen}
                        disabled={isLoading}
                    >
                        {isListening ? <MicOff className="h-8 w-8" /> : <Mic className="h-8 w-8" />}
                    </Button>
                </div>
            </div>

            <Button
                size="lg"
                className={cn(
                    "h-14 w-14 rounded-full shadow-2xl transition-all duration-300 pointer-events-auto",
                    isOpen ? "rotate-90 opacity-0 scale-0 invisible" : "scale-100 opacity-100 visible"
                )}
                onClick={toggleAssistant}
            >
                <div className="relative">
                    <MessageSquare className="h-6 w-6" />
                    {messages.length > 0 && !isOpen && (
                        <span className="absolute -top-3 -right-3 flex h-5 w-5 items-center justify-center rounded-full bg-red-500 text-[10px] font-bold text-white">
                            {messages.length}
                        </span>
                    )}
                </div>
            </Button>
        </div>
    )
}
