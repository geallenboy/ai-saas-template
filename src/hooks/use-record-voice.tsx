"use client";
import { blobToBase64, createMediaStream } from "@/lib/record";
import { OpenAI, toFile } from "openai";
import { useEffect, useRef, useState } from "react";
import { useToast } from "@/components/ui/use-toast";
import { usePreferenceStore } from "@/hooks/use-preferences-store";
import { useSettingsStore } from "@/stores/chat/settings";
import { Button } from "@/components/ui/button";
import { Microphone, StopCircle } from "@phosphor-icons/react";
import { Tooltip } from "@/components/ui/tooltip";
import { AudioWaveSpinner } from "@/components/ui/audio-wave";
import { RecordIcon, StopIcon } from "@hugeicons/core-free-icons";
import { HugeiconsIcon } from "@hugeicons/react";

export const useRecordVoice = () => {
  const [text, setText] = useState<string>("");
  const [mediaRecorder, setMediaRecorder] = useState<MediaRecorder | null>(
    null
  );
  const { preferences } = usePreferenceStore();
  const { open: openSettings } = useSettingsStore();
  const { toast } = useToast();
  const { apiKeys } = usePreferenceStore();
  const [recording, setRecording] = useState<boolean>(false);
  const [transcribing, setIsTranscribing] = useState<boolean>(false);

  const isRecording = useRef<boolean>(false);
  const chunks = useRef<Blob[]>([]);

  const startRecording = async (): Promise<void> => {
    setText("");
    chunks.current = [];
    if (mediaRecorder) {
      mediaRecorder.start(1000);
      setRecording(true);
      return;
    }
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const mediaRecorder = new MediaRecorder(stream);

      mediaRecorder.ondataavailable = (ev: BlobEvent) => {
        chunks.current.push(ev.data);
      };

      mediaRecorder.onstop = () => {
        const audioBlob = new Blob(chunks.current, { type: "audio/wav" });
        blobToBase64(audioBlob, getText);
      };

      setMediaRecorder(mediaRecorder);
      mediaRecorder.start(1000);
      setRecording(true);
    } catch (error) {
      console.error("Error accessing microphone:", error);
      toast({
        title: "Microphone access denied",
        description: "Please grant microphone access to record audio.",
        variant: "destructive",
      });
    }
  };

  const stopRecording = (): void => {
    if (mediaRecorder) {
      isRecording.current = false;
      mediaRecorder.stop();
      setRecording(false);
    }
  };

  const getText = async (base64data: string): Promise<void> => {
    setIsTranscribing(true);
    try {
      const apiKey = apiKeys.openai;

      if (!apiKey) {
        throw new Error("API key not found");
      }

      const openai = new OpenAI({
        apiKey,
        dangerouslyAllowBrowser: true,
      });

      const audioBuffer = Buffer.from(base64data, "base64");
      const transcription = await openai.audio.transcriptions.create({
        file: await toFile(audioBuffer, "audio.wav", {
          type: "audio/wav",
        }),
        model: "whisper-1",
      });

      setText(transcription?.text || "");
    } catch (error) {
      console.log(error);
      toast({
        title: "Failed to transcribe",
        description: "Something went wrong. check your openai settings.",
        variant: "destructive",
      });
    } finally {
      setIsTranscribing(false);
    }
  };

  const startVoiceRecording = async () => {
    const openAIAPIKeys = apiKeys.openai;
    if (!openAIAPIKeys) {
      toast({
        title: "API key missing",
        description:
          "Recordings require OpenAI API key. Please check settings.",
        variant: "destructive",
      });
      openSettings("openai");
      return;
    }

    if (preferences?.whisperSpeechToTextEnabled) {
      startRecording();
    } else {
      toast({
        title: "Enable Speech to Text",
        description:
          "Recordings require Speech to Text enabled. Please check settings.",
        variant: "destructive",
      });
      openSettings("voice-input");
    }
  };

  const renderRecordingControls = () => {
    if (recording) {
      return (
        <>
          <Button
            variant="ghost"
            size="iconSm"
            rounded={"full"}
            onClick={() => {
              stopRecording();
            }}
          >
            <HugeiconsIcon icon={StopIcon}
              size={18}
              strokeWidth={2} 
              className="text-red-300"
            />{" "}
          </Button>
        </>
      );
    }

    return (
      <Tooltip content="Record">
        <Button size="iconSm" variant="ghost" onClick={startVoiceRecording}>
            <HugeiconsIcon icon={RecordIcon} size={18} strokeWidth={2} />
        </Button>
      </Tooltip>
    );
  };

  const renderListeningIndicator = () => {
    if (transcribing) {
      return (
        <div className="bg-zinc-800 dark:bg-zinc-900 text-white rounded-full gap-2 px-4 py-1 h-10 flex flex-row items-center text-sm md:text-base">
          <AudioWaveSpinner /> <p>Transcribing ...</p>
        </div>
      );
    }
    if (recording) {
      return (
        <div className="bg-zinc-800 dark:bg-zinc-900 text-white rounded-full gap-2 px-2 pr-4 py-1 h-10 flex flex-row items-center text-sm md:text-base">
          <AudioWaveSpinner />
          <p>Listening ...</p>
        </div>
      );
    }
  };

  return {
    recording,
    startRecording,
    stopRecording,
    text,
    transcribing,
    renderRecordingControls,
    renderListeningIndicator,
    startVoiceRecording,
  };
};
