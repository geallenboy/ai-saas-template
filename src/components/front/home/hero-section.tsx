'use client'

import { Rocket, Sparkles, Star } from 'lucide-react'
import Link from 'next/link'

export default function HeroSection() {
  return (
    <header className="hero-enhanced relative min-h-[80vh] flex items-center justify-center overflow-hidden">
      {/* Dynamic background elements */}
      <div className="absolute inset-0">
        <div className="absolute top-20 left-10 w-96 h-96 bg-blue-400/20 dark:bg-blue-500/10 rounded-full mix-blend-multiply filter blur-3xl animate-float" />
        <div
          className="absolute top-40 right-10 w-80 h-80 bg-purple-400/20 dark:bg-purple-500/10 rounded-full mix-blend-multiply filter blur-3xl animate-float"
          style={{ animationDelay: '1s' }}
        />
        <div
          className="absolute -bottom-8 left-20 w-72 h-72 bg-pink-400/20 dark:bg-pink-500/10 rounded-full mix-blend-multiply filter blur-3xl animate-float"
          style={{ animationDelay: '2s' }}
        />
        <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-gradient-to-r from-blue-400/10 via-purple-400/10 to-pink-400/10 rounded-full filter blur-3xl animate-pulse" />
      </div>

      {/* Grid background */}
      <div className="absolute inset-0 bg-grid-pattern opacity-5 dark:opacity-10" />

      {/* Gradient overlay */}
      <div className="absolute inset-0 bg-gradient-to-br from-white/30 via-transparent to-white/20 dark:from-gray-900/30 dark:via-transparent dark:to-gray-900/20" />

      <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
        <div className="text-center">
          {/* Badge */}
          <div className="inline-flex items-center px-4 py-2 rounded-full bg-white/10 dark:bg-black/20 backdrop-blur-sm border border-white/20 dark:border-white/10 mb-8">
            <Sparkles className="w-4 h-4 mr-2 text-blue-400" />
            <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
              下一代 AI SaaS 平台
            </span>
          </div>

          {/* Main title */}
          <h1 className="text-4xl md:text-6xl lg:text-7xl font-bold mb-6 tracking-tight">
            <span className="text-gradient-improved">
              构建您的 AI SaaS 平台
            </span>
          </h1>

          {/* Subtitle */}
          <p className="text-lg md:text-xl text-gray-600 dark:text-gray-300 max-w-3xl mx-auto mb-12 leading-relaxed">
            生产就绪的全栈模板，集成 Next.js 15、tRPC 和 AI
            功能。立即开始构建您的 SaaS 产品。
          </p>

          {/* Button group */}
          <div className="flex flex-col sm:flex-row gap-6 justify-center items-center mb-16">
            <Link href="/auth/register">
              <button
                type="button"
                className="btn-modern-primary text-lg px-10 py-4 w-full sm:w-auto min-w-[220px] group"
              >
                <Rocket className="w-5 h-5 inline mr-3 group-hover:translate-x-1 transition-transform duration-300" />
                免费开始使用
              </button>
            </Link>
            <Link href="/pricing">
              <button
                type="button"
                className="glass-card-improved px-10 py-4 text-lg font-semibold text-gray-700 dark:text-gray-300 hover:text-blue-600 dark:hover:text-blue-400 transition-all duration-300 w-full sm:w-auto min-w-[220px] group"
              >
                <Star className="w-5 h-5 inline mr-3 group-hover:rotate-12 transition-transform duration-300" />
                查看定价
              </button>
            </Link>
          </div>

          {/* Tech stack showcase */}
          <div className="flex flex-col items-center justify-center gap-6">
            <p className="text-sm text-gray-500 dark:text-gray-400 font-medium">
              现代化技术栈驱动
            </p>
            <div className="flex flex-wrap items-center justify-center gap-6 md:gap-8">
              {/* Next.js */}
              <div className="flex items-center gap-2 px-4 py-2 rounded-lg bg-white/10 dark:bg-black/20 backdrop-blur-sm border border-white/20 dark:border-white/10">
                <svg
                  className="w-6 h-6"
                  viewBox="0 0 24 24"
                  fill="currentColor"
                >
                  <path d="M11.572 0c-.176 0-.31.001-.358.007a19.76 19.76 0 0 1-.364.033C7.443.346 4.25 2.185 2.228 5.012a11.875 11.875 0 0 0-2.119 5.243c-.096.659-.108.854-.108 1.747s.012 1.089.108 1.748c.652 4.506 3.86 8.292 8.209 9.695.779.25 1.6.422 2.534.525.363.04 1.935.04 2.299 0 1.611-.178 2.977-.577 4.323-1.264.207-.106.247-.134.219-.158-.02-.013-.9-1.193-1.955-2.62l-1.919-2.592-2.404-3.558a338.739 338.739 0 0 0-2.422-3.556c-.009-.002-.018 1.579-.023 3.51-.007 3.38-.01 3.515-.052 3.595a.426.426 0 0 1-.206.214c-.075.037-.14.044-.495.044H7.81l-.108-.068a.438.438 0 0 1-.157-.171l-.05-.106.006-4.703.007-4.705.072-.092a.645.645 0 0 1 .174-.143c.096-.047.134-.051.54-.051.478 0 .558.018.682.154.035.038 1.337 1.999 2.895 4.361a10760.433 10760.433 0 0 0 4.735 7.17l1.9 2.879.096-.063a12.317 12.317 0 0 0 2.466-2.163 11.944 11.944 0 0 0 2.824-6.134c.096-.66.108-.854.108-1.748 0-.893-.012-1.088-.108-1.747C19.746 4.347 16.538.561 12.189-.847a11.776 11.776 0 0 0-2.617-.006z" />
                </svg>
                <span className="text-xs font-medium">Next.js</span>
              </div>

              {/* React */}
              <div className="flex items-center gap-2 px-4 py-2 rounded-lg bg-white/10 dark:bg-black/20 backdrop-blur-sm border border-white/20 dark:border-white/10">
                <svg
                  className="w-6 h-6 text-blue-400"
                  viewBox="0 0 24 24"
                  fill="currentColor"
                >
                  <path d="M14.23 12.004a2.236 2.236 0 0 1-2.235 2.236 2.236 2.236 0 0 1-2.236-2.236 2.236 2.236 0 0 1 2.235-2.236 2.236 2.236 0 0 1 2.236 2.236zm2.648-10.69c-1.346 0-3.107.96-4.888 2.622-1.78-1.653-3.542-2.602-4.887-2.602-.41 0-.783.093-1.106.278-1.375.793-1.683 3.264-.973 6.365C1.98 8.917 0 10.42 0 12.004c0 1.59 1.99 3.097 5.043 4.03-.704 3.113-.39 5.588.988 6.38.32.187.69.275 1.102.275 1.345 0 3.107-.96 4.888-2.624 1.78 1.654 3.542 2.603 4.887 2.603.41 0 .783-.09 1.106-.275 1.374-.792 1.683-3.263.973-6.365C22.02 15.096 24 13.59 24 12.004c0-1.59-1.99-3.097-5.043-4.032.704-3.11.39-5.587-.988-6.38-.318-.184-.688-.277-1.092-.278zm-.005 1.09v.006c.225 0 .406.044.558.127.666.382.955 1.835.73 3.704-.054.46-.142.945-.25 1.44-.96-.236-2.006-.417-3.107-.534-.66-.905-1.345-1.727-2.035-2.447 1.592-1.48 3.087-2.292 4.105-2.295zm-9.77.02c1.012 0 2.514.808 4.11 2.28-.686.72-1.37 1.537-2.02 2.442-1.107.117-2.154.298-3.113.538-.112-.49-.195-.964-.254-1.42-.23-1.868.054-3.32.714-3.707.19-.09.4-.127.563-.132zm4.882 3.05c.455.468.91.992 1.36 1.564-.44-.02-.89-.034-1.36-.034-.47 0-.92.014-1.36.034.44-.572.895-1.096 1.36-1.564zM12 8.1c.74 0 1.477.034 2.202.093.406.582.802 1.203 1.183 1.86.372.64.71 1.29 1.018 1.946-.308.655-.646 1.31-1.013 1.95-.38.66-.773 1.288-1.18 1.87-.728.063-1.466.098-2.21.098-.74 0-1.477-.035-2.202-.093-.406-.582-.802-1.204-1.183-1.86-.372-.64-.71-1.29-1.018-1.946.303-.657.646-1.313 1.013-1.954.38-.66.773-1.286 1.18-1.866.728-.064 1.466-.099 2.21-.099zm-3.635.254c-.24.377-.48.763-.704 1.16-.225.39-.435.782-.635 1.174-.265-.656-.49-1.31-.676-1.947.64-.15 1.315-.283 2.015-.386zm7.26 0c.695.103 1.365.23 2.006.387-.18.632-.405 1.282-.66 1.933-.2-.39-.41-.783-.64-1.174-.225-.392-.465-.774-.705-1.146zm3.063.675c.484.15.944.317 1.375.498 1.732.74 2.852 1.708 2.852 2.476-.005.768-1.125 1.74-2.857 2.475-.42.18-.88.342-1.355.493-.28-.958-.646-1.956-1.1-2.98.45-1.017.81-2.01 1.085-2.964zm-13.395.004c.278.96.645 1.957 1.1 2.98-.45 1.017-.812 2.01-1.086 2.964-.484-.15-.944-.318-1.37-.5-1.732-.737-2.852-1.706-2.852-2.474 0-.768 1.12-1.742 2.852-2.476.42-.18.88-.342 1.356-.494zm11.678 4.28c.265.657.49 1.312.676 1.948-.64.157-1.316.29-2.016.39.24-.375.48-.762.705-1.158.225-.39.435-.788.636-1.18zm-9.945.02c.2.392.41.783.64 1.175.23.39.465.772.705 1.143-.695-.102-1.365-.23-2.006-.386.18-.63.406-1.282.66-1.933zM17.92 16.32c.112.493.2.968.254 1.423.23 1.868-.054 3.32-.714 3.708-.147.09-.338.128-.563.128-1.012 0-2.514-.807-4.11-2.28.686-.72 1.37-1.536 2.02-2.44 1.107-.118 2.154-.3 3.113-.54zm-11.83.01c.96.234 2.006.415 3.107.532.66.905 1.345 1.727 2.035 2.446-1.595 1.483-3.092 2.295-4.11 2.295-.22-.005-.406-.05-.553-.132-.666-.38-.955-1.834-.73-3.703.054-.46.142-.944.25-1.438zm4.56.64c.44.02.89.034 1.36.034.47 0 .92-.014 1.36-.034-.44.572-.895 1.095-1.36 1.56-.465-.467-.92-.992-1.36-1.56z" />
                </svg>
                <span className="text-xs font-medium">React</span>
              </div>

              {/* TypeScript */}
              <div className="flex items-center gap-2 px-4 py-2 rounded-lg bg-white/10 dark:bg-black/20 backdrop-blur-sm border border-white/20 dark:border-white/10">
                <svg
                  className="w-6 h-6 text-blue-600"
                  viewBox="0 0 24 24"
                  fill="currentColor"
                >
                  <path d="M1.125 0C.502 0 0 .502 0 1.125v21.75C0 23.498.502 24 1.125 24h21.75c.623 0 1.125-.502 1.125-1.125V1.125C24 .502 23.498 0 22.875 0zm17.363 9.75c.612 0 1.154.037 1.627.111a6.38 6.38 0 0 1 1.306.34v2.458a3.95 3.95 0 0 0-.643-.361 5.093 5.093 0 0 0-.717-.26 5.453 5.453 0 0 0-1.426-.2c-.3 0-.573.028-.819.086a2.1 2.1 0 0 0-.623.242c-.17.104-.3.229-.393.374a.888.888 0 0 0-.14.49c0 .196.053.373.156.529.104.156.252.304.443.444s.423.276.696.41c.273.135.582.274.926.416.47.197.892.407 1.266.628.374.222.695.473.963.753.268.279.472.598.614.957.142.359.214.776.214 1.253 0 .657-.125 1.21-.373 1.656a3.033 3.033 0 0 1-1.012 1.085 4.38 4.38 0 0 1-1.487.596c-.566.12-1.163.18-1.79.18a9.916 9.916 0 0 1-1.84-.164 5.544 5.544 0 0 1-1.512-.493v-2.63a5.033 5.033 0 0 0 3.237 1.2c.333 0 .624-.03.872-.09.249-.06.456-.144.623-.25.166-.108.29-.234.373-.38a1.023 1.023 0 0 0-.074-1.089 2.12 2.12 0 0 0-.537-.5 5.597 5.597 0 0 0-.807-.444 27.72 27.72 0 0 0-1.007-.436c-.918-.383-1.602-.852-2.053-1.405-.45-.553-.676-1.222-.676-2.005 0-.614.123-1.141.369-1.582.246-.441.58-.804 1.004-1.089a4.494 4.494 0 0 1 1.47-.629 7.536 7.536 0 0 1 1.77-.201zm-15.113.188h9.563v2.166H9.506v9.646H6.789v-9.646H3.375z" />
                </svg>
                <span className="text-xs font-medium">TypeScript</span>
              </div>

              {/* Tailwind CSS */}
              <div className="flex items-center gap-2 px-4 py-2 rounded-lg bg-white/10 dark:bg-black/20 backdrop-blur-sm border border-white/20 dark:border-white/10">
                <svg
                  className="w-6 h-6 text-cyan-400"
                  viewBox="0 0 24 24"
                  fill="currentColor"
                >
                  <path d="M12.001,4.8c-3.2,0-5.2,1.6-6,4.8c1.2-1.6,2.6-2.2,4.2-1.8c0.913,0.228,1.565,0.89,2.288,1.624 C13.666,10.618,15.027,12,18.001,12c3.2,0,5.2-1.6,6-4.8c-1.2,1.6-2.6,2.2-4.2,1.8c-0.913-0.228-1.565-0.89-2.288-1.624 C16.337,6.182,14.976,4.8,12.001,4.8z M6.001,12c-3.2,0-5.2,1.6-6,4.8c1.2-1.6,2.6-2.2,4.2-1.8c0.913,0.228,1.565,0.89,2.288,1.624 c1.177,1.194,2.538,2.576,5.512,2.576c3.2,0,5.2-1.6,6-4.8c-1.2,1.6-2.6,2.2-4.2,1.8c-0.913-0.228-1.565-0.89-2.288-1.624 C10.337,13.382,8.976,12,6.001,12z" />
                </svg>
                <span className="text-xs font-medium">Tailwind</span>
              </div>

              {/* PostgreSQL */}
              <div className="flex items-center gap-2 px-4 py-2 rounded-lg bg-white/10 dark:bg-black/20 backdrop-blur-sm border border-white/20 dark:border-white/10">
                <svg
                  className="w-6 h-6 text-blue-500"
                  viewBox="0 0 24 24"
                  fill="currentColor"
                >
                  <path d="M23.111 5.866c-.16-.484-.623-.866-1.111-.866h-3.111c-.488 0-.951.382-1.111.866l-1.556 4.689c-.16.484-.623.866-1.111.866h-2.222c-.488 0-.951-.382-1.111-.866l-1.556-4.689c-.16-.484-.623-.866-1.111-.866h-3.111c-.488 0-.951.382-1.111.866l-4.889 14.667c-.16.484.123.933.611.933h2.222c.488 0 .951-.382 1.111-.866l1.556-4.689c.16-.484.623-.866 1.111-.866h2.222c.488 0 .951.382 1.111.866l1.556 4.689c.16.484.623.866 1.111.866h2.222c.488 0 .951-.382 1.111-.866l4.889-14.667c.16-.484-.123-.933-.611-.933z" />
                </svg>
                <span className="text-xs font-medium">PostgreSQL</span>
              </div>

              {/* Docker */}
              <div className="flex items-center gap-2 px-4 py-2 rounded-lg bg-white/10 dark:bg-black/20 backdrop-blur-sm border border-white/20 dark:border-white/10">
                <svg
                  className="w-6 h-6 text-blue-400"
                  viewBox="0 0 24 24"
                  fill="currentColor"
                >
                  <path d="M13.983 11.078h2.119a.186.186 0 00.186-.185V9.006a.186.186 0 00-.186-.186h-2.119a.185.185 0 00-.185.185v1.888c0 .102.083.185.185.185m-2.954-5.43h2.118a.186.186 0 00.186-.186V3.574a.186.186 0 00-.186-.185h-2.118a.185.185 0 00-.185.185v1.888c0 .102.082.185.185.185m0 2.716h2.118a.187.187 0 00.186-.186V6.29a.186.186 0 00-.186-.185h-2.118a.185.185 0 00-.185.185v1.887c0 .102.082.185.185.186m-2.93 0h2.12a.186.186 0 00.184-.186V6.29a.185.185 0 00-.185-.185H8.1a.185.185 0 00-.185.185v1.887c0 .102.083.185.185.186m-2.964 0h2.119a.186.186 0 00.185-.186V6.29a.185.185 0 00-.185-.185H5.136a.186.186 0 00-.186.185v1.887c0 .102.084.185.186.186m5.893 2.715h2.118a.186.186 0 00.186-.185V9.006a.186.186 0 00-.186-.186h-2.118a.185.185 0 00-.185.185v1.888c0 .102.082.185.185.185m-2.93 0h2.12a.185.185 0 00.184-.185V9.006a.185.185 0 00-.184-.186h-2.12a.185.185 0 00-.184.185v1.888c0 .102.083.185.185.185m-2.964 0h2.119a.185.185 0 00.185-.185V9.006a.185.185 0 00-.184-.186h-2.12a.186.186 0 00-.186.186v1.887c0 .102.084.185.186.185m-2.92 0h2.12a.185.185 0 00.184-.185V9.006a.185.185 0 00-.184-.186h-2.12a.185.185 0 00-.184.185v1.888c0 .102.082.185.185.185M23.763 9.89c-.065-.051-.672-.51-1.954-.51-.338 0-.676.03-1.01.087-.248-1.7-1.653-2.53-1.716-2.566l-.344-.199-.226.327c-.284.438-.49.922-.612 1.43-.23.97-.09 1.882.403 2.661-.595.332-1.55.413-1.744.42H.751a.751.751 0 00-.75.748 11.376 11.376 0 00.692 4.062c.545 1.428 1.355 2.48 2.41 3.124 1.18.723 3.1 1.137 5.275 1.137.983 0 1.938-.089 2.835-.266a11.192 11.192 0 003.090-.142c.94-.4 1.818-.99 2.604-1.75.677-.652 1.248-1.479 1.695-2.454.325-.715.566-1.479.723-2.277.212-1.075.354-2.24.354-3.478V9.89z" />
                </svg>
                <span className="text-xs font-medium">Docker</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </header>
  )
}
