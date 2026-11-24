import React, { useState, useEffect } from "react";
import toast from "react-hot-toast";
import { getModeratorAudits, submitModeratorAudit, getModeratorMetrics } from "@/api/user";

const ModeratorUpgradationComponent = ({ profileData, onUpdate }) => {
  const [audits, setAudits] = useState([]);
  const [metrics, setMetrics] = useState({ cohortRetention: 0, slaCompliance: 0 });
  const [loading, setLoading] = useState(true);
  const [metricsLoading, setMetricsLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [scores, setScores] = useState({
    knowledge: "",
    empathy: "",
    sla: "",
    sop: "",
  });

  const moderatorId = profileData?.user?._id;
  const currentTier = profileData?.user?.moderatorTier || "Junior";

  useEffect(() => {
    if (moderatorId) {
      fetchAudits();
      fetchMetrics();
    }
  }, [moderatorId]);

  const fetchAudits = async () => {
    setLoading(true);
    try {
      const res = await getModeratorAudits(moderatorId);
      setAudits(res.data);
    } catch (error) {
      toast.error("Failed to fetch audit history");
    } finally {
      setLoading(false);
    }
  };

  const fetchMetrics = async () => {
    setMetricsLoading(true);
    try {
      const res = await getModeratorMetrics(moderatorId);
      setMetrics(res.data);
    } catch (error) {
      toast.error("Failed to fetch real-time metrics");
    } finally {
      setMetricsLoading(false);
    }
  };

  const calculateTotal = () => {
    const k = Number(scores.knowledge) || 0;
    const e = Number(scores.empathy) || 0;
    const s = metricsLoading ? 0 : Number(metrics.slaCompliance / 10);
    const p = Number(scores.sop) || 0;
    return (k + e + s + p).toFixed(1);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (
      scores.knowledge === "" ||
      scores.empathy === "" ||
      scores.sop === ""
    ) {
      toast.error("Please fill all rubric fields");
      return;
    }

    setSubmitting(true);
    try {
      await submitModeratorAudit(moderatorId, {
        scores: {
          knowledge: Number(scores.knowledge),
          empathy: Number(scores.empathy),
          sla: Number(metrics.slaCompliance / 10),
          sop: Number(scores.sop),
        }
      });
      toast.success("Audit submitted successfully!");
      setScores({ knowledge: "", empathy: "", sla: "", sop: "" });
      fetchAudits();
      fetchMetrics(); // Refresh metrics just in case
      if (onUpdate) onUpdate();
    } catch (error) {
      toast.error(error.response?.data?.message || "Failed to submit audit");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="flex-1 overflow-y-auto bg-white rounded-xl shadow-sm border border-gray-100 p-3.5 sm:p-6 flex flex-col gap-4 sm:gap-6 font-sans">
      <div className="flex flex-wrap justify-between items-center bg-gray-50 p-3 sm:p-4 rounded-lg border border-gray-200 gap-2">
        <div>
          <h2 className="text-base sm:text-lg font-bold text-gray-800">Current Tier</h2>
          <p className="text-gray-500 text-xs sm:text-sm mt-0.5 sm:mt-1">This determines feature limits.</p>
        </div>
        <div className="px-3 sm:px-4 py-1.5 sm:py-2 bg-gradient-to-r from-blue-500 to-indigo-600 text-white text-xs sm:text-sm font-bold rounded-lg shadow-sm">
          {currentTier} Moderator
        </div>
      </div>

      {/* Promotion Criteria Info Box */}
      <div className="bg-blue-50/70 border border-blue-100 p-3.5 sm:p-4 rounded-xl flex flex-col gap-2.5 sm:gap-3">
        <h3 className="text-xs sm:text-sm font-bold text-blue-800">
          Automated Promotion Criteria
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-2.5 sm:gap-4 text-[11px] sm:text-xs">
          <div className="bg-white p-3 rounded-lg shadow-xs border border-blue-50">
            <div className="font-bold text-gray-800 mb-1 flex items-center gap-1.5">
              <span className="text-blue-500">➡</span> Standard Moderator
            </div>
            <ul className="text-gray-600 list-disc pl-4 flex flex-col gap-0.5">
              <li>SLA Compliance &ge; 88%</li>
              <li>Cohort Retention &ge; 60%</li>
              <li>Avg Score &ge; 7.5/10</li>
            </ul>
          </div>
          <div className="bg-white p-3 rounded-lg shadow-xs border border-blue-50">
            <div className="font-bold text-gray-800 mb-1 flex items-center gap-1.5">
              <span className="text-indigo-500">➡</span> Senior Moderator
            </div>
            <ul className="text-gray-600 list-disc pl-4 flex flex-col gap-0.5">
              <li>SLA Compliance &ge; 92%</li>
              <li>Cohort Retention &ge; 70%</li>
              <li>Avg Score &ge; 8.5/10</li>
            </ul>
          </div>
          <div className="bg-white p-3 rounded-lg shadow-xs border border-blue-50">
            <div className="font-bold text-gray-800 mb-1 flex items-center gap-1.5">
              <span className="text-purple-500">➡</span> Lead Moderator
            </div>
            <ul className="text-gray-600 list-disc pl-4 flex flex-col gap-0.5">
              <li>SLA Compliance &ge; 96%</li>
              <li>Cohort Retention &ge; 80%</li>
              <li>Avg Score &ge; 9.2/10</li>
            </ul>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-2 gap-4 sm:gap-6">
        {/* Form Section */}
        <div className="bg-white border border-gray-200 rounded-lg p-3.5 sm:p-5 shadow-sm flex flex-col gap-4">
          <h3 className="text-sm sm:text-md font-bold text-gray-800 border-b pb-2">Submit New Evaluation</h3>
          
          {/* Read-Only Auto-Calculated Metrics */}
          <div className="grid grid-cols-2 gap-2 sm:gap-4">
            <div className="bg-blue-50 border border-blue-100 p-2.5 sm:p-3 rounded-lg flex flex-col justify-center items-center text-center">
              <span className="text-[11px] sm:text-xs text-blue-600 font-bold uppercase tracking-wider mb-1">Cohort Retention</span>
              {metricsLoading ? (
                <span className="text-xs sm:text-sm text-blue-400">Calculating...</span>
              ) : (
                <span className="text-lg sm:text-xl font-bold text-blue-800">{Math.round(metrics.cohortRetention)}%</span>
              )}
            </div>
            <div className="bg-indigo-50 border border-indigo-100 p-2.5 sm:p-3 rounded-lg flex flex-col justify-center items-center text-center">
              <span className="text-[11px] sm:text-xs text-indigo-600 font-bold uppercase tracking-wider mb-1">SLA Compliance</span>
              {metricsLoading ? (
                <span className="text-xs sm:text-sm text-indigo-400">Calculating...</span>
              ) : (
                <span className="text-lg sm:text-xl font-bold text-indigo-800">{Math.round(metrics.slaCompliance)}%</span>
              )}
            </div>
          </div>
          <p className="text-[11px] text-gray-400 text-center -mt-2">Metrics are automatically calculated in real-time from the database.</p>

          <form onSubmit={handleSubmit} className="flex flex-col gap-4 mt-2">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
              <div>
                <label className="text-xs font-semibold text-gray-600 block mb-1 whitespace-nowrap">
                  Knowledge Transfer <span className="text-gray-400 font-normal">(/10)</span>
                </label>
                <input
                  type="number"
                  min="0"
                  max="10"
                  step="0.1"
                  placeholder="0.0 - 10.0"
                  value={scores.knowledge}
                  onChange={e => setScores({...scores, knowledge: e.target.value})}
                  className="w-full text-xs sm:text-sm border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 p-2 border"
                  required
                />
              </div>
              <div>
                <label className="text-xs font-semibold text-gray-600 block mb-1 whitespace-nowrap">
                  Empathy & Tone <span className="text-gray-400 font-normal">(/10)</span>
                </label>
                <input
                  type="number"
                  min="0"
                  max="10"
                  step="0.1"
                  placeholder="0.0 - 10.0"
                  value={scores.empathy}
                  onChange={e => setScores({...scores, empathy: e.target.value})}
                  className="w-full text-xs sm:text-sm border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 p-2 border"
                  required
                />
              </div>
              <div>
                <label className="text-xs font-semibold text-gray-600 block mb-1 whitespace-nowrap">
                  SLA & Follow-up <span className="text-gray-400 font-normal">(/10)</span>
                </label>
                <input
                  type="number"
                  min="0"
                  max="10"
                  step="0.1"
                  value={metricsLoading ? "" : (metrics.slaCompliance / 10).toFixed(1)}
                  disabled
                  className="w-full text-xs sm:text-sm border-gray-300 rounded-md shadow-sm bg-gray-100 text-gray-500 p-2 border cursor-not-allowed"
                />
              </div>
              <div>
                <label className="text-xs font-semibold text-gray-600 block mb-1 whitespace-nowrap">
                  SOP Compliance <span className="text-gray-400 font-normal">(/10)</span>
                </label>
                <input
                  type="number"
                  min="0"
                  max="10"
                  step="0.1"
                  placeholder="0.0 - 10.0"
                  value={scores.sop}
                  onChange={e => setScores({...scores, sop: e.target.value})}
                  className="w-full text-xs sm:text-sm border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 p-2 border"
                  required
                />
              </div>
            </div>
            
            <div className="bg-gray-50 p-3 rounded text-xs sm:text-sm text-gray-700 font-medium flex justify-between border border-gray-200 mt-2">
              <span>Total Manual Points:</span>
              <span className="text-blue-600 font-bold">{calculateTotal()} / 40</span>
            </div>

            <button
              type="submit"
              disabled={submitting || metricsLoading}
              className="mt-2 w-full bg-blue-600 hover:bg-blue-700 text-white font-medium py-2 sm:py-2.5 px-4 rounded-md shadow-sm transition-colors disabled:bg-blue-400 text-xs sm:text-sm"
            >
              {submitting ? "Submitting..." : "Submit Evaluation"}
            </button>
          </form>
        </div>

        {/* History Section */}
        <div className="bg-white border border-gray-200 rounded-lg p-3.5 sm:p-5 shadow-sm flex flex-col">
          <h3 className="text-sm sm:text-md font-bold text-gray-800 mb-3 sm:mb-4 border-b pb-2 flex items-center justify-between">
            <span>Audit History</span>
            {audits.length > 0 && (
              <span className="text-xs font-normal text-gray-500">{audits.length} record{audits.length > 1 ? 's' : ''}</span>
            )}
          </h3>
          
          <div className="flex-1 overflow-y-auto pr-1 sm:pr-2">
            {loading ? (
              <p className="text-xs sm:text-sm text-gray-500 py-6 text-center">Loading history...</p>
            ) : audits.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-8 text-center text-gray-400">
                <p className="text-xs sm:text-sm text-gray-500 font-medium">No audit history found.</p>
                <p className="text-[11px] text-gray-400 mt-1">Submitted evaluations will be recorded here.</p>
              </div>
            ) : (
              <div className="flex flex-col gap-3">
                {audits.map((a, idx) => (
                  <div key={idx} className="bg-gray-50 p-3 sm:p-3.5 rounded-lg border border-gray-200 flex flex-col gap-2">
                    <div className="flex justify-between items-center gap-2">
                      <span className="text-xs font-bold text-gray-500">{new Date(a.evaluationDate).toLocaleDateString()}</span>
                      <span className="text-xs font-bold bg-indigo-100 text-indigo-700 px-2 py-0.5 rounded">Result: {a.resultingTier}</span>
                    </div>
                    <div className="grid grid-cols-1 sm:grid-cols-2 text-xs text-gray-700 gap-y-1 gap-x-2">
                      <span>Total Score: <strong className="text-gray-900">{a.totalScore}/40</strong> ({Math.round(a.auditPercentage)}%)</span>
                      <span>SLA Compliance: <strong className="text-gray-900">{Math.round(a.slaCompliance)}%</strong></span>
                      <span>Retention: <strong className="text-gray-900">{Math.round(a.cohortRetention)}%</strong></span>
                      <span>Evaluator: <strong className="text-gray-900">{a.evaluatedBy?.firstname} {a.evaluatedBy?.lastname}</strong></span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default ModeratorUpgradationComponent;
