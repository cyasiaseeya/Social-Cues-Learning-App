"use client"

import Link from "next/link"
import { useState } from "react"
import { Button } from "@/components/ui/button"
import { ModeToggle } from "./mode-toggle"
import { Menu, X } from "lucide-react"
import Image from "next/image"
import { useUser } from "@/context/UserContext"
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar"
import { useToast } from "@/components/ui/use-toast"
import { useRouter } from "next/navigation"

export default function Header() {
  const [isMenuOpen, setIsMenuOpen] = useState(false)
  const { user, setUser } = useUser()
  const { toast } = useToast()
  const router = useRouter()

  const handleLogout = () => {
    // 1. 사용자 상태 초기화
    setUser(null)
    
    // 2. 로컬 스토리지 완전 삭제
    if (typeof window !== "undefined") {
      localStorage.clear() // 모든 로컬 스토리지 데이터 삭제
      // 또는 특정 키만 삭제하려면:
      // localStorage.removeItem("user")
      // localStorage.removeItem("token")
    }
    
    // 3. 쿠키 삭제
    document.cookie.split(";").forEach(function(c) { 
      document.cookie = c.replace(/^ +/, "").replace(/=.*/, "=;expires=" + new Date().toUTCString() + ";path=/"); 
    });
    
    // 4. 홈으로 리다이렉트
    window.location.href = "/"
  }

  // 게스트 여부 판별: user?.id === "guest" 또는 user?.name === "게스트"
  const isGuest = user?.id === "guest"

  // 보호된 라우트 클릭 핸들러
  const handleProtectedRoute = (path: string) => {
    if (!user) {
      alert("로그인이 필요합니다. 먼저 로그인 해주세요.")
      return
    }
    router.push(path)
  }

  return (
    <header className="border-b border-gray-100 dark:border-gray-800">
      <div className="container mx-auto px-4 py-4">
        <div className="flex items-center justify-between">
          <Link href="/" className="flex items-center">
            <Image
              src="/logo.png"
              alt="소셜 큐 로고"
              width={60}
              height={60}
              className="rounded-full mr-2"
            />
            <span className="text-2xl font-bold text-pink-600">큐업</span>
          </Link>

          {/* Desktop Navigation */}
          <nav className="hidden md:flex items-center space-x-6">
            <NavLinks handleProtectedRoute={handleProtectedRoute} linkClass="text-gray-700 dark:text-gray-200 hover:text-pink-500 dark:hover:text-pink-400 transition-colors" />
            <div className="flex items-center space-x-2">
              <ModeToggle />
              {!user && (
                <>
                  <Button asChild variant="outline" className="rounded-full">
                    <Link href="/login">로그인</Link>
                  </Button>
                  <Button asChild className="bg-pink-500 hover:bg-pink-600 rounded-full">
                    <Link href="/signup">회원가입</Link>
                  </Button>
                </>
              )}
              {user && (
                <>
                  <Button
                    onClick={handleLogout}
                    className="bg-pink-500 hover:b-pink-600 text-white rounded-full"
                    variant="destructive"
                  >
                    로그아웃
                  </Button>
                  <Link href="/profile">
                    <Avatar className="h-16 w-16">
                      <AvatarImage
                        src="/de_profile.png"
                        alt="프로필"
                      />
                      <AvatarFallback>
                        {isGuest ? "G" : user.name[0]}
                      </AvatarFallback>
                    </Avatar>
                  </Link>
                </>
              )}
            </div>
          </nav>

          {/* Mobile Menu Button */}
          <div className="flex items-center md:hidden">
            <ModeToggle />
            <Button variant="ghost" onClick={() => setIsMenuOpen(!isMenuOpen)} className="rounded-full">
              {isMenuOpen ? <X /> : <Menu />}
            </Button>
          </div>
        </div>

        {/* Mobile Navigation */}
        {isMenuOpen && (
          <nav className="md:hidden py-4">
            <div className="flex flex-col space-y-4">
              <NavLinks handleProtectedRoute={handleProtectedRoute} mobile linkClass="text-gray-700 dark:text-gray-200 hover:text-pink-500 dark:hover:text-pink-400 transition-colors" />
              <div className="flex flex-col space-y-2 pt-4 border-t border-gray-100 dark:border-gray-700">
                {!user && (
                  <>
                    <Button asChild variant="outline" className="rounded-full">
                      <Link href="/login">로그인</Link>
                    </Button>
                    <Button asChild className="bg-pink-300 hover:bg-pink-600 rounded-full">
                      <Link href="/signup">회원가입</Link>
                    </Button>
                  </>
                )}
                {user && (
                  <>
                    <Button
                      onClick={handleLogout}
                      className="bg-pink-500 hover:bg-pink-600 text-white rounded-full"
                      variant="destructive"
                    >
                      로그아웃
                    </Button>
                    <Link href="/profile">
                      <Avatar className="h-16 w-16">
                        <AvatarImage
                          src="/de_profile.png"
                          alt="프로필"
                        />
                        <AvatarFallback>
                          {isGuest ? "G" : user.name[0]}
                        </AvatarFallback>
                      </Avatar>
                    </Link>
                  </>
                )}
              </div>
            </div>
          </nav>
        )}
      </div>
    </header>
  )
}

function NavLinks({
  handleProtectedRoute,
  linkClass,
  mobile = false
}: {
  handleProtectedRoute: (path: string) => void
  linkClass: string
  mobile?: boolean
}) {
  return (
    <>
      <button
        onClick={() => handleProtectedRoute("/scenarios")}
        className={linkClass}
      >
        시나리오
      </button>
      <button
        onClick={() => handleProtectedRoute("/chat")}
        className={linkClass}
      >
        AI 채팅
      </button>
      <button
        onClick={() => handleProtectedRoute("/groupchat")}
        className={linkClass}
      >
        채팅방
      </button>
      <button
        onClick={() => handleProtectedRoute("/community")}
        className={linkClass}
      >
        커뮤니티
      </button>
    </>
  )
}
