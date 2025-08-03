"use client"
import { useState, useEffect } from "react"

import { Link } from "react-router-dom"
import { Button } from "../components/ui/button"
import { Card } from "../components/ui/card"
import { Input } from "../components/ui/input"
import Header from "../components/common/Header"
import Footer from "../components/common/Footer"

import { GoogleGeminiEffect } from "../components/ui/google-gemini-scroll"
import { TextHoverEffect } from "../components/ui/text-hover-footer"
import { useScroll, useTransform } from "motion/react";
import React from "react"
import {
  Play,
  ArrowRight,
  ChevronDown,
  Plus,
  Minus,
  FileText,
  ImageIcon,
  BrainCogIcon,
  Text,
  BookCheck,
} from "lucide-react"
import { motion } from "motion/react";
import { AuroraBackground } from "../components/ui/aurora-bg"
import { ContainerScroll } from "../components/ui/container-scroll"
import { Sparkles } from "lucide-react";




export default function LandingPage() {
    

  const [isDark, setIsDark] = useState(true)
  const [openFaq, setOpenFaq] = useState<number | null>(null)
  const [isVideoOpen, setIsVideoOpen] = useState(false)

  // const [showSignup, setShowSignup] = useState(false)

    const ref = React.useRef(null);
  const { scrollYProgress } = useScroll({
    target: ref,
    offset: ["start start", "end start"],
  });
const pathLengthFirst = useTransform(scrollYProgress, [0, 0.8], [0.2, 1.2]);
  const pathLengthSecond = useTransform(scrollYProgress, [0, 0.8], [0.15, 1.2]);
  const pathLengthThird = useTransform(scrollYProgress, [0, 0.8], [0.1, 1.2]);
  const pathLengthFourth = useTransform(scrollYProgress, [0, 0.8], [0.05, 1.2]);
  const pathLengthFifth = useTransform(scrollYProgress, [0, 0.8], [0, 1.2]);

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




const features = [
  {
    icon: <BrainCogIcon className="h-6 w-6 text-white" />,
    title: "Auto-Generated Study Materials",
    description: "AI instantly creates targeted flashcards and study guides from your actual course content. Study exactly what your professors expect you to know, automatically extracted from syllabi, lectures, and assignments.",
  },
  {
    icon: <BookCheck className="h-6 w-6 text-white" />,
    title: "Spaced Repetition Scheduling",
    description: "Intelligent review sessions scheduled around your real assignment due dates and exam schedules. Optimize study time when it matters most with AI that knows your academic timeline.",
  },
  {
    icon: <Text className="h-6 w-6 text-white" />,
    title: "Course-Aware AI Tutor",
    description: "Chat with an AI that understands your specific coursework context. Ask questions about lecture PDFs, assignment requirements, or readings with full awareness of your academic progress.",
  },
  {
    icon: <FileText className="h-6 w-6 text-white" />,
    title: "Cross-Course Knowledge Synthesis",
    description: "Connect concepts between related classes automatically. The AI identifies relationships across your coursework, like linking organic chemistry concepts to biochemistry assignments.",
  },
  {
    icon: <Sparkles className="h-6 w-6 text-white" />,
    title: "Seamless LMS Integration",
    description: "Automatically syncs with Google Classroom and Canvas. Transform your LMS from a static repository into an intelligent, personalized AI tutor that imports and organizes all course materials.",
  },
];

  return (
    
    <div className="min-h-screen bg-[#fcfcfc] text-black dark:bg-black dark:text-white">
      <Header isDark={isDark} setIsDark={setIsDark} />

      {/* Auth Modals */}
      {/* {showLogin && <LoginForm onClose={() => setShowLogin(false)} />}
      {showSignup && <SignupForm onClose={() => setShowSignup(false)} />} */}

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
      <AuroraBackground>
      <motion.div
        initial={{ opacity: 0.0, y: 40 }}
        whileInView={{ opacity: 1, y: 0 }}
        transition={{
          delay: 0.3,
          duration: 0.8,
          ease: [0.25, 0.46, 0.45, 0.94],
        }}>
      <section className="relative mt-20 flex min-h-screen w-full flex-col overflow-hidden max-lg:mt-[100px]">
        <div className="relative flex h-full min-h-screen w-full flex-col justify-center gap-6 p-[5%] max-xl:items-center max-lg:p-4">
          {/* Purple gradient background */}
          <div className="absolute left-1/2 -translate-x-1/2 top-[10%] h-[120px] w-[120px] bg-gradient-to-r from-purple-400 to-pink-400 rounded-full blur-3xl opacity-20" />

          <div className="flex flex-col min-h-[60vh] justify-center items-center">
            <h1 className="text-center text-7xl font-semibold uppercase leading-[90px] max-lg:text-4xl max-md:text-3xl whitespace-nowrap bg-clip-text text-transparent bg-gradient-to-br from-indigo-600 via-purple-600 to-pink-600 drop-shadow-2xl">
              Micro Learn
            </h1>

            <p className="mt-8 max-w-[550px] text-lg max-lg:text-base p-2 text-center text-gray-800 dark:text-white max-lg:max-w-full leading-relaxed">
              Transform any content into personalized study materials. Upload documents, videos, or web pages and get AI-generated flashcards, quizzes, and a tutor that understands your learning style.
            </p>

            <div className="mt-10 max-md:flex-col flex items-center gap-4">

              <Link to="https://waitinglist-micro-ai.vercel.app/" target="_blank" rel="noopener noreferrer">
              <Button
                className="w-[170px] max-lg:w-[160px] rounded-xl py-4 max-lg:py-2 group shadow-lg bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 text-white border-0"
              >
                <span>Join Waitlist</span>
                <ArrowRight className="w-4 h-4 group-hover:translate-x-1 duration-300" />
              </Button>
              </Link>
        
            </div>
          </div>
          </div>
          </section>
          </motion.div>
          </AuroraBackground>

        
          {/* Dashboard Preview */}
        <ContainerScroll 
        titleComponent={
          <>
            <h1 className="text-4xl font-semibold text-black dark:text-white text-center max-w-4xl mx-auto">
              Experience the future of <br />
              <span className="text-4xl md:text-[6rem] font-bold mt-1 leading-none bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent">
                AI-Powered Learning
              </span>
            </h1>
            <p className="mt-6 text-lg text-gray-600 dark:text-gray-300 max-w-2xl mx-auto text-center leading-relaxed">
              Eliminate manual study material creation. Our AI automatically generates targeted study content from your actual coursework, optimizing review sessions around your real assignment deadlines and exam schedules.
            </p>
          </>
        }>
         
          < div className="relative mt-8 flex w-full justify-center items-center">
            <div className="absolute left-1/2 -translate-x-1/2 top-[5%] h-[200px] w-[200px] bg-gradient-to-r from-purple-400 to-pink-400 rounded-full blur-3xl opacity-20" />

            <Card className="relative max-w-[80%] lg:w-[1024px] lg:h-[650px] max-lg:h-[450px] max-lg:w-full min-w-[320px] md:w-full min-h-[450px] shadow-xl overflow-hidden bg-white dark:bg-black border dark:border-[#36393c]">
              <div className="absolute inset-0 bg-gradient-to-r from-purple-400/10 to-pink-400/10 rounded-xl" />

              <div className="relative w-full h-full p-[2px]">
                <div className="w-full h-full rounded-xl overflow-hidden flex bg-white dark:bg-black">
                  {/* Sidebar */}
                  <div className="min-w-[250px] max-lg:hidden p-2 gap-2 flex flex-col bg-gray-100 dark:bg-[#171717] h-full">
                    <div className="h-[30px] w-fit max-w-[100px]">
                      <img
                        src="/src/assets/microlearn_logo.png"
                        alt="logo"
                        className="object-contain opacity-80 h-full w-full dark:invert"
                      />
                    </div>

                    <div className="flex mt-2 gap-2 flex-col">
                      <Link to="" className="flex rounded-sm gap-2 p-2 dark:hover:bg-[#2d2d2ddb] hover:bg-gray-200">
                        <ImageIcon className="w-5 h-5" />
                        <span>Flashcards</span>
                      </Link>
                      <Link to="" className="flex rounded-sm gap-2 p-2 dark:hover:bg-[#2d2d2ddb] hover:bg-gray-200">
                        <FileText className="w-5 h-5" />
                        <span>Learning Spaces</span>
                      </Link>
                      <Link to="" className="flex rounded-sm gap-2 p-2 dark:hover:bg-[#2d2d2ddb] hover:bg-gray-200">
                        <Text className="w-5 h-5" />
                        <span>Chat</span>
                      </Link>
                      <Link to="" className="flex rounded-sm gap-2 p-2 dark:hover:bg-[#2d2d2ddb] hover:bg-gray-200">
                        <BrainCogIcon className="w-5 h-5" />
                        <span>AI Tutor</span>
                      </Link>
                       <Link to="" className="flex rounded-sm gap-2 p-2 dark:hover:bg-[#2d2d2ddb] hover:bg-gray-200">
                        <BookCheck className="w-5 h-5" />
                        <span>AI Quizzes</span>
                      </Link>
                    </div>
                    <div className="mt-auto w-full flex px-6 justify-center">
                      <Link to="https://waitinglist-micro-ai.vercel.app/" target="_blank" rel="noopener noreferrer">
                      <Button
                        variant="outline"
                        className="w-full bg-transparent border-indigo-600 text-indigo-600 dark:border-indigo-400 dark:text-indigo-400 hover:bg-indigo-50 dark:hover:bg-indigo-900/20 transition-colors duration-200">
                        Join Waitlist
                      </Button>
                      </Link>
                    </div>
                  </div>

                  {/* Main Content */}
                  <div className="flex w-full p-4 bg-white dark:bg-black h-full flex-col">
                    <div className="relative w-full flex justify-center h-full">
                      <div className="absolute top-[20%] max-lg:top-[30%] left-1/2 -translate-x-1/2 w-[150px] h-[150px]">
                        <img
                          src="/src/assets/microlearn_logo.png"
                          alt="MicroLearn AI"
                          className="w-full h-full dark:invert object-contain opacity-20"
                        />
                      </div>

                      <div className="w-full h-full z-10 flex flex-col justify-center">
                        <div className="w-full flex text-center flex-col justify-center">
                          <h2 className="text-4xl max-md:text-2xl max-md:mt-3 opacity-80">Gateway to AI Learning</h2>
                          <div className="mt-6 max-md:mt-3">
                            <span>{"Ask me anything about your study materials..."}</span>
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
                          <span>__4o</span>
                          <ChevronDown className="w-4 h-4 ml-auto" />
                        </div>
                      </div>

                      <Input
                        placeholder="Explain photosynthesis in simple terms..."
                        className="bg-transparent border-none w-full h-full"
                      />

                    <Link to="https://waitinglist-micro-ai.vercel.app/" target="_blank" rel="noopener noreferrer">
                      <Button size="sm" className="bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 text-white border-0 transition-all duration-200">
                        <ArrowRight className="w-4 h-4 rotate-90" />
                      </Button>
                      </Link>
                    </div>
                  </div>
                </div>
              </div>
            </Card>
          </div>
             <img
          src={`/linear.webp`}
          alt="hero"
          height={720}
          width={1400}
          className="mx-auto rounded-2xl object-cover h-full object-left-top"
          draggable={false}
        />
      </ContainerScroll>

        <div
      className="h-[400vh] bg-black w-full dark:border dark:border-white/[0.1] rounded-md relative pt-40 overflow-clip"
      ref={ref}
    >
      <GoogleGeminiEffect
        pathLengths={[
          pathLengthFirst,
          pathLengthSecond,
          pathLengthThird,
          pathLengthFourth,
          pathLengthFifth,
        ]}
      />
    </div>

    {/* Text Hover Effect */}
      <TextHoverEffect text="M I C R O" />
      {/* Features Carousel */}
  <section className="flex flex-col items-center w-full overflow-hidden py-8">
      <div className="mt-8 text-center p-2">
                 <h2 className="text-6xl font-medium max-md:text-3xl bg-gradient-to-r from-indigo-600 via-purple-600 to-pink-600 bg-clip-text text-transparent drop-shadow-lg p-2">
            Beyond Traditional Study Tools
          </h2>
        <p className="mt-4 text-xl max-md:text-lg text-gray-600 dark:text-gray-300 max-w-3xl mx-auto leading-relaxed">
          Unlike generic AI study tools, MicroLearn.ai eliminates the friction of manual content management by working seamlessly within your existing university systems.
        </p>
      </div>

            <div className="w-full mt-12 px-4">
        <div className="max-w-7xl mx-auto">
          {/* Features Grid - 3 in first row, 2 in second row */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 auto-rows-fr">
            {features.map((feature, idx) => (
              <div
                key={idx}
                className="w-full h-[300px] relative group"
              >
                {/* Neutral bold border */}
                <div className="absolute inset-0 bg-gradient-to-br from-gray-700 to-gray-900 dark:from-gray-600 dark:to-gray-800 rounded-2xl p-[4px] shadow-2xl hover:shadow-3xl transition-all duration-300">
                  <div className="w-full h-full bg-gradient-to-br from-white to-gray-50 dark:from-gray-900 dark:to-gray-800 rounded-xl p-6 flex flex-col group-hover:scale-[1.02] transition-all duration-300">
                    <div className="flex items-center justify-center w-14 h-14 bg-gradient-to-br from-gray-700 to-gray-900 dark:from-gray-600 dark:to-gray-800 rounded-2xl mb-4 shadow-lg group-hover:scale-110 transition-transform duration-300">
                      <div className="text-white">
                        {feature.icon}
                      </div>
                    </div>
                    <h3 className="text-2xl font-bold mb-3 bg-gradient-to-r from-gray-800 to-gray-600 dark:from-white dark:to-gray-200 bg-clip-text text-transparent">
                      {feature.title}
                    </h3>
                    <p className="text-gray-700 dark:text-gray-300 leading-relaxed flex-grow text-sm">
                      {feature.description}
                    </p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>




     
      {/* Additional Features */}
      {/* <section className="relative flex w-full min-h-[110vh] max-md:min-h-[80vh] flex-col justify-center items-center overflow-hidden">
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
      </section> */}






      {/* Pricing */}
      {/* <section className="mt-5 flex w-full flex-col gap-6 items-center p-[2%]" id="pricing">
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
      </section> */}

      {/* FAQ */}
      <section className="relative flex w-full flex-col justify-center items-center gap-[10%] p-[5%] px-[10%]">
        <div className="text-center">
          <h3 className="text-5xl font-medium max-md:text-3xl bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent">
            Frequently Asked Questions
          </h3>
          <p className="mt-4 text-lg text-gray-600 dark:text-gray-300 max-w-2xl mx-auto leading-relaxed">
            We've got answers. Learn more about how MicroLearn AI can transform your learning experience.
          </p>
        </div>

        <div className="mt-5 flex min-h-[300px] w-full max-w-[850px] flex-col gap-4">
          {[
            {
              question: "What makes MicroLearn AI different from other learning platforms?",
              answer:
                "MicroLearn AI stands out through its comprehensive AI-powered approach to personalized learning. Unlike traditional platforms, we automatically transform any content—PDFs, videos, web pages—into interactive study materials. Our AI doesn't just create flashcards; it understands your learning patterns, adapts difficulty levels, provides 24/7 tutoring, and organizes everything in intelligent learning spaces. It's like having a personal tutor, study organizer, and content creator all in one.",
            },
            {
              question: "How does the AI understand and process my study materials?",
              answer:
                "Our advanced AI uses state-of-the-art natural language processing and machine learning algorithms to analyze your content. It identifies key concepts, relationships between ideas, important definitions, and creates comprehensive knowledge maps. The AI then generates targeted questions, explanations, and study materials based on proven learning science principles like spaced repetition and active recall.",
            },
            {
              question: "What file formats and content sources are supported?",
              answer:
                "MicroLearn AI supports a wide range of formats: PDFs, Word documents (.docx), PowerPoint presentations, text files, YouTube videos (we extract transcripts), web articles, and direct text input. Simply upload your files or paste URLs, and our AI will intelligently extract and process the educational content, regardless of the source format.",
            },
            {
              question: "How does the pricing work? Is there a free version?",
              answer: "We're currently in development and building our community through a waitlist. Early access members will get exclusive benefits and special pricing when we launch. Join our waitlist to be notified about beta access, pricing plans, and to secure your spot among the first users to experience next-generation AI learning.",
            },
            {
              question: "How secure is my data and study materials?",
              answer: "Data security and privacy are our top priorities. All uploaded content is encrypted both in transit and at rest. We use enterprise-grade security measures and never share your personal study materials with third parties. Your learning data belongs to you, and you maintain full control over your content and can export or delete it at any time.",
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
        <div className="w-full h-full min-h-[450px] max-lg:max-w-full rounded-2xl lg:py-[5%] bg-gradient-to-br from-indigo-50 to-purple-50 dark:from-gray-900 dark:to-indigo-900 border border-indigo-100 dark:border-indigo-800 justify-center items-center flex flex-col max-w-[80%] gap-6 p-8 relative overflow-hidden">
          {/* Background decorative elements */}
          <div className="absolute top-10 left-10 w-20 h-20 bg-indigo-200 dark:bg-indigo-700 rounded-full blur-xl opacity-50" />
          <div className="absolute bottom-10 right-10 w-32 h-32 bg-purple-200 dark:bg-purple-700 rounded-full blur-xl opacity-50" />
          
          <div className="text-center z-10">
            <h3 className="text-5xl font-medium max-md:text-3xl text-center leading-normal bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent">
              Ready to Transform Your Learning?
            </h3>
            <p className="mt-4 text-xl max-md:text-lg text-gray-700 dark:text-gray-300 max-w-2xl mx-auto leading-relaxed">
              Join learners who are already experiencing the future of AI-powered education. Be among the first to access MicroLearn AI when we launch.
            </p>
          </div>

          <div className="mt-8 relative flex max-lg:flex-col gap-5 z-10">
            <Link to="https://waitinglist-micro-ai.vercel.app/" target="_blank" rel="noopener noreferrer">
              <Button className="rounded-xl px-8 py-4 text-lg font-medium bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 text-white shadow-lg hover:shadow-xl transition-all duration-300 group">
                Join the Waitlist
                <ArrowRight className="w-5 h-5 ml-2 group-hover:translate-x-1 transition-transform duration-300" />
              </Button>
            </Link>
          </div>
          
          <div className="mt-6 text-center z-10">
            <p className="text-sm text-gray-600 dark:text-gray-400">
              🎉 Early access • 🚀 Exclusive features • 💝 Special pricing
            </p>
          </div>
        </div>
      </section>

      <Footer />
    </div>
  )
}
