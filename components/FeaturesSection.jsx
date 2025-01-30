const Feature = ({ title, description }) => (
    <div className="p-4 border rounded shadow">
      <h3 className="font-bold">{title}</h3>
      <p>{description}</p>
    </div>
  );
  
  export default function FeaturesSection() {
    return (
      <section className="py-16 bg-gray-100">
        <h2 className="text-center text-2xl font-bold">Features</h2>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mt-8 max-w-6xl mx-auto">
          <Feature title="Search Experiences" description="Find interview insights for specific roles." />
          <Feature title="Rate & Review" description="Share and rate interview experiences." />
          <Feature title="Insights" description="Learn about interview patterns and tips." />
        </div>
      </section>
    );
  }
  