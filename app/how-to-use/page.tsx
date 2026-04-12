import { AmazonAffiliateProducts } from '@/components/AmazonAffiliateProducts';

export default function HowToUse() {
  return (
    <div className="container mx-auto px-4 sm:px-6 lg:px-8 max-w-7xl min-h-[60vh]" style={{ paddingTop: '8rem', paddingBottom: '4rem' }}>
      <h1 className="text-4xl font-extrabold text-gray-900 mb-6">How to Use Parent Schedule</h1>
      <div className="prose prose-indigo prose-lg text-gray-700 max-w-3xl">
        <ol className="list-decimal pl-5 space-y-4">
          <li><strong>Register an Account:</strong> Click the "Sign Up" button in the top right to create your unique, secure profile.</li>
          <li><strong>Input Court Rules:</strong> Coming soon. Set up dynamic rules like "Every other weekend" or custom schedules for alternating holidays.</li>
          <li><strong>View Your Calendar:</strong> Your dashboard automatically builds a long-term calendar view incorporating your rules to prevent scheduling conflicts.</li>
          <li><strong>Share with Co-Parent:</strong> Optional features to grant read-only access to your co-parent to ensure everyone stays on the same page.</li>
        </ol>
      </div>
      
      <div className="mt-16 pt-12 border-t border-gray-100">
        <AmazonAffiliateProducts variant="grid" title="Organization & Planning Essentials" maxProducts={3} />
      </div>
    </div>
  );
}
