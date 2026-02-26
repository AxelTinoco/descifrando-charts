import Image from "next/image";

export default function ThankYouView() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-[#232323]">
      <div className="text-center max-w-md px-6">
        <Image
          src="/icons/Logo.png"
          alt="Logo"
          width={180}
          height={180}
          className="mx-auto mb-8"
        />
        <h1 className="text-3xl leading-relaxed text-white  mb-2">
          Te mereces un buen café.
        </h1>
        <p className="text-gray-500 text-base">
          ¡Muchas gracias por participar!
        </p>
      </div>
    </div>
  );
}
