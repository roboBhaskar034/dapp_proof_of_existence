"use client";

import { useState, useCallback } from "react";
import {
  createPoll,
  vote,
  getPoll,
  getAllPolls,
  CONTRACT_ADDRESS,
} from "@/hooks/contract";
import { AnimatedCard } from "@/components/ui/animated-card";
import { Spotlight } from "@/components/ui/spotlight";
import { ShimmerButton } from "@/components/ui/shimmer-button";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";

// ── Icons ────────────────────────────────────────────────────

function SpinnerIcon() {
  return (
    <svg className="animate-spin" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
      <path d="M21 12a9 9 0 1 1-6.219-8.56" />
    </svg>
  );
}

function PlusIcon() {
  return (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M5 12h14M12 5v14" />
    </svg>
  );
}

function VoteIcon() {
  return (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <polyline points="9 11 12 14 22 4" />
      <path d="M21 12v7a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11" />
    </svg>
  );
}

function BarChartIcon() {
  return (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <line x1="18" y1="20" x2="18" y2="10" />
      <line x1="12" y1="20" x2="12" y2="4" />
      <line x1="6" y1="20" x2="6" y2="14" />
    </svg>
  );
}

function CheckIcon() {
  return (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
      <polyline points="20 6 9 17 4 12" />
    </svg>
  );
}

function AlertIcon() {
  return (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="12" cy="12" r="10" />
      <line x1="12" y1="8" x2="12" y2="12" />
      <line x1="12" y1="16" x2="12.01" y2="16" />
    </svg>
  );
}

function RefreshIcon() {
  return (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M3 12a9 9 0 0 1 9-9 9.75 9.75 0 0 1 6.74 2.74L21 8" />
      <path d="M21 3v5h-5" />
      <path d="M21 12a9 9 0 0 1-9 9 9.75 9.75 0 0 1-6.74-2.74L3 16" />
      <path d="M8 16H3v5" />
    </svg>
  );
}

// ── Styled Input ─────────────────────────────────────────────

function Input({
  label,
  ...props
}: { label: string } & React.InputHTMLAttributes<HTMLInputElement>) {
  return (
    <div className="space-y-2">
      <label className="block text-[11px] font-medium uppercase tracking-wider text-white/30">
        {label}
      </label>
      <div className="group rounded-xl border border-white/[0.06] bg-white/[0.02] p-px transition-all focus-within:border-[#7c6cf0]/30 focus-within:shadow-[0_0_20px_rgba(124,108,240,0.08)]">
        <input
          {...props}
          className="w-full rounded-[11px] bg-transparent px-4 py-3 font-mono text-sm text-white/90 placeholder:text-white/15 outline-none"
        />
      </div>
    </div>
  );
}

// ── Types ────────────────────────────────────────────────────

type PollData = {
  id: number;
  question: string;
  options: string[];
  votes: number[];
  total_votes: number;
};

// ── Option Bar ───────────────────────────────────────────────

function OptionBar({
  label,
  votes,
  total,
  selected,
  onSelect,
  disabled,
}: {
  label: string;
  votes: number;
  total: number;
  selected: boolean;
  onSelect: () => void;
  disabled: boolean;
}) {
  const pct = total > 0 ? Math.round((votes / total) * 100) : 0;
  return (
    <button
      onClick={onSelect}
      disabled={disabled}
      className={cn(
        "relative w-full rounded-xl border p-4 text-left transition-all overflow-hidden",
        selected
          ? "border-[#7c6cf0]/40 bg-[#7c6cf0]/[0.08]"
          : "border-white/[0.06] bg-white/[0.02] hover:border-white/[0.1]",
        disabled ? "opacity-50 cursor-not-allowed" : "cursor-pointer"
      )}
    >
      {/* Fill bar */}
      {total > 0 && (
        <div
          className="absolute inset-y-0 left-0 rounded-xl bg-gradient-to-r from-[#7c6cf0]/15 to-[#4fc3f7]/10 transition-all duration-700"
          style={{ width: `${pct}%` }}
        />
      )}
      <div className="relative flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div
            className={cn(
              "h-4 w-4 rounded-full border-2 transition-all",
              selected
                ? "border-[#7c6cf0] bg-[#7c6cf0]"
                : "border-white/20"
            )}
          >
            {selected && (
              <div className="flex h-full w-full items-center justify-center">
                <div className="h-1.5 w-1.5 rounded-full bg-white" />
              </div>
            )}
          </div>
          <span className={cn("text-sm font-medium", selected ? "text-white/90" : "text-white/50")}>
            {label}
          </span>
        </div>
        <div className="flex items-center gap-3">
          <span className="font-mono text-xs text-white/30">{votes} votes</span>
          <span className={cn("font-mono text-xs font-bold", selected ? "text-[#7c6cf0]" : "text-white/40")}>
            {pct}%
          </span>
        </div>
      </div>
    </button>
  );
}

// ── Main Component ───────────────────────────────────────────

type Tab = "browse" | "create" | "poll";

interface ContractUIProps {
  walletAddress: string | null;
  onConnect: () => void;
  isConnecting: boolean;
}

export default function ContractUI({ walletAddress, onConnect, isConnecting }: ContractUIProps) {
  const [activeTab, setActiveTab] = useState<Tab>("browse");
  const [error, setError] = useState<string | null>(null);
  const [txStatus, setTxStatus] = useState<string | null>(null);

  // Browse state
  const [allPolls, setAllPolls] = useState<PollData[]>([]);
  const [isLoadingPolls, setIsLoadingPolls] = useState(false);

  // Poll detail state
  const [selectedPoll, setSelectedPoll] = useState<PollData | null>(null);
  const [selectedOption, setSelectedOption] = useState<number | null>(null);
  const [isVoting, setIsVoting] = useState(false);
  const [isRefreshingPoll, setIsRefreshingPoll] = useState(false);

  // Create poll state
  const [newQuestion, setNewQuestion] = useState("");
  const [newOptions, setNewOptions] = useState("");
  const [isCreating, setIsCreating] = useState(false);

  const truncate = (addr: string) => `${addr.slice(0, 6)}...${addr.slice(-4)}`;

  // Load all polls
  const loadPolls = useCallback(async () => {
    setIsLoadingPolls(true);
    try {
      const result = await getAllPolls(walletAddress || undefined);
      if (result && Array.isArray(result)) {
        setAllPolls(
          result.map((p: any) => ({
            id: Number(p.id),
            question: String(p.question),
            options: Array.isArray(p.options) ? p.options.map(String) : [],
            votes: Array.isArray(p.votes) ? p.votes.map(Number) : [],
            total_votes: Number(p.total_votes),
          }))
        );
      }
    } catch (err: unknown) {
      // silently fail on browse
    } finally {
      setIsLoadingPolls(false);
    }
  }, [walletAddress]);

  // Load single poll
  const loadPoll = useCallback(async (pollId: number) => {
    setIsRefreshingPoll(true);
    try {
      const result = await getPoll(pollId, walletAddress || undefined);
      if (result) {
        setSelectedPoll({
          id: Number(result.id),
          question: String(result.question),
          options: Array.isArray(result.options) ? result.options.map(String) : [],
          votes: Array.isArray(result.votes)
            ? Object.values(result.votes as Record<string, number>).map(Number)
            : [],
          total_votes: Number(result.total_votes),
        });
      }
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Failed to load poll");
    } finally {
      setIsRefreshingPoll(false);
    }
  }, [walletAddress]);

  const handleBrowse = useCallback(async () => {
    setError(null);
    await loadPolls();
  }, [loadPolls]);

  const handleOpenPoll = useCallback(async (pollId: number) => {
    setSelectedOption(null);
    setActiveTab("poll");
    await loadPoll(pollId);
  }, [loadPoll]);

  const handleVote = useCallback(async () => {
    if (!walletAddress) return setError("Connect wallet first");
    if (selectedPoll === null || selectedOption === null) return setError("Select an option");
    setError(null);
    setIsVoting(true);
    setTxStatus("Awaiting signature...");
    try {
      await vote(walletAddress, selectedPoll.id, selectedOption);
      setTxStatus("Vote recorded on-chain!");
      setSelectedOption(null);
      await loadPoll(selectedPoll.id);
      setTimeout(() => setTxStatus(null), 5000);
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Transaction failed");
      setTxStatus(null);
    } finally {
      setIsVoting(false);
    }
  }, [walletAddress, selectedPoll, selectedOption, loadPoll]);

  const handleCreatePoll = useCallback(async () => {
    if (!walletAddress) return setError("Connect wallet first");
    if (!newQuestion.trim()) return setError("Enter a question");
    const opts = newOptions.split(",").map((o) => o.trim()).filter(Boolean);
    if (opts.length < 2) return setError("Enter at least 2 options separated by commas");
    setError(null);
    setIsCreating(true);
    setTxStatus("Awaiting signature...");
    try {
      await createPoll(walletAddress, newQuestion.trim(), opts);
      setTxStatus("Poll created on-chain!");
      setNewQuestion("");
      setNewOptions("");
      setActiveTab("browse");
      setTimeout(() => setTxStatus(null), 5000);
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Transaction failed");
      setTxStatus(null);
    } finally {
      setIsCreating(false);
    }
  }, [walletAddress, newQuestion, newOptions]);

  const tabs: { key: Tab; label: string; icon: React.ReactNode; color: string }[] = [
    { key: "browse", label: "Browse", icon: <BarChartIcon />, color: "#4fc3f7" },
    { key: "create", label: "Create", icon: <PlusIcon />, color: "#7c6cf0" },
    { key: "poll", label: "Vote", icon: <VoteIcon />, color: "#34d399" },
  ];

  return (
    <div className="w-full max-w-2xl animate-fade-in-up-delayed">
      {/* Toasts */}
      {error && (
        <div className="mb-4 flex items-start gap-3 rounded-xl border border-[#f87171]/15 bg-[#f87171]/[0.05] px-4 py-3 backdrop-blur-sm animate-slide-down">
          <span className="mt-0.5 text-[#f87171]"><AlertIcon /></span>
          <div className="min-w-0 flex-1">
            <p className="text-sm font-medium text-[#f87171]/90">Error</p>
            <p className="text-xs text-[#f87171]/50 mt-0.5 break-all">{error}</p>
          </div>
          <button onClick={() => setError(null)} className="shrink-0 text-[#f87171]/30 hover:text-[#f87171]/70 text-lg leading-none">&times;</button>
        </div>
      )}

      {txStatus && (
        <div className="mb-4 flex items-center gap-3 rounded-xl border border-[#34d399]/15 bg-[#34d399]/[0.05] px-4 py-3 backdrop-blur-sm shadow-[0_0_30px_rgba(52,211,153,0.05)] animate-slide-down">
          <span className="text-[#34d399]">
            {txStatus.includes("on-chain") ? <CheckIcon /> : <SpinnerIcon />}
          </span>
          <span className="text-sm text-[#34d399]/90">{txStatus}</span>
        </div>
      )}

      {/* Main Card */}
      <Spotlight className="rounded-2xl">
        <AnimatedCard className="p-0" containerClassName="rounded-2xl">
          {/* Header */}
          <div className="flex items-center justify-between border-b border-white/[0.06] px-6 py-4">
            <div className="flex items-center gap-3">
              <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-gradient-to-br from-[#7c6cf0]/20 to-[#34d399]/20 border border-white/[0.06]">
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-[#7c6cf0]">
                  <line x1="18" y1="20" x2="18" y2="10" />
                  <line x1="12" y1="20" x2="12" y2="4" />
                  <line x1="6" y1="20" x2="6" y2="14" />
                </svg>
              </div>
              <div>
                <h3 className="text-sm font-semibold text-white/90">Public Polls</h3>
                <p className="text-[10px] text-white/25 font-mono mt-0.5">{truncate(CONTRACT_ADDRESS)}</p>
              </div>
            </div>
            <Badge variant="success" className="text-[10px]">Permissionless</Badge>
          </div>

          {/* Tabs */}
          <div className="flex border-b border-white/[0.06] px-2">
            {tabs.map((t) => (
              <button
                key={t.key}
                onClick={() => {
                  setActiveTab(t.key);
                  setError(null);
                  if (t.key === "browse") handleBrowse();
                }}
                className={cn(
                  "relative flex items-center gap-2 px-5 py-3.5 text-sm font-medium transition-all",
                  activeTab === t.key ? "text-white/90" : "text-white/35 hover:text-white/55"
                )}
              >
                <span style={activeTab === t.key ? { color: t.color } : undefined}>{t.icon}</span>
                {t.label}
                {activeTab === t.key && (
                  <span
                    className="absolute bottom-0 left-2 right-2 h-[2px] rounded-full transition-all"
                    style={{ background: `linear-gradient(to right, ${t.color}, ${t.color}66)` }}
                  />
                )}
              </button>
            ))}
          </div>

          {/* Tab Content */}
          <div className="p-6">
            {/* Browse Polls */}
            {activeTab === "browse" && (
              <div className="space-y-5">
                <div className="flex items-center justify-between">
                  <p className="text-xs text-white/30">Active polls</p>
                  <button
                    onClick={handleBrowse}
                    className="flex items-center gap-1.5 text-xs text-white/30 hover:text-white/50 transition-colors"
                  >
                    <RefreshIcon />
                    Refresh
                  </button>
                </div>

                {isLoadingPolls ? (
                  <div className="flex items-center justify-center py-8">
                    <SpinnerIcon />
                    <span className="ml-2 text-sm text-white/30">Loading polls...</span>
                  </div>
                ) : allPolls.length === 0 ? (
                  <div className="rounded-xl border border-dashed border-white/[0.06] py-10 text-center">
                    <p className="text-sm text-white/25">No polls yet. Be the first to create one!</p>
                  </div>
                ) : (
                  <div className="space-y-3">
                    {allPolls.map((poll) => (
                      <button
                        key={poll.id}
                        onClick={() => handleOpenPoll(poll.id)}
                        className="w-full rounded-xl border border-white/[0.06] bg-white/[0.02] p-4 text-left hover:border-[#7c6cf0]/20 hover:bg-white/[0.03] transition-all"
                      >
                        <div className="flex items-center justify-between">
                          <div>
                            <p className="text-sm font-medium text-white/80">{poll.question}</p>
                            <p className="text-[10px] text-white/25 mt-0.5 font-mono">
                              {poll.options.length} options &middot; {poll.total_votes} votes
                            </p>
                          </div>
                          <Badge variant="info" className="text-[10px]">#{poll.id}</Badge>
                        </div>
                      </button>
                    ))}
                  </div>
                )}
              </div>
            )}

            {/* Create Poll */}
            {activeTab === "create" && (
              <div className="space-y-5">
                <div className="rounded-xl border border-[#7c6cf0]/15 bg-[#7c6cf0]/[0.03] px-4 py-3">
                  <p className="text-xs text-white/40">
                    Anyone can create a poll — no permissions needed.
                  </p>
                </div>
                <Input
                  label="Question"
                  value={newQuestion}
                  onChange={(e) => setNewQuestion(e.target.value)}
                  placeholder="e.g. Best blockchain for DeFi?"
                />
                <Input
                  label="Options (comma-separated, min 2)"
                  value={newOptions}
                  onChange={(e) => setNewOptions(e.target.value)}
                  placeholder="e.g. Stellar, Ethereum, Solana, Polygon"
                />
                {newOptions.trim() && (
                  <div className="space-y-2">
                    <p className="text-[10px] text-white/25 uppercase tracking-wider">Preview</p>
                    {newOptions.split(",").map((o, i) => o.trim()).filter(Boolean).map((opt, i) => (
                      <div key={i} className="flex items-center gap-2 rounded-lg border border-white/[0.04] bg-white/[0.02] px-3 py-2">
                        <div className="h-3 w-3 rounded-full border border-white/20" />
                        <span className="text-sm text-white/50">{opt}</span>
                      </div>
                    ))}
                  </div>
                )}
                {walletAddress ? (
                  <ShimmerButton onClick={handleCreatePoll} disabled={isCreating} shimmerColor="#7c6cf0" className="w-full">
                    {isCreating ? <><SpinnerIcon /> Creating...</> : <><PlusIcon /> Create Poll</>}
                  </ShimmerButton>
                ) : (
                  <button
                    onClick={onConnect}
                    disabled={isConnecting}
                    className="w-full rounded-xl border border-dashed border-[#7c6cf0]/20 bg-[#7c6cf0]/[0.03] py-4 text-sm text-[#7c6cf0]/60 hover:border-[#7c6cf0]/30 hover:text-[#7c6cf0]/80 active:scale-[0.99] transition-all disabled:opacity-50"
                  >
                    Connect wallet to create a poll
                  </button>
                )}
              </div>
            )}

            {/* Poll Detail / Vote */}
            {activeTab === "poll" && (
              <div className="space-y-5">
                {selectedPoll === null ? (
                  <div className="rounded-xl border border-dashed border-white/[0.06] py-10 text-center">
                    <p className="text-sm text-white/25">Select a poll from Browse to vote.</p>
                  </div>
                ) : (
                  <>
                    {/* Poll header */}
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm font-medium text-white/80">{selectedPoll.question}</p>
                        <p className="text-[10px] text-white/25 mt-0.5 font-mono">
                          Poll #{selectedPoll.id} &middot; {selectedPoll.total_votes} total votes
                        </p>
                      </div>
                      <button
                        onClick={() => loadPoll(selectedPoll.id)}
                        disabled={isRefreshingPoll}
                        className="flex items-center gap-1.5 text-xs text-white/30 hover:text-white/50 transition-colors"
                      >
                        <RefreshIcon />
                      </button>
                    </div>

                    {/* Options */}
                    <div className="space-y-2">
                      {selectedPoll.options.map((opt, i) => (
                        <OptionBar
                          key={i}
                          label={opt}
                          votes={selectedPoll.votes[i] || 0}
                          total={selectedPoll.total_votes}
                          selected={selectedOption === i}
                          onSelect={() => setSelectedOption(i)}
                          disabled={!walletAddress}
                        />
                      ))}
                    </div>

                    {/* Vote button */}
                    {walletAddress ? (
                      <ShimmerButton
                        onClick={handleVote}
                        disabled={selectedOption === null || isVoting}
                        shimmerColor="#34d399"
                        className="w-full"
                      >
                        {isVoting ? <><SpinnerIcon /> Recording vote...</> : <><VoteIcon /> Cast Vote</>}
                      </ShimmerButton>
                    ) : (
                      <button
                        onClick={onConnect}
                        disabled={isConnecting}
                        className="w-full rounded-xl border border-dashed border-[#34d399]/20 bg-[#34d399]/[0.03] py-4 text-sm text-[#34d399]/60 hover:border-[#34d399]/30 hover:text-[#34d399]/80 active:scale-[0.99] transition-all disabled:opacity-50"
                      >
                        Connect wallet to vote
                      </button>
                    )}
                  </>
                )}
              </div>
            )}
          </div>

          {/* Footer */}
          <div className="border-t border-white/[0.04] px-6 py-3 flex items-center justify-between">
            <p className="text-[10px] text-white/15">Public Polls &middot; Soroban</p>
            <div className="flex items-center gap-2">
              {["Permissionless", "Anonymous", "Immutable"].map((tag, i) => (
                <span key={tag} className="font-mono text-[9px] text-white/15">
                  {tag}
                  {i < 2 && <span className="text-white/10 mx-1">&middot;</span>}
                </span>
              ))}
            </div>
          </div>
        </AnimatedCard>
      </Spotlight>
    </div>
  );
}
