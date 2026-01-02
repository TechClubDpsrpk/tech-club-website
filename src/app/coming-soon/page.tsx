// app/coming-soon/page.tsx (Create this new file)

export default function ComingSoon() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-black">
      {/* Animated background effects */}
      <div className="absolute inset-0 bg-gradient-to-br from-yellow-500/5 via-black to-yellow-600/5"></div>
      <div className="absolute inset-0">
        <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-yellow-500/10 rounded-full filter blur-3xl animate-pulse"></div>
        <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-yellow-600/10 rounded-full filter blur-3xl animate-pulse delay-1000"></div>
      </div>
      
      <div className="text-center px-4 relative z-10">
        {/* Tech Club Logo/Badge */}
        <div className="mb-12">
          <div className="inline-block relative">
            {/* Animated border */}
            <div className="absolute inset-0 bg-gradient-to-r from-yellow-400 via-yellow-500 to-yellow-600 rounded-2xl blur-sm animate-pulse"></div>
            <div className="relative bg-black px-8 py-4 rounded-2xl border-2 border-yellow-500">
              <img src="/tc-logo.svg" alt="TC Logo" className="w-24 h-24 mb-4" />
            </div>
          </div>
        </div>

        {/* Main heading */}
        <div className="mb-8 home-content">
          <h1 className="text-6xl md:text-8xl font-black mb-6">
            <span className="bg-gradient-to-r from-yellow-400 via-yellow-500 to-yellow-600 bg-clip-text text-transparent">
              Coming Soon.
            </span>
          </h1>
          <div className="flex items-center justify-center gap-2 mb-6">
            <div className="h-px w-16 bg-gradient-to-r from-transparent to-yellow-500"></div>
            <div className="w-2 h-2 bg-yellow-500 rounded-full animate-pulse"></div>
            <div className="h-px w-16 bg-gradient-to-l from-transparent to-yellow-500"></div>
          </div>
        </div>
        
        <p className="text-xl md:text-2xl text-gray-400 mb-12 max-w-2xl mx-auto leading-relaxed">
          We're building something <span className="text-yellow-500 font-semibold">extraordinary</span>.
          <br />
          Stay tuned for an unreal experience.
        </p>
        
        {/* Loading animation */}
        <div className="flex items-center justify-center space-x-3 mb-12">
          <div className="w-3 h-3 bg-yellow-500 rounded-full animate-bounce"></div>
          <div className="w-3 h-3 bg-yellow-500 rounded-full animate-bounce" style={{ animationDelay: '0.1s' }}></div>
          <div className="w-3 h-3 bg-yellow-500 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
        </div>

        {/* Access link */}
        <div className="mt-16">
          <a 
            href="/site-login" 
            className="group inline-flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-yellow-500/10 to-yellow-600/10 hover:from-yellow-500/20 hover:to-yellow-600/20 border border-yellow-500/30 rounded-lg text-yellow-400 hover:text-yellow-300 transition-all duration-300"
          >
            <svg 
              className="w-4 h-4 group-hover:translate-x-1 transition-transform" 
              fill="none" 
              stroke="currentColor" 
              viewBox="0 0 24 24"
            >
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 7a2 2 0 012 2m4 0a6 6 0 01-7.743 5.743L11 17H9v2H7v2H4a1 1 0 01-1-1v-2.586a1 1 0 01.293-.707l5.964-5.964A6 6 0 1121 9z" />
            </svg>
            <span className="text-sm font-medium tracking-wide">Authorized Access</span>
          </a>
        </div>

        {/* Footer text */}
        <div className="mt-16">
          <p className="text-gray-700 text-xs uppercase tracking-widest">
            Powered by Innovation
          </p>
        </div>
      </div>
    </div>
  );
}