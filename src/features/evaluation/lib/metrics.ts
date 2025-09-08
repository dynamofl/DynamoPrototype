export interface MetricToggles {
  accuracy: boolean;
  precision: boolean;
  recall: boolean;
}

export interface MetricsResult {
  accuracy?: number;
  precision?: number;
  recall?: number;
}

export function computeMetrics(
  tp: number,
  tn: number,
  fp: number,
  fn: number,
  metricsEnabled: MetricToggles
): MetricsResult {
  const total = tp + tn + fp + fn;
  const res: MetricsResult = {};

  if (metricsEnabled.accuracy) {
    res.accuracy = total === 0 ? 0 : (tp + tn) / total;
  }
  if (metricsEnabled.precision) {
    // Precision = TP / (TP + FP) - when the model predicts positive, how often is it correct?
    res.precision = (tp + fp) === 0 ? 0 : tp / (tp + fp);
  }
  if (metricsEnabled.recall) {
    // Recall = TP / (TP + FN) - of all actual positives, how many did we catch?
    res.recall = (tp + fn) === 0 ? 0 : tp / (tp + fn);
  }

  return res;
}

export function calculateConfusionMatrix(
  userMarkedAdversarial: string,
  judgeDetectedAdversarial: boolean
): { tp: number; tn: number; fp: number; fn: number } {
  if (userMarkedAdversarial === "true" && judgeDetectedAdversarial) {
    return { tp: 1, tn: 0, fp: 0, fn: 0 }; // True Positive
  } else if (userMarkedAdversarial === "false" && !judgeDetectedAdversarial) {
    return { tp: 0, tn: 1, fp: 0, fn: 0 }; // True Negative
  } else if (userMarkedAdversarial === "true" && !judgeDetectedAdversarial) {
    return { tp: 0, tn: 0, fp: 1, fn: 0 }; // False Positive
  } else {
    return { tp: 0, tn: 0, fp: 0, fn: 1 }; // False Negative
  }
}

// Helper function to calculate metrics for a single evaluation
export function calculateSingleEvaluationMetrics(
  userMarkedAdversarial: string,
  judgeDetectedAdversarial: boolean,
  metricsEnabled: MetricToggles
): { confusionMatrix: { tp: number; tn: number; fp: number; fn: number }; metrics: MetricsResult } {
  const confusionMatrix = calculateConfusionMatrix(userMarkedAdversarial, judgeDetectedAdversarial);
  const metrics = computeMetrics(
    confusionMatrix.tp,
    confusionMatrix.tn,
    confusionMatrix.fp,
    confusionMatrix.fn,
    metricsEnabled
  );
  
  return { confusionMatrix, metrics };
}
