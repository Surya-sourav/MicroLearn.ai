"use client"

import { useState, useEffect } from "react"
import { Link } from "react-router-dom"
import { Button } from "../components/ui/button"
import { Card, CardContent } from "../components/ui/card"
import { Input } from "../components/ui/input"
import Header from "../components/common/Header"
import Footer from "../components/common/Footer"
import LoginForm from "../components/auth/LoginForm"
import SignupForm from "../components/auth/RegisterForm"
import {
  Play,
  ArrowRight,
  ArrowUpRight,
  ChevronDown,
  Plus,
  Minus,
  Code,
  FileText,
  ImageIcon,
  BarChart3,
  Music,
  Video,
  Grid3X3,
  Check,
} from "lucide-react"

export default function LandingPage() {
  const [isDark, setIsDark] = useState(false)
  const [openFaq, setOpenFaq] = useState<number | null>(null)
  const [isVideoOpen, setIsVideoOpen] = useState(false)
  const [showLogin, setShowLogin] = useState(false)
  const [showSignup, setShowSignup] = useState(false)

  useEffect(() => {
    if (isDark) {
      document.documentElement.classList.add("dark")
    } else {
      document.documentElement.classList.remove("dark")
    }
  }, [isDark])

  const toggleFaq = (index: number) => {
    setOpenFaq(openFaq === index ? null : index)
  }

  return (
    <div className="min-h-screen bg-[#fcfcfc] text-black dark:bg-black dark:text-white">
      <Header isDark={isDark} setIsDark={setIsDark} />

      {/* Auth Modals */}
      {showLogin && <LoginForm onClose={() => setShowLogin(false)} />}
      {showSignup && <SignupForm onClose={() => setShowSignup(false)} />}

      {/* Video Modal */}
      {isVideoOpen && (
        <div className="fixed inset-0 bg-black/50 dark:bg-gray-800/50 z-50 flex items-center justify-center p-4">
          <div className="bg-white dark:bg-[#16171A] rounded-xl p-6 max-w-4xl w-full max-h-[90vh]">
            <div className="flex justify-end mb-4">
              <Button variant="ghost" size="icon" onClick={() => setIsVideoOpen(false)}>
                ×
              </Button>
            </div>
            <div className="aspect-video bg-black rounded-md flex items-center justify-center">
              <Play className="w-16 h-16 text-white" />
            </div>
          </div>
        </div>
      )}

      {/* Hero Section */}
      <section className="relative mt-20 flex min-h-screen w-full flex-col overflow-hidden max-lg:mt-[100px]">
        <div className="relative flex h-full min-h-screen w-full flex-col justify-center gap-6 p-[5%] max-xl:items-center max-lg:p-4">
          {/* Purple gradient background */}
          <div className="absolute left-1/2 -translate-x-1/2 top-[10%] h-[120px] w-[120px] bg-gradient-to-r from-purple-400 to-pink-400 rounded-full blur-3xl opacity-20" />

          <div className="flex flex-col min-h-[60vh] justify-center items-center">
            <h1 className="text-center text-7xl font-semibold uppercase leading-[90px] max-lg:text-4xl max-md:leading-snug">
              <span>All your AI models</span>
              <br />
              <span className="font-thin font-serif">in one place</span>
            </h1>

            <p className="mt-8 max-w-[450px] text-lg max-lg:text-base p-2 text-center text-gray-800 dark:text-white max-lg:max-w-full">
              Your all in one AI companion. generate Images, videos, codes, docs, debug your web apps all with Pixa's
              interface.
            </p>

            <div className="mt-10 max-md:flex-col flex items-center gap-4">
              <Button
                variant="outline"
                className="w-[170px] max-lg:w-[160px] rounded-xl py-4 max-lg:py-2 flex gap-2 group bg-transparent text-black dark:text-white border-black dark:border-white"
                onClick={() => setIsVideoOpen(true)}
              >
                <div className="relative flex items-center justify-center w-6 h-6">
                  <div className="absolute inset-0 scale-0 duration-300 group-hover:scale-100 border-2 border-gray-600 dark:border-gray-200 rounded-full" />
                  <Play className="w-4 h-4 fill-current" />
                </div>
                <span>Watch video</span>
              </Button>

              <Button
                className="w-[170px] max-lg:w-[160px] rounded-xl py-4 max-lg:py-2 group shadow-lg"
                onClick={() => setShowSignup(true)}
              >
                <span>Get started</span>
                <ArrowRight className="w-4 h-4 group-hover:translate-x-1 duration-300" />
              </Button>
            </div>
          </div>

          {/* Dashboard Preview */}
          <div className="relative mt-8 flex w-full justify-center items-center">
            <div className="absolute left-1/2 -translate-x-1/2 top-[5%] h-[200px] w-[200px] bg-gradient-to-r from-purple-400 to-pink-400 rounded-full blur-3xl opacity-20" />

            <Card className="relative max-w-[80%] lg:w-[1024px] lg:h-[650px] max-lg:h-[450px] max-lg:w-full min-w-[320px] md:w-full min-h-[450px] shadow-xl overflow-hidden bg-white dark:bg-black border dark:border-[#36393c]">
              <div className="absolute inset-0 bg-gradient-to-r from-purple-400/10 to-pink-400/10 rounded-xl" />

              <div className="relative w-full h-full p-[2px]">
                <div className="w-full h-full rounded-xl overflow-hidden flex bg-white dark:bg-black">
                  {/* Sidebar */}
                  <div className="min-w-[250px] max-lg:hidden p-2 gap-2 flex flex-col bg-gray-100 dark:bg-[#171717] h-full">
                    <div className="h-[30px] w-fit max-w-[100px]">
                      <img
                        src="https://via.placeholder.com/100x30/6366f1/ffffff?text=PIXA"
                        alt="logo"
                        className="object-contain opacity-80 h-full w-full dark:invert"
                      />
                    </div>

                    <div className="flex mt-2 gap-2 flex-col">
                      <Link to="#" className="flex rounded-sm gap-2 p-2 dark:hover:bg-[#2d2d2ddb] hover:bg-gray-200">
                        <ImageIcon className="w-5 h-5" />
                        <span>Image generator</span>
                      </Link>
                      <Link to="#" className="flex rounded-sm gap-2 p-2 dark:hover:bg-[#2d2d2ddb] hover:bg-gray-200">
                        <FileText className="w-5 h-5" />
                        <span>Pdf generator</span>
                      </Link>
                      <Link to="#" className="flex rounded-sm gap-2 p-2 dark:hover:bg-[#2d2d2ddb] hover:bg-gray-200">
                        <Code className="w-5 h-5" />
                        <span>Code generator</span>
                      </Link>
                    </div>

                    <div className="mt-auto w-full flex px-6 justify-center">
                      <Button
                        variant="outline"
                        className="w-full bg-transparent border-black text-black dark:border-white dark:text-white"
                        onClick={() => setShowSignup(true)}
                      >
                        Signup
                      </Button>
                    </div>
                  </div>

                  {/* Main Content */}
                  <div className="flex w-full p-4 bg-white dark:bg-black h-full flex-col">
                    <div className="relative w-full flex justify-center h-full">
                      <div className="absolute top-[20%] max-lg:top-[30%] left-1/2 -translate-x-1/2 w-[150px] h-[150px]">
                        <img
                          src="https://via.placeholder.com/150x150/6366f1/ffffff?text=PIXA"
                          alt="Pixa logo"
                          className="w-full h-full dark:invert object-contain opacity-20"
                        />
                      </div>

                      <div className="w-full h-full z-10 flex flex-col justify-center">
                        <div className="w-full flex text-center flex-col justify-center">
                          <h2 className="text-4xl max-md:text-2xl max-md:mt-3 opacity-80">Try Prompts</h2>
                          <div className="mt-6 max-md:mt-3">
                            <span>{"What's Pixa playground?"}</span>
                            <span className="animate-pulse">|</span>
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Input Form */}
                    <div className="mt-auto h-[50px] p-1 flex gap-1 w-full rounded-md bg-[#f3f4f6] dark:bg-[#171717]">
                      <div className="min-w-[140px] flex flex-col text-sm gap-1 justify-center p-2">
                        <div className="flex gap-2 items-center">
                          <div className="w-[20px] h-[20px]">
                            <img
                              src="https://via.placeholder.com/20x20/10b981/ffffff?text=GPT"
                              alt="GPT"
                              className="dark:invert"
                            />
                          </div>
                          <span>GPT 4o</span>
                          <ChevronDown className="w-4 h-4 ml-auto" />
                        </div>
                      </div>

                      <Input
                        placeholder="How to develop a saas app?"
                        className="bg-transparent border-none w-full h-full"
                      />

                      <Button size="sm" className="bg-[#6366f1] text-white">
                        <ArrowRight className="w-4 h-4 rotate-90" />
                      </Button>
                    </div>
                  </div>
                </div>
              </div>
            </Card>
          </div>
        </div>
      </section>

      {/* Trusted Brands */}
      <section className="relative flex w-full flex-col justify-center items-center overflow-hidden p-8">
        <h2 className="text-3xl max-md:text-xl">Trusted by brands you love</h2>

        <div className="mt-10 flex w-full gap-5 max-md:gap-2 justify-center">
          {["Google", "Microsoft", "Adobe", "Airbnb", "Stripe", "Reddit"].map((brand) => (
            <div key={brand} className="h-[30px] w-[150px]">
              <img
                src={`https://via.placeholder.com/150x30/6b7280/ffffff?text=${brand}`}
                alt={brand}
                className="h-full w-full object-contain grayscale hover:grayscale-0 transition-all"
              />
            </div>
          ))}
        </div>
      </section>

      {/* Build AI Apps Section */}
      <section className="relative flex w-full min-h-screen max-lg:min-h-[80vh] flex-col justify-center items-center overflow-hidden">
        <div className="w-full justify-center items-center flex flex-col max-w-[900px] gap-4 p-4">
          <div className="absolute right-[20%] top-[20%] h-[200px] w-[200px] bg-gradient-to-r from-purple-400 to-pink-400 rounded-full blur-3xl opacity-20" />

          <h2 className="text-6xl max-lg:text-4xl text-center leading-normal uppercase">
            <span className="font-semibold">Build your own AI Apps</span>
            <br />
            <span className="font-serif">on top of Pixa APIs</span>
          </h2>

          <p className="mt-8 max-w-[650px] text-gray-900 dark:text-gray-200 text-center max-md:text-sm">
            {
              "Pixa's Playground is powered by Pixa's cutting-edge LLM API endpoints. Our powerful models simplify task automation, offering advanced capabilities in summarization, text generation, and Q&A handling."
            }
          </p>

          <div className="flex mt-8">
            <Button
              variant="outline"
              className="shadow-md hover:shadow-xl dark:shadow-gray-800 transition-all duration-300 border border-black dark:border-white bg-transparent"
            >
              Check Pixa APIs
            </Button>
          </div>
        </div>
      </section>

      {/* Features Grid */}
      <section className="relative flex w-full flex-col justify-center items-center overflow-hidden">
        <div className="mt-8 flex flex-col w-full h-full items-center gap-5">
          <div className="mt-5 flex flex-col gap-3 text-center">
            <h2 className="text-6xl font-medium max-md:text-3xl p-2">Experience all the benefits of AI</h2>
          </div>

          <div className="mt-6 flex flex-col max-w-[1150px] max-lg:max-w-full h-full p-4 max-lg:justify-center gap-8">
            <div className="max-xl:flex max-xl:flex-col items-center grid grid-cols-3 gap-8 justify-center">
              {[
                {
                  title: "Unified interface",
                  description:
                    "Our's is the only unified AI Interface tool brings together all your favorite chat models into one seamless platform. No more juggling between different AI systems—easily manage and interact with multiple chatbots from a single interface.",
                  icon: Grid3X3,
                },
                {
                  title: "API Access",
                  description:
                    "Pixa's LLM API offers advanced summarization, text generation, and question-answering. Easily integrate with support for JSON, HTML, Markdown, and plain text, enhancing your applications with powerful language tools.",
                  icon: Code,
                },
                {
                  title: "Pre-built Tools",
                  description:
                    "Pixa offers pre-built AI integrations for diverse creative tasks including image, video, music, and PDF generation, simplifying advanced feature integration into your apps.",
                  icon: Grid3X3,
                },
              ].map((feature, index) => (
                <Card
                  key={index}
                  className="w-[350px] h-[540px] max-md:w-full bg-[#f6f7fb] dark:bg-[#171717] hover:scale-[1.02] transition-transform duration-300"
                >
                  <CardContent className="p-10 gap-5 flex flex-col h-full">
                    <div className="w-full min-h-[180px] h-[180px] overflow-hidden">
                      <img
                        src="https://via.placeholder.com/350x180/8b5cf6/ffffff?text=Feature"
                        alt={feature.title}
                        className="w-full object-contain h-auto"
                      />
                    </div>
                    <h3 className="text-3xl max-md:text-2xl font-medium">{feature.title}</h3>
                    <p className="text-base leading-normal text-gray-800 dark:text-gray-200">{feature.description}</p>
                    <div className="flex items-center gap-2 mt-auto group">
                      <span>Learn more</span>
                      <ArrowRight className="w-4 h-4 group-hover:translate-x-2 transition-transform duration-300" />
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>

            {/* Full width feature */}
            <Card className="w-full md:h-[350px] max-md:min-h-[350px] bg-[#f6f7fb] dark:bg-[#171717] hover:scale-[1.02] transition-transform duration-300">
              <CardContent className="p-10 gap-5 flex max-md:flex-col h-full">
                <div className="text-6xl overflow-hidden rounded-xl w-full h-full max-md:h-[180px]">
                  <img
                    src="https://via.placeholder.com/600x350/3b82f6/ffffff?text=AI+Models"
                    alt="AI models"
                    className="w-full object-contain h-full"
                  />
                </div>
                <div className="flex flex-col gap-4">
                  <h3 className="text-3xl max-md:text-2xl font-medium">Multiple AI models</h3>
                  <p className="leading-normal text-gray-800 dark:text-gray-200">
                    Pixa supports various AI models, including ChatGPT, Gemini, Claude, Mistral and more, providing a
                    range of advanced capabilities for various language and creative tasks.
                  </p>
                  <div className="flex items-center gap-2 mt-auto group">
                    <span>Learn more</span>
                    <ArrowRight className="w-4 h-4 group-hover:translate-x-2 transition-transform duration-300" />
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* Pre-built AI Tools */}
      <section className="relative mt-10 flex min-h-screen w-full flex-col items-center lg:p-6">
        <div className="mt-[5%] flex h-full w-full justify-center gap-2 p-4 max-lg:max-w-full max-lg:flex-col">
          <div className="relative flex max-w-[30%] max-lg:max-w-full flex-col items-start gap-4 p-2 max-lg:items-center max-lg:justify-center max-lg:w-full">
            <div className="top-40 flex flex-col lg:sticky items-center max-h-fit max-w-[850px] max-lg:max-h-fit max-lg:max-w-[320px] overflow-hidden">
              <h2 className="text-5xl font-serif text-center font-medium max-md:text-3xl">Pre-built AI Tools</h2>
              <Button
                variant="outline"
                className="mt-8 bg-transparent text-black border border-black dark:border-white dark:text-white"
                onClick={() => setShowSignup(true)}
              >
                Start Chat
              </Button>
            </div>
          </div>

          <div className="flex flex-col gap-10 h-full max-w-1/2 max-lg:max-w-full px-[10%] max-lg:px-4 max-lg:gap-3 max-lg:w-full lg:top-[20%] items-center">
            {[
              {
                icon: Code,
                title: "AI code generator",
                description:
                  "AI code generation tools to create code from natural language or patterns, streamlining development and improving efficiency.",
              },
              {
                icon: FileText,
                title: "PDF generator",
                description:
                  "Use AI tools to automate PDF creation and content extraction, improving document management and data processing.",
              },
              {
                icon: ImageIcon,
                title: "Image generation",
                description:
                  "Prebuilt AI tools for image generation create visuals from text or patterns, enhancing design and creative projects.",
              },
              {
                icon: BarChart3,
                title: "AI Analytics",
                description:
                  "Our AI analytics tools analyze data patterns and trends, providing actionable insights and enhancing decision-making.",
              },
              {
                icon: Music,
                title: "Music generator",
                description:
                  "Access our AI music generation tools create original compositions from input parameters, enabling effortless music creation for various needs.",
              },
              {
                icon: Video,
                title: "Video generator",
                description:
                  "Use our AI video generation tools create videos from text or templates, streamlining content creation and production.",
              },
            ].map((tool, index) => (
              <Card
                key={index}
                className="h-[240px] w-[450px] max-md:w-full hover:shadow-lg dark:shadow-[#171717] duration-300 transition-all"
              >
                <CardContent className="p-8 gap-8 flex h-full group">
                  <div className="text-4xl max-md:text-2xl">
                    <tool.icon className="w-10 h-10" />
                  </div>
                  <div className="flex flex-col gap-4">
                    <h3 className="text-2xl max-md:text-xl">{tool.title}</h3>
                    <p className="text-gray-800 dark:text-gray-100 max-md:text-sm">{tool.description}</p>
                    <div className="mt-auto flex gap-2 underline underline-offset-4">
                      <span>Learn more</span>
                      <ArrowUpRight className="w-4 h-4 group-hover:-translate-y-1 group-hover:translate-x-1 duration-300 transition-transform" />
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Additional Features */}
      <section className="relative flex w-full min-h-[110vh] max-md:min-h-[80vh] flex-col justify-center items-center overflow-hidden">
        <div className="w-full max-lg:max-w-full justify-center items-center flex flex-col max-w-[80%] gap-4 p-4">
          <h3 className="text-5xl font-medium max-md:text-3xl text-center leading-normal">Additional Features</h3>

          <div className="mt-8 relative gap-10 p-4 grid items-center grid-cols-3 max-lg:flex max-lg:flex-col">
            {[
              {
                title: "Prompt Library",
                description:
                  "Forget about writing your own prompt, use the prompt templates and supercharge your workflow.",
                image: "Prompts",
              },
              {
                title: "Real-time web search",
                description:
                  "Our Real-time web search AI Bot provides instant, live search results directly within the AI chat playground.",
                image: "Search",
              },
              {
                title: "Image Generation",
                description:
                  "Generate Image instantly from multiple models, create visuals from text descriptions or templates.",
                image: "Images",
              },
              {
                title: "History",
                description:
                  "All of the models can recall previous topic, so you can continue your conversation at any point of time.",
                image: "History",
              },
              {
                title: "Import content",
                description:
                  "Effortlessly import PDFs, images, and documents. Use AI to ask questions, extract information, and summarize documents.",
                image: "Import",
              },
              {
                title: "Multilingual support",
                description: "ChatGPT, and Gemini can understand and respond in over 100 languages.",
                image: "Languages",
              },
            ].map((feature, index) => (
              <Card
                key={index}
                className="w-[350px] max-md:w-[320px] border h-[400px] rounded-md items-center p-4 bg-[#f2f3f4] dark:bg-[#141414] dark:border-[#1f2123] flex flex-col gap-3"
              >
                <div className="w-full h-[250px] p-4 rounded-xl backdrop-blur-2xl overflow-hidden flex justify-center">
                  <img
                    src={`https://via.placeholder.com/350x250/6366f1/ffffff?text=${feature.image}`}
                    alt={feature.title}
                    className="w-auto h-full object-contain"
                  />
                </div>
                <h3 className="text-2xl">{feature.title}</h3>
                <p className="text-gray-700 dark:text-gray-300 px-4 text-center text-sm">{feature.description}</p>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Subscription Comparison */}
      <section className="relative flex w-full min-h-screen max-md:min-h-[80vh] flex-col justify-center items-center overflow-hidden">
        <div className="w-full max-lg:max-w-full justify-center items-center flex flex-col max-w-[80%] gap-4 p-4">
          <h3 className="text-5xl font-medium max-md:text-3xl text-center leading-normal">
            One Subscription for it all
          </h3>
          <p className="mt-3 max-w-[600px] text-center">
            Why pay for multiple expensive subscriptions when one subscription can do it all? Access multiple AI models
            and save 1000's of dollar per year.
          </p>

          <div className="mt-8 relative flex max-lg:flex-col gap-5">
            <Card className="flex w-full max-w-[650px] max-md:max-w-full flex-col items-center gap-2 rounded-lg border bg-white dark:bg-[#080808] dark:border-[#1f2123] p-2 shadow-xl max-lg:w-[320px]">
              <img
                src="https://via.placeholder.com/650x300/ef4444/ffffff?text=Multiple+Subscriptions"
                alt="Multi sub"
                className="w-full h-auto object-contain"
              />
            </Card>

            <Card className="flex w-full max-w-[650px] flex-col items-center gap-2 rounded-lg border bg-white dark:bg-[#080808] dark:border-[#1f2123] p-2 shadow-xl max-lg:w-[320px]">
              <img
                src="https://via.placeholder.com/650x300/10b981/ffffff?text=Single+Subscription"
                alt="Single sub"
                className="w-full h-auto object-contain"
              />
            </Card>
          </div>

          <Button className="group shadow-xl flex gap-2 mt-10" onClick={() => setShowSignup(true)}>
            <span>Start Chat</span>
            <ArrowRight className="w-4 h-4 duration-300 group-hover:translate-x-1" />
          </Button>
        </div>
      </section>

      {/* Testimonials */}
      <section className="flex min-h-screen w-full flex-col justify-center items-center p-[2%]">
        <h3 className="text-4xl font-medium text-center max-md:text-2xl">Join the professionals using Pixa</h3>

        <div className="mt-20 gap-10 space-y-8 max-md:columns-1 lg:columns-2 xl:columns-3">
          {[
            {
              name: "Mante",
              company: "Glu, cto",
              text: "Lorem ipsum dolor sit amet consectetur, adipisicing elit. Beatae, vero. Lorem ipsum dolor sit amet consectetur adipisicing elit. Magnam dolore deleniti iusto Numquam!",
            },
            {
              name: "Trich B",
              company: "AMI, ceo",
              text: "Lorem ipsum dolor sit amet consectetur, adipisicing elit. Beatae, vero. Lorem ipsum dolor sit amet.",
            },
            {
              name: "John B",
              company: "Benz, ceo",
              text: "Lorem ipsum dolor sit amet consectetur adipisicing elit. Ea, expedita nihil repellendus accusamus itaque facere labore, suscipit tempore in harum repellat.",
            },
            {
              name: "Ben Alfert B",
              company: "XZ tech, cto",
              text: "Lorem ipsum dolor sit amet consectetur, adipisicing elit. Beatae, vero.",
            },
            {
              name: "Rachel",
              company: "Gem, cto",
              text: "Lorem ipsum dolor sit amet consectetur, adipisicing elit. Beatae, vero. Lorem, ipsum dolor.",
            },
            {
              name: "Jamie",
              company: "SnapFist.ai, ceo",
              text: "Lorem ipsum dolor, sit amet consectetur adipisicing elit. Est, nihil vitae fuga ab reiciendis optio et corporis dolorem alias deserunt.",
            },
          ].map((testimonial, index) => (
            <Card
              key={index}
              className="flex h-fit w-[350px] break-inside-avoid flex-col gap-4 rounded-lg border bg-[#f6f7fb] dark:bg-[#080808] dark:border-[#1f2123] p-4 max-lg:w-[320px]"
            >
              <CardContent className="p-0">
                <div className="flex items-center gap-3">
                  <div className="h-[50px] w-[50px] overflow-hidden rounded-full">
                    <img
                      src={`https://via.placeholder.com/50x50/6366f1/ffffff?text=${testimonial.name.charAt(0)}`}
                      alt={testimonial.name}
                      className="h-full w-full object-cover"
                    />
                  </div>
                  <div className="flex flex-col gap-1">
                    <div className="font-semibold">{testimonial.name}</div>
                    <div className="text-gray-700 dark:text-gray-300">{testimonial.company}</div>
                  </div>
                </div>
                <p className="mt-4 text-gray-800 dark:text-gray-200">{testimonial.text}</p>
              </CardContent>
            </Card>
          ))}
        </div>
      </section>

      {/* Pricing */}
      <section className="mt-5 flex w-full flex-col gap-6 items-center p-[2%]" id="pricing">
        <h3 className="text-5xl font-medium max-md:text-2xl">Choose the right plan for you</h3>

        <div className="mt-10 flex flex-wrap justify-center gap-8 max-lg:flex-col">
          {[
            {
              price: "$9",
              period: "/mo",
              description: "Essential AI tools for everyday use",
              features: [
                "1,000 AI powered chat messages",
                "30 premium image generations",
                "10 premium music generation",
                { text: "Access to all premium AI models", disabled: true },
                { text: "Early access to new features", disabled: true },
              ],
              highlighted: false,
            },
            {
              price: "$17",
              period: "/mo",
              description: "Advanced features for serious AI enthusiasts.",
              features: [
                "5,000 AI powered chat messages",
                "100 premium image generations",
                "40 premium music generation",
                "Access to all premium AI models",
                { text: "Early access to new features", disabled: true },
              ],
              highlighted: true,
            },
            {
              price: "$29",
              period: "/mo",
              description: "Unlimited potential for power users",
              features: [
                "10,000 AI powered chat messages",
                "300 premium image generations",
                "100 premium music generations",
                "Access to all premium AI models",
                "Early access to new features",
              ],
              highlighted: false,
            },
          ].map((plan, index) => (
            <Card
              key={index}
              className={`flex w-[350px] flex-col items-center gap-2 rounded-lg ${plan.highlighted ? "border-2 border-gray-500" : "border"} bg-white dark:bg-[#080808] dark:border-[#1f2123] p-8 shadow-xl max-lg:w-[320px]`}
            >
              <CardContent className="p-0 w-full flex flex-col items-center gap-2">
                <h3>
                  <span className="text-5xl max-md:text-3xl font-semibold">{plan.price}</span>
                  <span className="text-2xl text-gray-600 dark:text-gray-300">{plan.period}</span>
                </h3>
                <p className="mt-3 text-center text-gray-800 dark:text-gray-100">{plan.description}</p>
                <hr className="w-full my-4" />
                <ul className="mt-4 flex flex-col gap-4 text-base text-gray-800 dark:text-gray-200">
                  {plan.features.map((feature, featureIndex) => (
                    <li key={featureIndex} className="flex gap-2">
                      <Check
                        className={`w-5 h-5 ${typeof feature === "object" && feature.disabled ? "text-gray-400 dark:text-gray-500" : ""}`}
                      />
                      <span>{typeof feature === "string" ? feature : feature.text}</span>
                    </li>
                  ))}
                </ul>
                <Button
                  variant={plan.highlighted ? "default" : "outline"}
                  className={`mt-8 w-full transition-transform duration-300 hover:scale-x-[1.02] ${!plan.highlighted ? "text-black bg-transparent border border-black dark:border-white dark:text-white" : ""}`}
                  onClick={() => setShowSignup(true)}
                >
                  Choose plan
                </Button>
              </CardContent>
            </Card>
          ))}
        </div>
      </section>

      {/* FAQ */}
      <section className="relative flex w-full flex-col justify-center items-center gap-[10%] p-[5%] px-[10%]">
        <h3 className="text-4xl font-medium max-md:text-2xl">FAQ</h3>

        <div className="mt-5 flex min-h-[300px] w-full max-w-[850px] flex-col gap-4">
          {[
            {
              question: "What's Pixa playground?",
              answer:
                "Pixa's playground is an integrated webapp to seamlessly test different LLM models such as GPT4, Claude, Gemini, etc.",
            },
            {
              question: "What are LLM?",
              answer:
                'LLM stands for "Large Language Model." It\'s a type of artificial intelligence model trained on vast amounts of text data to understand and generate human-like text.',
            },
            {
              question: "Where can I test different AI models?",
              answer:
                "You can use Pixa's AI Playground to test different models, including GPT4, Claude, Perplexity and more.",
            },
            {
              question: "Is Pixa Free to use?",
              answer: "You can start using PixLab for free, and later upgrade your plan to access all its features.",
            },
          ].map((faq, index) => (
            <div key={index} className="w-full">
              <button
                className="flex w-full select-none text-xl max-md:text-lg justify-between items-center py-4"
                onClick={() => toggleFaq(index)}
              >
                <span>{faq.question}</span>
                {openFaq === index ? (
                  <Minus className="w-5 h-5 transition-transform duration-300" />
                ) : (
                  <Plus className="w-5 h-5 transition-transform duration-300" />
                )}
              </button>
              {openFaq === index && (
                <div className="max-lg:text-sm pb-4 text-gray-700 dark:text-gray-300">{faq.answer}</div>
              )}
              <hr />
            </div>
          ))}
        </div>
      </section>

      {/* CTA Section */}
      <section className="relative flex p-2 w-full min-h-[60vh] flex-col justify-center items-center overflow-hidden">
        <div className="w-full h-full min-h-[450px] max-lg:max-w-full rounded-md lg:py-[5%] bg-[#f6f7fb] dark:bg-[#171717] justify-center items-center flex flex-col max-w-[80%] gap-4 p-4">
          <h3 className="text-5xl font-medium max-md:text-3xl text-center leading-normal">
            Access and compare multiple AI models
          </h3>

          <div className="mt-8 relative flex max-lg:flex-col gap-5">
            <Button className="rounded-full p-4 font-medium" onClick={() => setShowSignup(true)}>
              Launch Playground
            </Button>
          </div>
        </div>
      </section>

      <Footer />
    </div>
  )
}
