"use client"

import { useState, useRef, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Send, Mic, MicOff } from "lucide-react"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { HfInference } from '@huggingface/inference'

type ChatPartner = {
  id: string
  name: string
  role: string
  avatar: string
}

type Message = {
  id: string
  sender: "user" | "ai"
  text: string
  timestamp: Date
}

const chatPartners: ChatPartner[] = [
  { id: "friend", name: "지민", role: "친구", avatar: "/placeholder.svg?height=100&width=100" },
  { id: "teacher", name: "김선생님", role: "선생님", avatar: "/placeholder.svg?height=100&width=100" },
  { id: "boss", name: "이사장님", role: "사장님", avatar: "/placeholder.svg?height=100&width=100" },
  { id: "colleague", name: "동료 현우", role: "직장 동료", avatar: "/placeholder.svg?height=100&width=100" },
  { id: "parent", name: "어머니", role: "부모님", avatar: "/placeholder.svg?height=100&width=100" },
]

const hf = new HfInference(process.env.NEXT_PUBLIC_HUGGING_FACE_API_KEY)

export default function ChatPage() {
  const [selectedPartner, setSelectedPartner] = useState<ChatPartner>(chatPartners[0])
  const [messages, setMessages] = useState<Message[]>([
    {
      id: "1",
      sender: "ai",
      text: `안녕하세요! 저는 ${chatPartners[0].name}입니다. 오늘 기분이 어떠세요?`,
      timestamp: new Date(),
    },
  ])
  const [input, setInput] = useState("")
  const [isRecording, setIsRecording] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const messagesEndRef = useRef<HTMLDivElement>(null)

  // 메시지가 변경될 때 스크롤 맨 아래로
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" })
  }, [messages])

  const handlePartnerChange = (partnerId: string) => {
    const partner = chatPartners.find((p) => p.id === partnerId) || chatPartners[0]
    setSelectedPartner(partner)

    // 새 파트너의 인사말로 채팅 초기화
    setMessages([
      {
        id: Date.now().toString(),
        sender: "ai",
        text: `안녕하세요! 저는 ${partner.name}입니다. 오늘 기분이 어떠세요?`,
        timestamp: new Date(),
      },
    ])
  }

  const handleSendMessage = async () => {
    if (!input.trim()) return;

    // 사용자 메시지 추가
    const userMessage: Message = {
      id: Date.now().toString(),
      sender: "user",
      text: input,
      timestamp: new Date(),
    };
    setMessages((prev) => [...prev, userMessage]);
    setInput("");
    setIsLoading(true);

    try {
      // 내부 API 엔드포인트로 요청
      const res = await fetch('/api/generate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ input }),
      });
      const data = await res.json();

      const aiMessage: Message = {
        id: (Date.now() + 1).toString(),
        sender: "ai",
        text: data[0]?.generated_text || "응답이 없습니다.",
        timestamp: new Date(),
      };
      setMessages((prev) => [...prev, aiMessage]);
    } catch (error) {
      const errorMessage: Message = {
        id: (Date.now() + 1).toString(),
        sender: "ai",
        text: "죄송합니다. 응답을 생성하는 중에 오류가 발생했습니다.",
        timestamp: new Date(),
      };
      setMessages((prev) => [...prev, errorMessage]);
    } finally {
      setIsLoading(false);
    }
  };

  const toggleRecording = () => {
    setIsRecording(!isRecording)
    // 실제 앱에서는 음성 인식 처리
  }

  const formatTime = (date: Date) => {
    return date.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-6">
        <h1 className="text-3xl font-bold">채팅 연습</h1>
        <p className="text-gray-600 dark:text-gray-300 mt-2">
          다양한 유형의 사람들과 대화를 연습해보세요. 채팅 상대를 선택하고 대화를 시작하세요!
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        {/* 사이드바 */}
        <Card className="lg:col-span-1 rounded-3xl">
          <CardHeader>
            <CardTitle>채팅 상대</CardTitle>
            <CardDescription>대화하고 싶은 상대를 선택하세요</CardDescription>
          </CardHeader>
          <CardContent>
            <Select value={selectedPartner.id} onValueChange={handlePartnerChange}>
              <SelectTrigger className="w-full rounded-full">
                <SelectValue placeholder="채팅 상대 선택" />
              </SelectTrigger>
              <SelectContent className="rounded-2xl">
                {chatPartners.map((partner) => (
                  <SelectItem key={partner.id} value={partner.id}>
                    {partner.name} ({partner.role})
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>

            <div className="mt-6">
              <h3 className="font-medium mb-2">현재 대화 상대:</h3>
              <div className="flex items-center p-3 bg-gray-50 dark:bg-gray-800 rounded-2xl">
                <Avatar className="h-12 w-12 mr-3">
                  <AvatarImage src={selectedPartner.avatar || "/placeholder.svg"} alt={selectedPartner.name} />
                  <AvatarFallback>{selectedPartner.name[0]}</AvatarFallback>
                </Avatar>
                <div>
                  <p className="font-medium">{selectedPartner.name}</p>
                  <p className="text-sm text-gray-500 dark:text-gray-400">{selectedPartner.role}</p>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* 채팅 인터페이스 */}
        <Card className="lg:col-span-3 rounded-3xl">
          <CardHeader>
            <CardTitle>대화</CardTitle>
            <CardDescription>{selectedPartner.name}와(과) 대화 기술을 연습해보세요</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4 h-[500px] overflow-y-auto p-4 border rounded-2xl">
              {messages.map((message) => (
                <div key={message.id} className={`flex ${message.sender === "user" ? "justify-end" : "justify-start"}`}>
                  <div className="flex max-w-[80%]">
                    {message.sender === "ai" && (
                      <Avatar className="h-8 w-8 mr-2 mt-1">
                        <AvatarImage src={selectedPartner.avatar || "/placeholder.svg"} alt={selectedPartner.name} />
                        <AvatarFallback>{selectedPartner.name[0]}</AvatarFallback>
                      </Avatar>
                    )}
                    <div>
                      <div
                        className={`p-3 rounded-2xl ${
                          message.sender === "user" ? "bg-pink-500 text-white" : "bg-gray-100 dark:bg-gray-800"
                        }`}
                      >
                        <p>{message.text}</p>
                      </div>
                      <p className="text-xs text-gray-500 mt-1">{formatTime(message.timestamp)}</p>
                    </div>
                  </div>
                </div>
              ))}
              <div ref={messagesEndRef} />
            </div>
          </CardContent>
          <CardFooter>
            <div className="flex w-full items-center space-x-2">
              <Button
                variant="outline"
                size="icon"
                onClick={toggleRecording}
                className={`rounded-full ${isRecording ? "bg-red-100 text-red-600 dark:bg-red-900 dark:text-red-400" : ""}`}
              >
                {isRecording ? <MicOff className="h-4 w-4" /> : <Mic className="h-4 w-4" />}
              </Button>
              <Textarea
                placeholder="메시지를 입력하세요..."
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "Enter" && !e.shiftKey) {
                    e.preventDefault()
                    handleSendMessage()
                  }
                }}
                className="flex-1 rounded-2xl"
              />
              <Button
                onClick={handleSendMessage}
                disabled={!input.trim() || isLoading}
                className="bg-pink-500 hover:bg-pink-600 rounded-full"
              >
                <Send className="h-4 w-4" />
              </Button>
            </div>
          </CardFooter>
        </Card>
      </div>
    </div>
  )
}
