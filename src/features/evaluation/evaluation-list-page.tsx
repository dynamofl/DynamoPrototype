import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";

// Components
import { EvaluationHistoryHeader, EvaluationHistoryTableDirect } from "@/features/ai-system-evaluation/components";
import { EvaluationProgressSidebar } from "./components";

// Types and services
import { EvaluationTestStorage } from "@/features/evaluation/lib/evaluation-test-storage";
import type { EvaluationTest } from "@/features/evaluation/types/evaluation-test";

export function EvaluationListPage() {
  const navigate = useNavigate();

  // State for evaluation tests
  const [evaluationTests, setEvaluationTests] = useState<EvaluationTest[]>([]);
  const [selectedTestForProgress, setSelectedTestForProgress] = useState<EvaluationTest | null>(null);
  const [showProgressSidebar, setShowProgressSidebar] = useState(false);
  const [loading, setLoading] = useState(true);

  // Selection state
  const [selectedRows, setSelectedRows] = useState<string[]>([]);

  // Load evaluation tests on mount
  useEffect(() => {
    const tests = EvaluationTestStorage.loadTests();
    setEvaluationTests(tests);
    setLoading(false);
  }, []);

  const handleViewReport = (test: EvaluationTest) => {
    if (test.result) {
      navigate(`/evaluation-sandbox/${test.id}`);
    }
  };

  const handleViewData = (test: EvaluationTest) => {
    navigate(`/evaluation-sandbox/${test.id}`);
  };

  const handleShowProgress = (test: EvaluationTest) => {
    setSelectedTestForProgress(test);
    setShowProgressSidebar(true);
  };

  const handleTestDetails = (test: EvaluationTest) => {
    navigate(`/evaluation-sandbox/${test.id}`);
  };

  const handleNewEvaluation = () => {
    navigate('/evaluation-sandbox/new');
  };

  // Handle row selection
  const handleRowSelect = (id: string, selected: boolean) => {
    setSelectedRows(prev =>
      selected
        ? [...prev, id]
        : prev.filter(rowId => rowId !== id)
    )
  };

  // Handle select all
  const handleSelectAll = (selected: boolean) => {
    setSelectedRows(selected ? evaluationTests.map(test => test.id) : [])
  };

  return (
    <div className="">
      <main className="mx-auto">
        <div className="space-y-3 py-3">
          {/* Page Header */}
          <EvaluationHistoryHeader
            onNewEvaluation={handleNewEvaluation}
          />

          {/* Evaluation Table */}
          <div className="">
            {!loading && (
              <EvaluationHistoryTableDirect
                data={evaluationTests}
                selectedRows={selectedRows}
                onRowSelect={handleRowSelect}
                onSelectAll={handleSelectAll}
                onViewReport={handleViewReport}
                onViewData={handleViewData}
                onShowProgress={handleShowProgress}
                onTestDetails={handleTestDetails}
              />
            )}
          </div>

          {/* Progress Sidebar */}
          <EvaluationProgressSidebar
            test={selectedTestForProgress}
            open={showProgressSidebar}
            onOpenChange={setShowProgressSidebar}
          />
        </div>
      </main>
    </div>
  );
}