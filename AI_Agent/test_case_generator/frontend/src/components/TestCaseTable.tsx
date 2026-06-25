import React from 'react';

interface TestCaseTableProps {
  testCases: any[];
  onUpdateTestCase: (id: string, updated: any) => void;
}

export const TestCaseTable: React.FC<TestCaseTableProps> = ({ testCases, onUpdateTestCase }) => {
  if (!testCases || testCases.length === 0) return null;

  return (
    <div className="bg-card text-card-foreground shadow-sm rounded-lg border border-border mt-6 overflow-hidden">
      <div className="p-4 border-b border-border bg-muted/30">
        <h2 className="text-xl font-semibold">Generated Test Cases ({testCases.length})</h2>
      </div>
      <div className="overflow-x-auto">
        <table className="w-full text-sm text-left">
          <thead className="text-xs text-muted-foreground bg-muted uppercase">
            <tr>
              <th className="px-4 py-3 min-w-[80px]">ID</th>
              <th className="px-4 py-3 min-w-[200px]">Title</th>
              <th className="px-4 py-3 min-w-[120px]">Type</th>
              <th className="px-4 py-3 min-w-[100px]">Priority</th>
              <th className="px-4 py-3 min-w-[250px]">Preconditions</th>
              <th className="px-4 py-3 min-w-[300px]">Steps</th>
              <th className="px-4 py-3 min-w-[250px]">Expected Result</th>
            </tr>
          </thead>
          <tbody>
            {testCases.map((tc, index) => (
              <tr key={index} className="border-b border-border hover:bg-muted/10">
                <td className="px-4 py-3 font-medium">{tc.id}</td>
                <td className="px-4 py-3">
                  <textarea 
                    className="w-full bg-transparent border-0 focus:ring-1 focus:ring-ring rounded p-1 resize-none"
                    defaultValue={tc.title}
                    onBlur={(e) => onUpdateTestCase(tc.id, { ...tc, title: e.target.value })}
                  />
                </td>
                <td className="px-4 py-3">
                  <select 
                    className="bg-transparent border-0 focus:ring-1 focus:ring-ring rounded p-1"
                    defaultValue={tc.type}
                    onChange={(e) => onUpdateTestCase(tc.id, { ...tc, type: e.target.value })}
                  >
                    <option className="bg-card text-foreground">Positive</option>
                    <option className="bg-card text-foreground">Negative</option>
                    <option className="bg-card text-foreground">Edge</option>
                    <option className="bg-card text-foreground">Boundary</option>
                    <option className="bg-card text-foreground">Security</option>
                  </select>
                </td>
                <td className="px-4 py-3">
                  <select 
                    className="bg-transparent border-0 focus:ring-1 focus:ring-ring rounded p-1 font-semibold"
                    defaultValue={tc.priority}
                    onChange={(e) => onUpdateTestCase(tc.id, { ...tc, priority: e.target.value })}
                  >
                    <option className="text-red-500 bg-card">P0</option>
                    <option className="text-orange-500 bg-card">P1</option>
                    <option className="text-yellow-500 bg-card">P2</option>
                    <option className="text-blue-500 bg-card">P3</option>
                  </select>
                </td>
                <td className="px-4 py-3">
                  <textarea 
                    className="w-full bg-transparent border-0 focus:ring-1 focus:ring-ring rounded p-1 resize-y min-h-[60px]"
                    defaultValue={tc.preconditions}
                    onBlur={(e) => onUpdateTestCase(tc.id, { ...tc, preconditions: e.target.value })}
                  />
                </td>
                <td className="px-4 py-3">
                  <textarea 
                    className="w-full bg-transparent border-0 focus:ring-1 focus:ring-ring rounded p-1 resize-y min-h-[100px]"
                    defaultValue={(tc.steps || []).join('\n')}
                    onBlur={(e) => {
                      const newSteps = e.target.value.split('\n').filter(Boolean);
                      onUpdateTestCase(tc.id, { ...tc, steps: newSteps });
                    }}
                  />
                </td>
                <td className="px-4 py-3">
                  <textarea 
                    className="w-full bg-transparent border-0 focus:ring-1 focus:ring-ring rounded p-1 resize-y min-h-[60px]"
                    defaultValue={tc.expected_result}
                    onBlur={(e) => onUpdateTestCase(tc.id, { ...tc, expected_result: e.target.value })}
                  />
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};
