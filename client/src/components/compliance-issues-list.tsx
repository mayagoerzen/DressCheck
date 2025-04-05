import { ComplianceCheckResponse } from "@shared/schema";

interface ComplianceIssuesListProps {
  result: ComplianceCheckResponse;
}

export function ComplianceIssuesList({ result }: ComplianceIssuesListProps) {
  const { issues, compliantItems } = result;
  
  return (
    <div className="space-y-4">
      {/* Non-compliant items */}
      {issues.map((issue, index) => (
        <div key={index} className="flex items-start">
          <div className="mt-0.5 bg-red-100 p-1 rounded-full mr-3">
            <i className="fas fa-times text-sm text-danger"></i>
          </div>
          <div>
            <h4 className="font-medium">{issue.item}</h4>
            <p className="text-sm text-gray-600">{issue.description}</p>
          </div>
        </div>
      ))}
      
      {/* Compliant items */}
      {compliantItems.length > 0 && (
        <div className="pt-2 mt-2 border-t border-gray-200">
          <h4 className="font-medium mb-2">Compliant Items:</h4>
          {compliantItems.map((item, index) => (
            <div key={index} className="flex items-start mb-2">
              <div className="mt-0.5 bg-green-100 p-1 rounded-full mr-3">
                <i className="fas fa-check text-sm text-secondary"></i>
              </div>
              <div>
                <p className="text-sm text-gray-600">{item.description}</p>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
