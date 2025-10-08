"use client";

export default function AuthenticateLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex w-full h-screen justify-center">
      <div className="w-3/4 flex justify-center items-center">{children}</div>
    </div>
  );
}
