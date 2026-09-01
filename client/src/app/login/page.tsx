import LoginForm from "@/features/auth/components/LoginForm";
import Image from "next/image";

// ⚡ PERF FIX: dot-grid array component ke bahar hoist kiya taaki har
// render pe naya array + opacity calculation dobara na ho
const DOT_COUNT = 12;
const DOT_ITEMS = Array.from({ length: DOT_COUNT }, (_, i) => ({
  key: i,
  opacity: [7, 11].includes(i) || i === 3 ? 0.3 : 0.9,
}));

export default function LoginPage() {
  return (
    <div className="flex min-h-screen w-full flex-col md:flex-row bg-white">
      <div className="relative flex w-full flex-col justify-between overflow-hidden px-8 py-10 text-white md:w-1/2 md:px-14 md:py-12">
        {/* 🔧 FIX: pehle raw CSS backgroundImage se city-bg.jpg load ho rahi thi,
            jo Next.js image optimizer bypass karti thi (slow + heavy load).
            Ab next/image (fill mode) use kiya — auto compress/resize/WebP.
            IMPORTANT: koi negative z-index (-z-10) nahi diya — negative
            z-index se image apne parent ke bhi peeche chali jaati hai
            (stacking context issue) aur poori tarah gayab dikhti hai.
            Ye image ab simple absolute base layer hai (DOM order = peeche). */}
        <Image
          src="/city-bg.jpg"
          alt=""
          fill
          priority
          quality={70}
          sizes="(max-width: 768px) 100vw, 50vw"
          className="absolute inset-0 object-cover"
        />

        {/* 🔧 FIX: gradient overlay ab image ke turant baad, same base layer me */}
        <div
          className="absolute inset-0"
          style={{
            backgroundImage:
              "linear-gradient(160deg, rgba(18,84,79,0.88), rgba(18,84,79,0.55) 55%, rgba(18,84,79,0.85))",
          }}
        />

        {/* 🔧 FIX: saara visible content (dots, heading, features) ab is
            z-10 wrapper ke andar hai, taaki background image/gradient ke
            upar guaranteed render ho — is wajah se hi content pehle dikh
            raha tha lekin image gayab thi */}
        <div className="relative z-10 flex h-full w-full flex-col justify-between">
          <div className="grid w-fit grid-cols-4 gap-1.5">
            {DOT_ITEMS.map((dot) => (
              <span
                key={dot.key}
                className="h-2 w-2 rounded-full bg-[#62FFF3]"
                style={{ opacity: dot.opacity }}
              />
            ))}
          </div>

          <div className="max-w-115">
            <div className="mb-10 flex gap-2">
              <span className="h-0.75 w-16 rounded-sm bg-[#62FFF3]" />
              <span className="h-0.75 w-16 rounded-sm bg-white/35" />
            </div>

            <h1 className="mb-6 font-poppins text-3xl font-bold leading-tight tracking-tight md:text-[2.6rem]">
              Building Better Ventures for a Better Future
            </h1>

            <p className="max-w-95 text-base leading-relaxed text-white/85">
              Empowering ideas, driving growth and creating lasting impact.
            </p>

            <div className="mt-10 flex gap-7">
              <Feature label="Innovation">
                <path d="M9 18h6M10 22h4M12 2a7 7 0 0 0-4 12.7c.6.5 1 1.3 1 2.1v.2h6v-.2c0-.8.4-1.6 1-2.1A7 7 0 0 0 12 2z" />
              </Feature>
              <Feature label="Growth">
                <path d="M3 17l6-6 4 4 8-8M21 7v6M21 7h-6" />
              </Feature>
              <Feature label="Trust">
                <path d="M12 2l8 3v6c0 5-3.5 8.5-8 11-4.5-2.5-8-6-8-11V5l8-3z" />
                <path d="M9 12l2 2 4-4" />
              </Feature>
            </div>
          </div>
        </div>
      </div>

      <div className="flex w-full flex-col items-center justify-center px-6 py-12 md:w-1/2 md:px-12">
        <div className="relative mb-9 text-center">
          <Image
            src="/logo.png"
            alt="Anti Bikli Ventures Pvt. Ltd."
            width={280}
            height={140}
            className="h-[130px] w-auto object-contain"
            priority
          />
          <svg
            className="absolute -right-16 top-10 text-[#18A096] opacity-85"
            width="70"
            height="50"
            viewBox="0 0 70 50"
            fill="none"
          >
            <path
              d="M2 40 Q35 5 65 12"
              stroke="currentColor"
              strokeWidth="1.5"
              strokeDasharray="3 4"
              fill="none"
            />
            <path
              d="M65 12 L58 8 M65 12 L60 18"
              stroke="currentColor"
              strokeWidth="1.5"
              fill="none"
              strokeLinecap="round"
            />
          </svg>
        </div>

        <h2 className="mb-1.5 text-center font-poppins text-2xl font-bold text-black md:text-[1.9rem]">
          Welcome Back!
        </h2>
        <p className="mb-9 text-center text-base text-[#6b6b6e]">
          Sign in to your HRMS account
        </p>

        <LoginForm />
      </div>
    </div>
  );
}

function Feature({
  label,
  children,
}: {
  label: string;
  children: React.ReactNode;
}) {
  return (
    <div className="flex flex-col items-center gap-2.5 text-sm font-medium text-white/90">
      <div className="flex h-14 w-14 items-center justify-center rounded-full border-[1.5px] border-white/60">
        <svg
          viewBox="0 0 24 24"
          fill="none"
          stroke="white"
          strokeWidth="1.8"
          strokeLinecap="round"
          strokeLinejoin="round"
          className="h-6 w-6"
        >
          {children}
        </svg>
      </div>
      <span>{label}</span>
    </div>
  );
}