export default function AdBanner({ text = "Advertisement Space" }: { text?: string }) {
  return (
    <div className="w-full bg-gray-100 border border-gray-200 border-dashed rounded-lg my-8 py-6 flex flex-col items-center justify-center min-h-[120px]">
      <span className="text-gray-400 text-sm font-medium tracking-wide uppercase mb-2">{text}</span>
      <p className="text-gray-500 text-xs">Monetize your app here with Google AdSense or sponsors.</p>
    </div>
  );
}
