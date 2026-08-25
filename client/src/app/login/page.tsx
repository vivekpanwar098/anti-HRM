import LoginForm from "@/features/auth/components/LoginForm";
import Image from "next/image";

export default function LoginPage() {
  return (
    <div className="flex min-h-screen w-full flex-col md:flex-row bg-white">
      <div
        className="relative flex w-full flex-col justify-between overflow-hidden px-8 py-10 text-white md:w-1/2 md:px-14 md:py-12"
        style={{
          backgroundImage:
            "linear-gradient(160deg, rgba(18,84,79,0.88), rgba(18,84,79,0.55) 55%, rgba(18,84,79,0.85)), url('/city-bg.jpg')",
          backgroundSize: "cover",
          backgroundPosition: "center",
        }}
      >
        <div className="grid w-fit grid-cols-4 gap-1.5">
          {Array.from({ length: 12 }).map((_, i) => (
            <span
              key={i}
              className="h-2 w-2 rounded-full bg-[#62FFF3]"
              style={{ opacity: [7, 11].includes(i) || i === 3 ? 0.3 : 0.9 }}
            />
          ))}
        </div>

        <div className="max-w-[460px]">
          <div className="mb-10 flex gap-2">
            <span className="h-[3px] w-16 rounded-sm bg-[#62FFF3]" />
            <span className="h-[3px] w-16 rounded-sm bg-white/35" />
          </div>

          <h1 className="mb-6 font-poppins text-3xl font-bold leading-tight tracking-tight md:text-[2.6rem]">
            Building Better Ventures for a Better Future
          </h1>

          <p className="max-w-[380px] text-base leading-relaxed text-white/85">
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