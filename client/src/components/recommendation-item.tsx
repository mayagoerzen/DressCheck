interface RecommendationItemProps {
  title: string;
  description: string;
}

export function RecommendationItem({ title, description }: RecommendationItemProps) {
  return (
    <div className="p-4 bg-blue-50 rounded-lg border border-blue-100">
      <div className="flex items-start">
        <div className="bg-primary bg-opacity-10 p-2 rounded-lg mr-3">
          <i className="fas fa-lightbulb text-primary"></i>
        </div>
        <div>
          <h4 className="font-medium">{title}</h4>
          <p className="text-sm text-gray-600 mt-1">{description}</p>
        </div>
      </div>
    </div>
  );
}
