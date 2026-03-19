"use client"

import Link from "next/link"
import Image from "next/image"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { useEffect, useState, useRef } from "react"
import { supabase } from "@/lib/supabase/client"
import PWAProvider from "@/components/pwa-provider"
import { Heart, Users, Sparkles, ArrowRight } from "lucide-react"
import { User } from '@supabase/supabase-js'

// ... existing code ...
export default function LandingPage() {
  const [user, setUser] = useState<User | null>(null)
  const videoRef = useRef<HTMLVideoElement>(null);
  const [isMuted, setIsMuted] = useState<boolean>(true);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const router = useRouter();

  useEffect(() => {
    const checkAuth = async () => {
      const {
        data: { user },
      } = await supabase.auth.getUser()
      console.log("Supabase user:", user);
      setUser(user)
    }
    checkAuth()

    // Save video time before unload (client-side only)
    const handleBeforeUnload = () => {
      if (typeof window !== 'undefined' && videoRef.current) {
        localStorage.setItem('sitio_mapita_video_time', videoRef.current.currentTime.toString());
      }
    };

    if (typeof window !== 'undefined') {
      window.addEventListener('beforeunload', handleBeforeUnload);
    }

    return () => {
      if (typeof window !== 'undefined') {
        window.removeEventListener('beforeunload', handleBeforeUnload);
      }
    };
  }, [])

  // Video initialization effect
  useEffect(() => {
    const video = videoRef.current;
    if (!video) return;

    const handleVideoLoad = () => {
      console.log("Video element ready");
      // Only try to autoplay if video is paused and not already playing
      if (video.paused && video.readyState >= 3) { // HAVE_FUTURE_DATA
        video.play().catch(err => {
          console.log("Autoplay blocked:", err);
          // Video will play on user interaction - this is expected behavior
        });
      }
    };

    // Load saved video time
    const savedTime = localStorage.getItem('sitio_mapita_video_time');
    if (savedTime) {
      video.currentTime = parseFloat(savedTime);
    }

    // Set up event listeners
    video.addEventListener('loadeddata', handleVideoLoad);
    
    return () => {
      video.removeEventListener('loadeddata', handleVideoLoad);
    };
  }, [])

  const handleVideoClick = async () => {
    if (videoRef.current) {
      const video = videoRef.current;
      
      try {
        if (video.paused) {
          // Only toggle mute when starting to play
          video.muted = false;
          setIsMuted(false);
          await video.play();
        } else {
          video.pause();
          // Mute when pausing to allow autoplay later
          video.muted = true;
          setIsMuted(true);
        }
      } catch (error) {
        console.log("Video play error:", error);
        // Handle AbortError specifically - this happens when play is interrupted
        if (error.name === 'AbortError') {
          console.log("Play request was interrupted, video state:", !video.paused ? 'playing' : 'paused');
        } else if (error.name === 'NotSupportedError') {
          console.log("Video source not supported, checking file...");
        }
      }
    }
  };

  const handleExploreProducts = async () => {
    setIsLoading(true);
    // Simulate loading delay for better UX
    await new Promise(resolve => setTimeout(resolve, 1500));
    router.push('/customer/products');
  };

  return (
    <PWAProvider>
      <div className="min-h-screen flex flex-col bg-white relative">
        {/* Loading Overlay */}
        {isLoading && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
            <div className="bg-white rounded-lg p-8 shadow-xl">
              <div className="flex items-center justify-center">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500"></div>
              </div>
            </div>
          </div>
        )}
        {/* Header */}
        <header className="bg-white border-b border-gray-100 sticky top-0 z-50">
          <nav className="max-w-7xl mx-auto px-4 md:px-6 py-4 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="w-16 h-16 rounded-lg flex items-center justify-center">
                <Image 
                  src="/e-com.png" 
                  alt="E-COM Logo" 
                  width={64} 
                  height={64}
                  className="object-contain"
                />
              </div>
            </div>
            <div className="flex gap-2 md:gap-4">
              {user ? (
                <>
                  <Link href="/customer/products">
                    <Button variant="ghost" className="text-gray-700 hover:text-[#003DA5]">
                      Shop
                    </Button>
                  </Link>
                  <Link href="/protected/dashboard">
                    <Button className="bg-[#003DA5] hover:bg-[#001F3F] text-white">Dashboard</Button>
                  </Link>
                </>
              ) : (
                <>
                  <Link href="/auth">
                    <Button variant="ghost" className="text-gray-700 hover:text-[#003DA5]">
                      Login
                    </Button>
                  </Link>
                  <Link href="/auth">
                    <Button className="bg-[#003DA5] hover:bg-[#001F3F] text-white">Sign Up</Button>
                  </Link>
                </>
              )}
            </div>
          </nav>
        </header>

        {/* Hero Section */}
        <section className="relative py-20 md:py-32 px-4 md:px-6 text-white overflow-hidden bg-[url('/weaving_pattern.svg')] bg-repeat">
          <div className="absolute inset-0 bg-cover bg-center" style={{ backgroundImage: 'url(/community.png)' }}></div>
          <div className="absolute inset-0 bg-gradient-to-b from-background/40 via-background/20 to-transparent"></div>
          <div className="absolute inset-0 bg-gradient-to-r from-background/40 via-background/20 to-background/50"></div>
          <div className="absolute bottom-0 left-0 right-0 h-32 bg-gradient-to-t from-background to-transparent z-10"></div>
          
          
          <div className="max-w-7xl mx-auto relative z-10">
            <div className="grid md:grid-cols-2 gap-12 items-center">
              <div>
                <h1 className="text-5xl md:text-6xl font-bold mb-6 leading-tight text-balance text-[#001F3F]">
                  Handwoven <span className="bg-gradient-to-r from-[#003DA5] to-[#FFB81C] bg-clip-text text-transparent">Traditions</span> of Mapita
                </h1>
                <p className="text-xl text-gray-100 mb-8 leading-relaxed">
                  Discover the rich heritage of Filipino textile weaving. Each piece tells a story of craftsmanship,
                  culture, and community passed down through generations.
                </p>
                <div className="flex flex-col sm:flex-row gap-4">
                  <Button
                    size="lg"
                      className="bg-[#FFB81C] text-[#001F3F] hover:bg-yellow-400 text-base px-8 font-semibold group"
                      onClick={handleExploreProducts}
                      disabled={isLoading}
                    >
                      {isLoading ? (
                        <>
                          <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-2"></div>
                          Loading...
                        </>
                      ) : (
                        <>
                          Explore Products
                          <ArrowRight className="ml-2 w-5 h-5 group-hover:translate-x-1 transition-transform" />
                        </>
                      )}
                    </Button>
                </div>
              </div>
              <div className="hidden md:block relative h-96">
                <video
                  ref={videoRef}
                  loop
                  playsInline
                  muted={isMuted}
                  autoPlay
                  className="w-full h-full object-cover rounded-2xl shadow-2xl cursor-pointer border-2 border-white/20"
                  controls={false}
                  preload="metadata"
                  onClick={handleVideoClick}
                  onError={(e) => {
                    console.log("VIDEO ERROR:", e);
                    const video = e.currentTarget;
                    console.log("Error code:", video.error?.code);
                    console.log("Error message:", video.error?.message);
                  }}
                >
                  <source src="/sitio_mapita.mp4" type="video/mp4" />
                </video>
                {isMuted && (
                  <div className="absolute top-4 right-4 bg-black/50 text-white p-2 rounded-lg">
                    <span className="text-sm">🔇 Click to unmute</span>
                  </div>
                )}
            </div>
          </div>
        </div>
        </section>

        {/* Story Section */}
        <section className="py-20 md:py-28 px-4 md:px-6 bg-gradient-to-b from-gray-50 to-white">
          <div className="max-w-7xl mx-auto">
            <div className="grid md:grid-cols-2 gap-16 items-center">
              <div className="order-1 md:order-2">
                <h2 className="text-4xl md:text-5xl font-bold mb-8 text-[#001F3F] leading-tight text-balance">
                  Weaving Stories, <span className="text-[#FFB81C]">Building</span> Dreams
                </h2>
                <p className="text-lg text-gray-600 mb-8 leading-relaxed">
                  In the heart of Mapita, Aguilar, Pangasinan, our community has preserved the ancient art of textile
                  weaving for generations. Each thread carries the wisdom of our ancestors, each pattern tells a story
                  of our culture, and each piece represents the dedication of our artisans.
                </p>

                <div className="space-y-6">
                  <div className="flex gap-4">
                    <div className="flex-shrink-0">
                      <div className="w-12 h-12 rounded-lg bg-blue-100 flex items-center justify-center">
                        <Heart className="w-6 h-6 text-[#003DA5]" />
                      </div>
                    </div>
                    <div>
                      <h3 className="text-xl font-bold text-[#001F3F] mb-2">Handcrafted with Love</h3>
                      <p className="text-gray-600">
                        Every piece is carefully woven by skilled artisans who pour their heart into preserving
                        traditional techniques.
                      </p>
                    </div>
                  </div>

                  <div className="flex gap-4">
                    <div className="flex-shrink-0">
                      <div className="w-12 h-12 rounded-lg bg-blue-100 flex items-center justify-center">
                        <Users className="w-6 h-6 text-[#003DA5]" />
                      </div>
                    </div>
                    <div>
                      <h3 className="text-xl font-bold text-[#001F3F] mb-2">Community Driven</h3>
                      <p className="text-gray-600">
                        Supporting local weavers and their families in Mapita, creating sustainable livelihoods through
                        cultural heritage.
                      </p>
                    </div>
                  </div>

                  <div className="flex gap-4">
                    <div className="flex-shrink-0">
                      <div className="w-12 h-12 rounded-lg bg-blue-100 flex items-center justify-center">
                        <Sparkles className="w-6 h-6 text-[#003DA5]" />
                      </div>
                    </div>
                    <div>
                      <h3 className="text-xl font-bold text-[#001F3F] mb-2">Authentic Quality</h3>
                      <p className="text-gray-600">
                        Traditional methods passed down through generations ensure each textile is of the highest
                        quality and authenticity.
                      </p>
                    </div>
                  </div>
                </div>
              </div>

              <div className="order-2 md:order-1 relative">
                <img
                  src="/community_artisans.png"
                  alt="Community artisans weaving"
                  className="w-full object-cover rounded-2xl shadow-lg"
                />
              </div>
            </div>
          </div>
        </section>

        {/* Why Choose Section */}
        <section className="py-20 md:py-28 px-4 md:px-6 bg-white">
          <div className="max-w-7xl mx-auto">
            <div className="text-center mb-16">
              <h2 className="text-4xl md:text-5xl font-bold text-[#001F3F] mb-4">Why Choose Mapita?</h2>
              <p className="text-xl text-gray-600 max-w-2xl mx-auto">
                Supporting local artisans and preserving cultural heritage, one thread at a time.
              </p>
            </div>

            <div className="grid md:grid-cols-3 gap-8">
              <Card className="border-2 border-gray-100 hover:border-[#003DA5] transition-colors group">
                <CardContent className="p-8">
                  <div className="w-14 h-14 rounded-lg bg-gradient-to-br from-[#003DA5] to-[#001F3F] flex items-center justify-center mb-6 group-hover:shadow-lg transition-shadow">
                    <span className="text-white text-2xl">🌟</span>
                  </div>
                  <h3 className="text-2xl font-bold text-[#001F3F] mb-3">Premium Quality</h3>
                  <p className="text-gray-600 leading-relaxed">
                    Every textile is crafted using traditional methods and premium materials, ensuring durability and
                    authenticity.
                  </p>
                </CardContent>
              </Card>

              <Card className="border-2 border-gray-100 hover:border-[#003DA5] transition-colors group">
                <CardContent className="p-8">
                  <div className="w-14 h-14 rounded-lg bg-gradient-to-br from-[#003DA5] to-[#001F3F] flex items-center justify-center mb-6 group-hover:shadow-lg transition-shadow">
                    <span className="text-white text-2xl">🚀</span>
                  </div>
                  <h3 className="text-2xl font-bold text-[#001F3F] mb-3">Fast Delivery</h3>
                  <p className="text-gray-600 leading-relaxed">
                    Our efficient courier network ensures your orders arrive quickly and safely, with real-time tracking
                    throughout the journey.
                  </p>
                </CardContent>
              </Card>

              <Card className="border-2 border-gray-100 hover:border-[#003DA5] transition-colors group">
                <CardContent className="p-8">
                  <div className="w-14 h-14 rounded-lg bg-gradient-to-br from-[#003DA5] to-[#001F3F] flex items-center justify-center mb-6 group-hover:shadow-lg transition-shadow">
                    <span className="text-white text-2xl">🔒</span>
                  </div>
                  <h3 className="text-2xl font-bold text-[#001F3F] mb-3">Safe Payment</h3>
                  <p className="text-gray-600 leading-relaxed">
                    Cash on Delivery (COD) only. Pay securely upon receiving your order.
                  </p>
                </CardContent>
              </Card>
            </div>
          </div>
        </section>

        {/* CTA Section */}
        <section className="py-20 md:py-28 px-4 md:px-6 bg-gradient-to-r from-[#003DA5] to-[#001F3F] text-white">
          <div className="max-w-4xl mx-auto text-center">
            <h2 className="text-4xl md:text-5xl font-bold mb-6">Ready to Support Local Artisans?</h2>
            <p className="text-xl text-gray-100 mb-10 leading-relaxed">
              Browse our collection of authentic handwoven textiles and connect with our vibrant Mapita community.
            </p>
            <Button
                size="lg"
                className="bg-[#FFB81C] text-[#001F3F] hover:bg-yellow-400 text-base px-8 font-semibold group"
                onClick={handleExploreProducts}
                disabled={isLoading}
              >
                {isLoading ? (
                  <>
                    <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-2"></div>
                    Loading...
                  </>
                ) : (
                  <>
                    Start Shopping Now
                    <ArrowRight className="ml-2 w-5 h-5 group-hover:translate-x-1 transition-transform" />
                  </>
                )}
              </Button>
          </div>
        </section>

        {/* Footer */}
        <footer className="bg-[#001F3F] text-white py-16 px-4 md:px-6">
          <div className="max-w-7xl mx-auto">
            <div className="grid md:grid-cols-3 gap-12 mb-12">
              <div>
                <div className="flex items-center gap-2 mb-4">
                  <div className="w-16 h-16 rounded-lg flex items-center justify-center bg-white shadow-lg">
                    <Image 
                      src="/e-com.png" 
                      alt="E-COM Logo" 
                      width={60} 
                      height={60}
                      className="object-contain"
                    />
                  </div>
                </div>
                <p className="text-gray-300 text-sm leading-relaxed">
                  Preserving the weaving heritage of Mapita, one thread at a time.
                </p>
              </div>

              <div>
                <h4 className="font-bold text-lg mb-4">Contact</h4>
                <ul className="space-y-2 text-gray-300 text-sm">
                  <li>📍 Sitio of Mapita, Aguilar, Pangasinan</li>
                  <li>📞 +1 (555) 123-4567</li>
                  <li>📧 contact@ecom.com</li>
                </ul>
              </div>

              <div>
                <h4 className="font-bold text-lg mb-4">Follow Us</h4>
                <div className="flex gap-4">
                  <div className="w-10 h-10 bg-gray-700 rounded-lg flex items-center justify-center">
                    <span className="text-white">f</span>
                  </div>
                </div>
              </div>
            </div>

            <div className="border-t border-gray-700 pt-8 text-center text-gray-400 text-sm">
              <p className="mt-2">For educational purposes only, and no copyright infringement is intended.</p>
            </div>
          </div>
        </footer>
      </div>
    </PWAProvider>
  )
}
