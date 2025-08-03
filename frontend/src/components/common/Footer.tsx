<<<<<<< HEAD
import { Link } from "react-router-dom"



=======
>>>>>>> 6c3050b (Footer Linkedin + Logo)

import { SocialIcon } from "../ui/social-icon";
import { LinkedInIcon } from "../icons/linkedin-icon";


export default function Footer() {
  return (
    <>
      {/* Newsletter */}
      {/* <section className="flex w-full flex-col justify-center items-center gap-[10%] p-[5%] px-[10%] max-md:px-2">
        <div  className="h-[40rem] flex items-center justify-center text-xs">
      <TextHoverEffect text="Micro.ai" />
    </div>
      </section> */}

      {/* Footer */}
      <footer className="mt-auto flex flex-col w-full gap-4 text-sm pt-[5%] pb-10 px-[10%] text-black dark:text-white max-md:flex-col">
        <div className="flex max-md:flex-col max-md:gap-6 gap-3 w-full justify-around">
          <div className="flex h-full w-[400px] flex-col items-center gap-6 max-md:w-full">
            <div className="w-full items-center flex flex-col gap-6">
              <img
                src="/src/assets/microlearn_logo.png"
                alt="logo"
                className="max-w-[120px] dark:invert"
              />
              <div className="max-w-[120px] text-center text-xl h-fit">M I C R O</div>
            </div>
            <div className="text-center">
          <div className="inline-flex items-center justify-center space-x-3 px-6 py-3 rounded-full bg-muted/30 backdrop-blur-sm">
            <span className="text-sm text-muted-foreground">Built with</span>
            <span className="text-red-500">❤️</span>
            <span className="text-sm text-muted-foreground">by</span>
            <div className="flex items-center space-x-1">
              <SocialIcon
                href="https://www.linkedin.com/in/suryaparida/"
                target="_blank"
                rel="noopener noreferrer"
                aria-label="Surya's LinkedIn"
                icon={<LinkedInIcon className="w-4 h-4" />}
              />
              <span className="text-sm font-medium text-foreground">Surya</span>
            </div>
            <span className="text-muted-foreground/70">&</span>
            <div className="flex items-center space-x-1">
              <SocialIcon
                href="https://www.linkedin.com/in/utkarshlal/"
                target="_blank"
                rel="noopener noreferrer"
                aria-label="Utkarsh's LinkedIn"
                icon={<LinkedInIcon className="w-4 h-4" />}
              />
              <span className="text-sm font-medium text-foreground">Utkarsh</span>
            </div>
          </div>
        </div>



            {/* <div className="flex gap-4 text-lg">
              <Link to="https://www.linkedin.com/in/suryaparida/" aria-label="LinkedIn">
                <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433c-1.144 0-2.063-.926-2.063-2.065 0-1.138.92-2.063 2.063-2.063 1.14 0 2.064.925 2.064 2.063 0 1.139-.925 2.065-2.064 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z" />
                </svg>
              </Link>
              <div>
                |
              </div>
              <Link to="https://www.linkedin.com/in/utkarshlal/" aria-label="LinkedIn">
                <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433c-1.144 0-2.063-.926-2.063-2.065 0-1.138.92-2.063 2.063-2.063 1.14 0 2.064.925 2.064 2.063 0 1.139-.925 2.065-2.064 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z" />
                </svg>
              </Link>
            </div> */}
          </div>
        </div>

        <hr className="mt-8" />

        <div className="mt-2 flex gap-2 flex-col text-gray-700 dark:text-gray-300 items-center text-[12px] w-full text-center justify-around">
          <span>Copyright ©2025</span>
          <span>Build with ❤️ for learners</span>
        </div>
      </footer>
    </>
  )
}
