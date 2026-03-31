export default function About() {
  return (
    <div className="container mx-auto px-4 sm:px-6 lg:px-8 max-w-7xl min-h-[60vh]" style={{ paddingTop: '8rem', paddingBottom: '4rem' }}>
      <h1 className="text-4xl font-extrabold text-gray-900 mb-6">About Us</h1>
      <p className="text-lg text-gray-700 leading-relaxed max-w-3xl">
        This app was originally created as a personal tool to manage the complexities of court-ordered 
        parenting schedules. Every set of parents has unique rules, and generic calendar apps often 
        fail to capture the repeating nuances of shared custody, holidays, and drop-off times.
      </p>
      <p className="text-lg text-gray-700 leading-relaxed max-w-3xl mt-4">
        Recognizing that many other parents share this exact struggle, Parent Schedule is now 
        available to everyone. Our goal is to simply reduce friction and make planning as smooth as possible.
      </p>
    </div>
  );
}
