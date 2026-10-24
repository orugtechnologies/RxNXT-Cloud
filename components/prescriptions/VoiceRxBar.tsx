'use client';

import React, { useState, useEffect, useRef } from 'react';
import { 
  Mic, 
  MicOff, 
  Sparkles, 
  Loader2, 
  Check, 
  Volume2, 
  RefreshCw, 
  X, 
  ChevronDown, 
  ChevronUp, 
  AlertCircle,
  Play,
  Pill,
  CheckCircle2
} from 'lucide-react';

export interface ParsedVoiceMedicine {
  name: string;
  dosage_form?: string;
  strength?: string;
  frequency: string;
  duration: string;
  instructions: string;
  generic_id?: string;
  drugId?: string;
}

export interface VoiceRxPayload {
  transcript: string;
  chiefComplaint?: string;
  diagnosis?: string;
  medicines: ParsedVoiceMedicine[];
  notes?: string;
  followUpDays?: number;
  followUpDate?: string;
}

interface VoiceRxBarProps {
  onApply: (data: VoiceRxPayload) => void;
  disabled?: boolean;
}

const SAMPLE_CLINICAL_VOICE_SCRIPTS = [
  {
    label: 'Viral Fever & Cough',
    text: 'Patient complaining of viral fever with cough for 2 days. Give Dolo 650 1-0-1 for 3 days after food, and Pantocid 40 1-0-0 before food for 5 days. Advise warm water gargle and review in 3 days.',
  },
  {
    label: 'Acute Pharyngitis / Tonsillitis',
    text: 'Patient c/o severe sore throat and fever. Diagnosis acute tonsillitis. Prescribe Tab Augmentin 625 BD for 5 days after food, Tab Paracetamol 650 TDS for 3 days, and warm saline gargles. Follow up after 5 days.',
  },
  {
    label: 'Acute Gastritis / Acidity',
    text: 'Patient having burning epigastric pain and indigestion for 3 days. Prescribe Pantop 40 OD before breakfast for 7 days, and Gelusil syrup 10ml thrice daily after food. Avoid spicy oily food.',
  },
];

export default function VoiceRxBar({ onApply, disabled }: VoiceRxBarProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [isListening, setIsListening] = useState(false);
  const [transcript, setTranscript] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [lastApplied, setLastApplied] = useState<{ medCount: number; diagnosis?: string } | null>(null);
  const [browserSupported, setBrowserSupported] = useState(true);

  const recognitionRef = useRef<any>(null);
  const timerRef = useRef<NodeJS.Timeout | null>(null);
  const [recordingSeconds, setRecordingSeconds] = useState(0);

  // Initialize Web Speech Recognition
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const SpeechRecognition =
        (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;

      if (SpeechRecognition) {
        const recognition = new SpeechRecognition();
        recognition.continuous = true;
        recognition.interimResults = true;
        recognition.lang = 'en-IN'; // Indian English

        recognition.onresult = (event: any) => {
          let currentTranscript = '';
          for (let i = 0; i < event.results.length; i++) {
            currentTranscript += event.results[i][0].transcript + ' ';
          }
          setTranscript(currentTranscript.trim());
        };

        recognition.onerror = (event: any) => {
          console.warn('Speech recognition error:', event.error);
          if (event.error === 'not-allowed') {
            setError('Microphone access denied. Please allow microphone permissions in your browser.');
          } else if (event.error !== 'no-speech') {
            setError(`Voice input notice: ${event.error}`);
          }
          setIsListening(false);
        };

        recognition.onend = () => {
          setIsListening(false);
        };

        recognitionRef.current = recognition;
      } else {
        setBrowserSupported(false);
      }
    }

    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
      if (recognitionRef.current) {
        try {
          recognitionRef.current.stop();
        } catch {
          // Ignore
        }
      }
    };
  }, []);

  const toggleListening = () => {
    setError(null);
    setLastApplied(null);

    if (isListening) {
      // Stop listening
      try {
        recognitionRef.current?.stop();
      } catch {
        // Ignore
      }
      setIsListening(false);
      if (timerRef.current) clearInterval(timerRef.current);
    } else {
      // Start listening
      if (!recognitionRef.current) {
        setError('Speech recognition is not supported in this browser. You can type or paste text into the box below.');
        return;
      }

      try {
        setTranscript('');
        setRecordingSeconds(0);
        recognitionRef.current.start();
        setIsListening(true);

        timerRef.current = setInterval(() => {
          setRecordingSeconds((prev) => prev + 1);
        }, 1000);
      } catch (err: any) {
        console.error('Failed to start speech recognition:', err);
        setError('Could not start microphone. Check microphone permissions.');
        setIsListening(false);
      }
    }
  };

  const handleProcessTranscript = async (textToProcess?: string) => {
    const text = (textToProcess || transcript).trim();
    if (!text) {
      setError('Please dictate or enter a clinical prescription sentence first.');
      return;
    }

    // Stop listening if running
    if (isListening) {
      toggleListening();
    }

    setIsProcessing(true);
    setError(null);

    try {
      const res = await fetch('/api/doctor/voice-rx', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ transcript: text }),
      });

      const json = await res.json();
      if (!res.ok) {
        throw new Error(json.error || 'Failed to process voice prescription');
      }

      const parsed: VoiceRxPayload = json.data;

      if (!parsed.medicines || parsed.medicines.length === 0) {
        setError('No medicines were recognized. Please mention medicine name with frequency (e.g. "Dolo 650 1-0-1 for 3 days").');
        setIsProcessing(false);
        return;
      }

      // Apply to parent prescription workflow
      onApply(parsed);

      setLastApplied({
        medCount: parsed.medicines.length,
        diagnosis: parsed.diagnosis,
      });

      // Clear transcript after successful apply
      setTranscript('');
    } catch (err: any) {
      console.error('Voice Rx error:', err);
      setError(err.message || 'Error processing voice prescription. Please try again.');
    } finally {
      setIsProcessing(false);
    }
  };

  const loadSampleScript = (sampleText: string) => {
    setTranscript(sampleText);
    setError(null);
    setLastApplied(null);
  };

  return (
    <div className="mb-4 bg-gradient-to-r from-emerald-950 via-slate-900 to-teal-950 border border-emerald-500/30 rounded-2xl shadow-md text-white overflow-hidden transition-all duration-300">
      {/* Header Bar */}
      <div className="p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          <div className="relative">
            <button
              type="button"
              onClick={() => {
                setIsOpen(true);
                toggleListening();
              }}
              disabled={disabled || isProcessing}
              className={`w-11 h-11 rounded-xl flex items-center justify-center transition-all shadow-md ${
                isListening
                  ? 'bg-rose-500 text-white animate-pulse shadow-rose-500/50 scale-105'
                  : 'bg-emerald-500 hover:bg-emerald-400 text-slate-950 hover:scale-105'
              }`}
              title={isListening ? 'Click to Stop' : 'Click to Speak Prescription'}
            >
              {isListening ? <MicOff className="w-5 h-5" /> : <Mic className="w-5 h-5" />}
            </button>
            {isListening && (
              <span className="absolute -top-1 -right-1 flex h-3 w-3">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-rose-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-3 w-3 bg-rose-500"></span>
              </span>
            )}
          </div>

          <div>
            <div className="flex items-center gap-2">
              <span className="text-sm font-extrabold text-white tracking-tight flex items-center gap-1.5">
                <Sparkles className="w-4 h-4 text-emerald-400" />
                Voice Rx Engine
              </span>
              <span className="text-[10px] font-bold uppercase tracking-wider bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 px-2 py-0.5 rounded-full">
                Live Prototype
              </span>
            </div>
            <p className="text-xs text-slate-300 mt-0.5">
              {isListening
                ? `Listening (${recordingSeconds}s)... Speak medicines & dosage clearly`
                : 'Speak medicines, diagnosis & instructions hands-free'}
            </p>
          </div>
        </div>

        {/* Action Controls */}
        <div className="flex items-center gap-2 self-end sm:self-center">
          {lastApplied && (
            <div className="hidden md:flex items-center gap-1.5 text-xs text-emerald-300 bg-emerald-950/80 border border-emerald-500/40 px-2.5 py-1 rounded-lg">
              <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
              <span>Added {lastApplied.medCount} meds</span>
            </div>
          )}

          <button
            type="button"
            onClick={() => setIsOpen(!isOpen)}
            className="text-xs font-semibold text-slate-300 hover:text-white bg-slate-800/80 hover:bg-slate-700/80 border border-slate-700 px-3 py-2 rounded-xl transition flex items-center gap-1.5"
          >
            <span>{isOpen ? 'Collapse' : 'Dictate / Test'}</span>
            {isOpen ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
          </button>
        </div>
      </div>

      {/* Expanded Dictation & Testing Panel */}
      {isOpen && (
        <div className="p-4 sm:p-5 bg-slate-950/90 border-t border-slate-800 space-y-4">
          {/* Quick OPD Test Scripts */}
          <div>
            <div className="flex items-center justify-between mb-2">
              <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider flex items-center gap-1">
                <span>⚡ 1-Click Test Samples (Try without talking):</span>
              </span>
              <span className="text-[10px] text-slate-500">Tap to load & parse</span>
            </div>
            <div className="flex flex-wrap gap-2">
              {SAMPLE_CLINICAL_VOICE_SCRIPTS.map((sample, sIdx) => (
                <button
                  key={sIdx}
                  type="button"
                  onClick={() => {
                    loadSampleScript(sample.text);
                    handleProcessTranscript(sample.text);
                  }}
                  className="text-xs text-emerald-300 hover:text-white bg-emerald-950/50 hover:bg-emerald-800/60 border border-emerald-600/30 px-3 py-1.5 rounded-xl transition flex items-center gap-1.5 shadow-2xs"
                >
                  <Play className="w-3 h-3 text-emerald-400" />
                  <span>{sample.label}</span>
                </button>
              ))}
            </div>
          </div>

          {/* Real-time Transcription Text Area */}
          <div className="space-y-1.5">
            <div className="flex items-center justify-between">
              <label className="text-xs font-semibold text-slate-300 flex items-center gap-1.5">
                <Volume2 className="w-3.5 h-3.5 text-emerald-400" />
                <span>Dictated Speech / Transcript:</span>
              </label>
              {transcript && (
                <button
                  type="button"
                  onClick={() => setTranscript('')}
                  className="text-[11px] text-slate-400 hover:text-rose-300 flex items-center gap-1"
                >
                  <X className="w-3 h-3" /> Clear
                </button>
              )}
            </div>

            <div className="relative">
              <textarea
                value={transcript}
                onChange={(e) => setTranscript(e.target.value)}
                placeholder={
                  isListening
                    ? 'Listening to microphone... (e.g. "Patient has acute fever. Give Dolo 650 1-0-1 for 3 days after food...")'
                    : 'Click microphone above to dictate, or click a 1-click test sample above, or paste doctor dictation here...'
                }
                rows={3}
                className="w-full bg-slate-900/90 border border-slate-700 focus:border-emerald-500 text-white placeholder-slate-500 text-sm p-3.5 rounded-xl outline-none focus:ring-1 focus:ring-emerald-500/50 resize-none font-sans"
              />
              {isListening && (
                <div className="absolute right-3 bottom-3 flex items-center gap-1.5 bg-rose-950/90 text-rose-300 border border-rose-500/30 px-2 py-0.5 rounded-md text-[10px] font-bold animate-pulse">
                  <span className="w-2 h-2 rounded-full bg-rose-500"></span>
                  REC {recordingSeconds}s
                </div>
              )}
            </div>
          </div>

          {/* Error Notice */}
          {error && (
            <div className="p-3 rounded-xl bg-rose-950/80 border border-rose-500/40 text-rose-200 text-xs flex items-center gap-2">
              <AlertCircle className="w-4 h-4 text-rose-400 shrink-0" />
              <span>{error}</span>
            </div>
          )}

          {/* Action Bar */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pt-1 border-t border-slate-800/80">
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={toggleListening}
                className={`text-xs font-bold px-4 py-2 rounded-xl transition flex items-center gap-2 ${
                  isListening
                    ? 'bg-rose-600 hover:bg-rose-700 text-white shadow-md shadow-rose-900/30'
                    : 'bg-slate-800 hover:bg-slate-700 text-white border border-slate-700'
                }`}
              >
                {isListening ? (
                  <>
                    <MicOff className="w-3.5 h-3.5" />
                    <span>Stop Recording</span>
                  </>
                ) : (
                  <>
                    <Mic className="w-3.5 h-3.5 text-emerald-400" />
                    <span>Start Voice Dictation</span>
                  </>
                )}
              </button>

              {!browserSupported && (
                <span className="text-[10px] text-amber-400 bg-amber-950/60 border border-amber-600/30 px-2 py-1 rounded-lg">
                  Browser mic speech recognition unavailable — text input active
                </span>
              )}
            </div>

            <button
              type="button"
              onClick={() => handleProcessTranscript()}
              disabled={!transcript.trim() || isProcessing}
              className="text-xs font-bold text-slate-950 bg-gradient-to-r from-emerald-400 to-teal-400 hover:from-emerald-300 hover:to-teal-300 disabled:opacity-50 disabled:pointer-events-none px-5 py-2.5 rounded-xl shadow-md transition flex items-center justify-center gap-2"
            >
              {isProcessing ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  <span>Parsing Clinical Entities...</span>
                </>
              ) : (
                <>
                  <Sparkles className="w-4 h-4" />
                  <span>Parse & Add to Prescription</span>
                </>
              )}
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
