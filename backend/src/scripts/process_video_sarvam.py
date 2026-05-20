#!/usr/bin/env python3
"""
Video Processing Script using Sarvam AI APIs
Handles: Audio Extraction -> Sarvam Speech-to-Text-Translate -> Sarvam TTS -> Video Merge

This version uses Sarvam AI's hosted APIs for Indian language translation and TTS.
Get your API key at: https://dashboard.sarvam.ai/

API Endpoints Used:
- POST /speech-to-text-translate - Converts speech to text and translates in one call
- POST /text-to-speech - Converts translated text to speech
"""

# DEBUG: Print to stderr immediately
import sys
print("DEBUG: Python script starting", file=sys.stderr, flush=True)

try:
    import argparse
    print("DEBUG: Imported argparse", file=sys.stderr, flush=True)
    import json
    print("DEBUG: Imported json", file=sys.stderr, flush=True)
    import os
    print("DEBUG: Imported os", file=sys.stderr, flush=True)
    import sys
    print("DEBUG: Imported sys", file=sys.stderr, flush=True)
    import subprocess
    print("DEBUG: Imported subprocess", file=sys.stderr, flush=True)
    import tempfile
    print("DEBUG: Imported tempfile", file=sys.stderr, flush=True)
    import time
    print("DEBUG: Imported time", file=sys.stderr, flush=True)
    from pathlib import Path
    print("DEBUG: Imported pathlib", file=sys.stderr, flush=True)
    from typing import List, Dict, Optional
    print("DEBUG: Imported typing", file=sys.stderr, flush=True)
    import math
    print("DEBUG: Imported math", file=sys.stderr, flush=True)
    import requests
    print("DEBUG: Imported requests", file=sys.stderr, flush=True)
    import soundfile as sf
    print("DEBUG: Imported soundfile", file=sys.stderr, flush=True)
    import numpy as np
    print("DEBUG: Imported numpy", file=sys.stderr, flush=True)
except Exception as e:
    print(f"DEBUG: Import error: {e}", file=sys.stderr, flush=True)
    import traceback
    traceback.print_exc(file=sys.stderr)
    sys.exit(1)

print("DEBUG: All imports successful", file=sys.stderr, flush=True)

# Progress reporting
def emit_progress(stage: str, percentage: int, message: str, details: dict = None):
    """Emit progress as JSON to stdout"""
    progress = {
        "stage": stage,
        "percentage": percentage,
        "message": message,
        "details": details or {}
    }
    print(json.dumps(progress), flush=True)

class SarvamVideoProcessor:
    def __init__(self, video_path: str, output_dir: str, job_id: str,
                 source_lang: str = "auto", target_lang: str = "hi-IN",
                 generate_subtitles: bool = True):
        self.video_path = video_path
        self.output_dir = output_dir
        self.job_id = job_id
        self.source_lang = source_lang
        self.target_lang = target_lang
        self._generate_subtitles = generate_subtitles
        
        # Sarvam AI Configuration
        self.sarvam_api_key = os.environ.get("SARVAM_API_KEY")
        self.sarvam_base_url = os.environ.get("SARVAM_API_URL", "https://api.sarvam.ai")
        
        print(f"DEBUG: API Key present: {bool(self.sarvam_api_key)}", file=sys.stderr, flush=True)
        print(f"DEBUG: API Key length: {len(self.sarvam_api_key) if self.sarvam_api_key else 0}", file=sys.stderr, flush=True)
        print(f"DEBUG: API Key starts with: {self.sarvam_api_key[:10] if self.sarvam_api_key else 'None'}...", file=sys.stderr, flush=True)
        print(f"DEBUG: API URL: {self.sarvam_base_url}", file=sys.stderr, flush=True)
        
        if not self.sarvam_api_key:
            emit_progress("error", 0, "SARVAM_API_KEY not set. Get your key at https://dashboard.sarvam.ai/")
            raise ValueError("SARVAM_API_KEY environment variable is required")
        
        # Paths
        self.audio_path = os.path.join(output_dir, "extracted_audio.wav")
        self.transcription_path = os.path.join(output_dir, "transcription.json")
        self.translated_audio_dir = os.path.join(output_dir, "tts_segments")
        self.final_video_path = os.path.join(output_dir, "translated_video.mp4")
        self.subtitle_path = os.path.join(output_dir, "subtitles.srt") if generate_subtitles else None
        
        # Ensure directories exist
        os.makedirs(output_dir, exist_ok=True)
        os.makedirs(self.translated_audio_dir, exist_ok=True)
        
        # Language code mapping (internal to Sarvam format)
        self.lang_map = {
            "hi": "hi-IN",
            "kn": "kn-IN",
            "te": "te-IN",
            "ml": "ml-IN",
            "bn": "bn-IN",
            "gu": "gu-IN",
            "mr": "mr-IN",
            "od": "od-IN",
            "pa": "pa-IN",
            "as": "as-IN",
            "en": "en-IN",
            "auto": "auto"
        }
    
    def get_sarvam_headers(self):
        """Get headers for Sarvam API requests"""
        headers = {
            "API-Subscription-Key": self.sarvam_api_key,
            "Content-Type": "application/json"
        }
        print(f"DEBUG: Headers - API-Subscription-Key: {self.sarvam_api_key[:15]}...", file=sys.stderr, flush=True)
        return headers
    
    def run_ffmpeg(self, args: List[str], description: str = "FFmpeg operation") -> bool:
        """Run FFmpeg with given arguments"""
        cmd = ["ffmpeg", "-y"] + args
        print(f"DEBUG: Running FFmpeg: {' '.join(cmd[:5])}...", file=sys.stderr, flush=True)
        try:
            result = subprocess.run(
                cmd,
                capture_output=True,
                text=True,
                check=True
            )
            print(f"DEBUG: FFmpeg succeeded", file=sys.stderr, flush=True)
            return True
        except subprocess.CalledProcessError as e:
            print(f"DEBUG: FFmpeg failed: {e.stderr[:1000]}", file=sys.stderr, flush=True)
            emit_progress("error", 0, f"{description} failed: {e.stderr[:500]}")
            return False
    
    def extract_audio(self) -> bool:
        """Extract audio from video using FFmpeg"""
        print(f"DEBUG: extract_audio() - video_path: {self.video_path}", file=sys.stderr, flush=True)
        print(f"DEBUG: extract_audio() - audio_path: {self.audio_path}", file=sys.stderr, flush=True)
        print(f"DEBUG: extract_audio() - Checking if video exists: {os.path.exists(self.video_path)}", file=sys.stderr, flush=True)
        
        emit_progress("audio_extraction", 15, "Extracting audio from video...")
        
        args = [
            "-i", self.video_path,
            "-vn",
            "-acodec", "pcm_s16le",
            "-ar", "16000",
            "-ac", "1",
            self.audio_path
        ]
        
        success = self.run_ffmpeg(args, "Audio extraction")
        if success:
            emit_progress("audio_extraction", 25, "Audio extracted successfully")
        return success
    
    def chunk_audio(self, chunk_duration: int = 30) -> List[Dict]:
        """Split audio into chunks for processing"""
        import wave
        
        chunks = []
        with wave.open(self.audio_path, 'rb') as wav_file:
            n_channels = wav_file.getnchannels()
            sample_width = wav_file.getsampwidth()
            frame_rate = wav_file.getframerate()
            n_frames = wav_file.getnframes()
            
            duration = n_frames / frame_rate
            chunk_frames = int(chunk_duration * frame_rate)
            
            chunk_idx = 0
            current_frame = 0
            
            while current_frame < n_frames:
                end_frame = min(current_frame + chunk_frames, n_frames)
                chunk_data = wav_file.readframes(end_frame - current_frame)
                
                chunk_path = os.path.join(self.output_dir, f"chunk_{chunk_idx}.wav")
                with wave.open(chunk_path, 'wb') as chunk_file:
                    chunk_file.setnchannels(n_channels)
                    chunk_file.setsampwidth(sample_width)
                    chunk_file.setframerate(frame_rate)
                    chunk_file.writeframes(chunk_data)
                
                chunks.append({
                    "id": chunk_idx,
                    "path": chunk_path,
                    "start_time": current_frame / frame_rate,
                    "end_time": end_frame / frame_rate,
                    "duration": (end_frame - current_frame) / frame_rate
                })
                
                current_frame = end_frame
                chunk_idx += 1
        
        return chunks
    
    def speech_to_text_translate(self, audio_path: str, chunk_info: Dict) -> Optional[Dict]:
        """Use Sarvam AI Speech-to-Text-Translate API"""
        print(f"DEBUG: speech_to_text_translate() - audio_path: {audio_path}", file=sys.stderr, flush=True)
        url = f"{self.sarvam_base_url}/speech-to-text-translate"
        
        # Sarvam supports auto-detection with source_language_code="unknown"
        source_lang = self.lang_map.get(self.source_lang, "unknown")
        if self.source_lang == "auto":
            source_lang = "unknown"
        
        target_lang = self.lang_map.get(self.target_lang, "hi-IN")
        print(f"DEBUG: API call - source: {source_lang}, target: {target_lang}", file=sys.stderr, flush=True)
        
        # Prepare multipart/form-data
        try:
            with open(audio_path, 'rb') as audio_file:
                files = {
                    'file': ('audio.wav', audio_file, 'audio/wav')
                }
                data = {
                    'source_language_code': source_lang,
                    'target_language_code': target_lang,
                    'model': 'saaras:v3'  # Using v3 for better translation support
                }
                # Headers without Content-Type (requests sets it automatically for multipart)
                headers = {
                    'API-Subscription-Key': self.sarvam_api_key
                }
                print(f"DEBUG: Making API request to {url}", file=sys.stderr, flush=True)
                response = requests.post(url, headers=headers, files=files, data=data, timeout=60)
                print(f"DEBUG: API response status: {response.status_code}", file=sys.stderr, flush=True)
            
            if response.status_code == 200:
                result = response.json()
                transcript = result.get("transcript", "")
                translated_transcript = result.get("translated_transcript", "")
                detected_source = result.get("source_language_code", source_lang)
                print(f"DEBUG: API success - transcript: {transcript[:100]}...", file=sys.stderr, flush=True)
                print(f"DEBUG: API success - translated_transcript: {translated_transcript[:100] if translated_transcript else 'EMPTY'}...", file=sys.stderr, flush=True)
                print(f"DEBUG: API success - detected_source: {detected_source}, target: {target_lang}", file=sys.stderr, flush=True)
                
                # If translated_transcript is empty or same as transcript, we need to translate
                if not translated_transcript or translated_transcript.strip() == transcript.strip():
                    print(f"DEBUG: No translation from STT API, using fallback translation", file=sys.stderr, flush=True)
                    translated_transcript = self.translate_text(transcript, detected_source, target_lang)
                
                final_translated = translated_transcript if translated_transcript else transcript
                return {
                    "original_text": transcript,
                    "translated_text": final_translated,
                    "source_language": detected_source,
                    "target_language": target_lang
                }
            else:
                print(f"DEBUG: API error - {response.status_code}: {response.text[:200]}", file=sys.stderr, flush=True)
                emit_progress("error", 0, f"Sarvam API error: {response.status_code} - {response.text[:200]}")
                return None
        except Exception as e:
            print(f"DEBUG: API request failed: {e}", file=sys.stderr, flush=True)
            emit_progress("error", 0, f"Speech-to-text-translate failed: {str(e)}")
            return None
    
    def translate_text(self, text: str, source_lang: str, target_lang: str) -> str:
        """Use Sarvam AI Translate API for text translation"""
        if not text or not text.strip():
            return text
        
        url = f"{self.sarvam_base_url}/translate"
        
        # Prepare the payload
        payload = {
            "input": text,
            "source_language_code": source_lang if source_lang != "unknown" else "en-IN",
            "target_language_code": target_lang,
            "model": "mayura:v1"  # Using mayura model for translation
        }
        
        print(f"DEBUG: Translating text - source: {source_lang}, target: {target_lang}", file=sys.stderr, flush=True)
        print(f"DEBUG: Text to translate: {text[:100]}...", file=sys.stderr, flush=True)
        
        try:
            response = requests.post(url, headers=self.get_sarvam_headers(), json=payload, timeout=30)
            
            if response.status_code == 200:
                result = response.json()
                translated = result.get("translated_text", "")
                if translated:
                    print(f"DEBUG: Translation successful: {translated[:100]}...", file=sys.stderr, flush=True)
                    return translated
                else:
                    print(f"DEBUG: Translation API returned empty result", file=sys.stderr, flush=True)
                    return text
            else:
                print(f"DEBUG: Translation API error: {response.status_code} - {response.text[:200]}", file=sys.stderr, flush=True)
                return text
        except Exception as e:
            print(f"DEBUG: Translation failed: {e}", file=sys.stderr, flush=True)
            return text
   
    def transcribe_and_translate(self) -> Optional[List[Dict]]:
        """Process audio using Sarvam AI Speech-to-Text-Translate API"""
        print("DEBUG: transcribe_and_translate() starting", file=sys.stderr, flush=True)
        emit_progress("transcription", 30, "Processing speech with Sarvam AI...")
        
        # Split audio into chunks
        print("DEBUG: Chunking audio...", file=sys.stderr, flush=True)
        chunks = self.chunk_audio(chunk_duration=30)
        total_chunks = len(chunks)
        print(f"DEBUG: Created {total_chunks} chunks", file=sys.stderr, flush=True)
        
        if total_chunks == 0:
            emit_progress("error", 0, "No audio chunks created")
            return None
        
        translated_segments = []
        
        for i, chunk in enumerate(chunks):
            emit_progress("transcription", 30 + int((i / total_chunks) * 25), 
                         f"Processing audio chunk {i+1}/{total_chunks}...")
            
            result = self.speech_to_text_translate(chunk["path"], chunk)
            
            if result and result.get("translated_text"):
                translated_segments.append({
                    "id": i,
                    "start": chunk["start_time"],
                    "end": chunk["end_time"],
                    "original_text": result.get("original_text", ""),
                    "translated_text": result["translated_text"],
                    "source_language": result.get("source_language", "unknown")
                })
            
            # Clean up chunk file
            if os.path.exists(chunk["path"]):
                os.remove(chunk["path"])
            
            time.sleep(0.5)  # Rate limiting
        
        if translated_segments:
            first_seg_lang = translated_segments[0].get("source_language", "unknown")
            first_seg_target = translated_segments[0].get("target_language", self.target_lang)
            print(f"DEBUG: Transcription complete - detected source: {first_seg_lang}, target: {first_seg_target}", file=sys.stderr, flush=True)
            print(f"DEBUG: Sample translation: {translated_segments[0].get('translated_text', '')[:100]}...", file=sys.stderr, flush=True)
            emit_progress("transcription", 55, 
                         f"Transcription complete. Translating to {self.target_lang}...",
                         {"detectedLanguage": first_seg_lang,
                          "targetLanguage": first_seg_target,
                          "segmentsCount": len(translated_segments)})
        
        return translated_segments if translated_segments else None
    
    def text_to_speech(self, translated_segments: List[Dict]) -> Optional[str]:
        """Convert translated text to speech using Sarvam AI TTS API"""
        emit_progress("tts", 75, f"Generating speech in {self.target_lang} with Sarvam AI TTS...")
        
        url = f"{self.sarvam_base_url}/text-to-speech"
        target_lang = self.lang_map.get(self.target_lang, "hi-IN")
        
        print(f"DEBUG: TTS starting - target_lang: {target_lang}, segments: {len(translated_segments)}", file=sys.stderr, flush=True)
        if translated_segments:
            print(f"DEBUG: TTS first segment text: {translated_segments[0].get('translated_text', '')[:100]}...", file=sys.stderr, flush=True)
        
        audio_segments = []
        total_segments = len(translated_segments)
        
        for i, seg in enumerate(translated_segments):
            text = seg["translated_text"]
            if not text.strip():
                continue
            
            emit_progress("tts", 75 + int((i / total_segments) * 15),
                         f"Generating audio for segment {i+1}/{total_segments}...")
            
            # Try different speakers if the first one fails
            speakers = ["vidya", "neha", "anushka"]
            segment_success = False
            
            for speaker in speakers:
                if segment_success:
                    break
                    
                payload = {
                    "inputs": [text],
                    "target_language_code": target_lang,
                    "speaker": speaker,
                    "pitch": 0,
                    "pace": 1.0,
                    "loudness": 1.0,
                    "speech_sample_rate": 22050,
                    "enable_preprocessing": True,
                    "model": "bulbul:v2"
                }
                
                print(f"DEBUG: TTS segment {i}, speaker {speaker} - About to make API call", file=sys.stderr, flush=True)
                print(f"DEBUG: TTS text preview: {text[:50]}...", file=sys.stderr, flush=True)
                
                try:
                    response = requests.post(url, headers=self.get_sarvam_headers(), json=payload, timeout=60)
                    print(f"DEBUG: TTS response status: {response.status_code}", file=sys.stderr, flush=True)
                    
                    if response.status_code == 200:
                        result = response.json()
                        audios = result.get("audios", [])
                        print(f"DEBUG: TTS audios count: {len(audios)}", file=sys.stderr, flush=True)
                        
                        if audios:
                            # Decode base64 audio
                            import base64
                            audio_data = base64.b64decode(audios[0])
                            print(f"DEBUG: TTS decoded audio length: {len(audio_data)}", file=sys.stderr, flush=True)
                            
                            segment_path = os.path.join(self.translated_audio_dir, f"segment_{seg['id']}.wav")
                            with open(segment_path, 'wb') as f:
                                f.write(audio_data)
                            print(f"DEBUG: TTS success with speaker {speaker}", file=sys.stderr, flush=True)
                            
                            audio_segments.append({
                                "path": segment_path,
                                "start": seg["start"],
                                "end": seg["end"]
                            })
                            segment_success = True
                        else:
                            print(f"DEBUG: TTS - no audios in response for speaker {speaker}", file=sys.stderr, flush=True)
                    else:
                        print(f"DEBUG: TTS API error with speaker {speaker}: {response.status_code}", file=sys.stderr, flush=True)
                        
                except Exception as e:
                    print(f"DEBUG: TTS exception with speaker {speaker}: {type(e).__name__}: {str(e)[:100]}", file=sys.stderr, flush=True)
                    continue
            
            # If all speakers failed, create silence
            if not segment_success:
                print(f"DEBUG: TTS - All speakers failed for segment {i}, creating silence", file=sys.stderr, flush=True)
                self._create_silence(seg, i)
        
        print(f"DEBUG: TTS complete - audio_segments count: {len(audio_segments)}", file=sys.stderr, flush=True)
        
        if not audio_segments:
            emit_progress("error", 0, "TTS failed for all segments")
            print(f"DEBUG: TTS returning None (no audio segments)", file=sys.stderr, flush=True)
            return None
        
        # Concatenate all audio segments
        final_audio_path = os.path.join(self.output_dir, "translated_audio.wav")
        print(f"DEBUG: TTS concatenating {len(audio_segments)} segments to {final_audio_path}", file=sys.stderr, flush=True)
        self.concatenate_audio_files(audio_segments, final_audio_path)
        
        emit_progress("tts", 90, "Text-to-speech conversion complete")
        print(f"DEBUG: TTS returning {final_audio_path}", file=sys.stderr, flush=True)
        return final_audio_path
    
    def _create_silence(self, seg: Dict, idx: int):
        """Create silence audio for failed segments"""
        duration = max(seg["end"] - seg["start"], 1.0)
        sample_rate = 22050
        silence = np.zeros(int(duration * sample_rate))
        segment_path = os.path.join(self.translated_audio_dir, f"segment_{seg['id']}.wav")
        sf.write(segment_path, silence, sample_rate)
    
    def concatenate_audio_files(self, segments: List[Dict], output_path: str):
        """Concatenate multiple audio files using FFmpeg"""
        concat_file = os.path.join(self.output_dir, "concat_list.txt")
        with open(concat_file, 'w') as f:
            for seg in segments:
                f.write(f"file '{seg['path']}'\n")
        
        cmd = [
            "ffmpeg", "-y", "-f", "concat", "-safe", "0",
            "-i", concat_file,
            "-c", "copy",
            output_path
        ]
        subprocess.run(cmd, capture_output=True)
        os.remove(concat_file)
    
    def generate_subtitles(self, translated_segments: List[Dict]) -> bool:
        """Generate SRT subtitle file from translated segments"""
        if not self._generate_subtitles or not self.subtitle_path:
            return False
        
        def format_time(seconds: float) -> str:
            hours = int(seconds // 3600)
            minutes = int((seconds % 3600) // 60)
            secs = int(seconds % 60)
            millis = int((seconds % 1) * 1000)
            return f"{hours:02d}:{minutes:02d}:{secs:02d},{millis:03d}"
        
        with open(self.subtitle_path, 'w', encoding='utf-8') as f:
            for seg in translated_segments:
                f.write(f"{seg['id'] + 1}\n")
                f.write(f"{format_time(seg['start'])} --> {format_time(seg['end'])}\n")
                f.write(f"{seg['translated_text']}\n\n")
        
        return True
    
    def merge_final_video(self, translated_audio_path: str) -> bool:
        """Merge translated audio with original video"""
        emit_progress("merging", 95, "Merging audio and video...")
        
        # Debug file existence
        print(f"DEBUG: merge_final_video() - video_path: {self.video_path}, exists: {os.path.exists(self.video_path)}", file=sys.stderr, flush=True)
        print(f"DEBUG: merge_final_video() - audio_path: {translated_audio_path}, exists: {os.path.exists(translated_audio_path)}", file=sys.stderr, flush=True)
        print(f"DEBUG: merge_final_video() - subtitle_path: {self.subtitle_path}, exists: {os.path.exists(self.subtitle_path) if self.subtitle_path else 'N/A'}", file=sys.stderr, flush=True)
        
        # Build FFmpeg command - all inputs first, then mappings
        has_subtitles = self.subtitle_path and os.path.exists(self.subtitle_path)
        
        args = [
            "-i", self.video_path,
            "-i", translated_audio_path,
        ]
        
        if has_subtitles:
            args.extend(["-i", self.subtitle_path])
        
        # Add codec and mapping options
        args.extend([
            "-c:v", "copy",
            "-c:a", "aac",
            "-b:a", "192k",
            "-map", "0:v:0",
            "-map", "1:a:0",
        ])
        
        if has_subtitles:
            args.extend([
                "-c:s", "mov_text",
                "-metadata:s:s:0", f"language={self.target_lang}",
                "-map", "2:s:0"
            ])
        
        args.extend(["-shortest", self.final_video_path])
        
        print(f"DEBUG: FFmpeg command: {args}", file=sys.stderr, flush=True)
        
        success = self.run_ffmpeg(args, "Video merging")
        if success:
            emit_progress("merging", 100, "Video merging complete")
        return success
    
    def process(self) -> bool:
        """Run the complete processing pipeline using Sarvam AI"""
        try:
            print("DEBUG: process() starting", file=sys.stderr, flush=True)
            print(f"DEBUG: Configuration - source_lang: {self.source_lang}, target_lang: {self.target_lang}", file=sys.stderr, flush=True)
            print(f"DEBUG: Mapped languages - source: {self.lang_map.get(self.source_lang, 'unknown')}, target: {self.lang_map.get(self.target_lang, 'hi-IN')}", file=sys.stderr, flush=True)
            emit_progress("starting", 10, f"Starting translation to {self.target_lang}...")
            
            # Step 1: Extract audio
            print("DEBUG: Step 1 - Extracting audio", file=sys.stderr, flush=True)
            if not self.extract_audio():
                print("DEBUG: Step 1 - extract_audio() returned False", file=sys.stderr, flush=True)
                return False
            print("DEBUG: Step 1 - Audio extracted successfully", file=sys.stderr, flush=True)
            
            # Step 2: Transcribe and Translate (combined Sarvam API call)
            print("DEBUG: Step 2 - Transcribing and translating", file=sys.stderr, flush=True)
            translated_segments = self.transcribe_and_translate()
            if not translated_segments:
                print("DEBUG: Step 2 - transcribe_and_translate() returned None/False", file=sys.stderr, flush=True)
                return False
            
            if len(translated_segments) == 0:
                emit_progress("error", 0, "No speech detected in video")
                print("DEBUG: Step 2 - No segments returned", file=sys.stderr, flush=True)
                return False
            print(f"DEBUG: Step 2 - Got {len(translated_segments)} segments", file=sys.stderr, flush=True)
            
            # Step 3: Text to Speech (Sarvam TTS API)
            print("DEBUG: Step 3 - Starting TTS", file=sys.stderr, flush=True)
            translated_audio_path = self.text_to_speech(translated_segments)
            
            if not translated_audio_path:
                print("DEBUG: Step 3 - text_to_speech() returned None, attempting fallback to original audio", file=sys.stderr, flush=True)
                # Fallback: use original extracted audio instead of failing completely
                if os.path.exists(self.audio_path):
                    translated_audio_path = self.audio_path
                    print(f"DEBUG: Step 3 - Using original audio as fallback: {translated_audio_path}", file=sys.stderr, flush=True)
                    emit_progress("tts", 80, "TTS failed, using original audio with subtitles...")
                else:
                    print("DEBUG: Step 3 - No audio available, cannot continue", file=sys.stderr, flush=True)
                    return False
            else:
                print(f"DEBUG: Step 3 - TTS complete: {translated_audio_path}", file=sys.stderr, flush=True)
            
            # Step 4: Generate subtitles
            if self._generate_subtitles:
                print("DEBUG: Step 4 - Generating subtitles", file=sys.stderr, flush=True)
                self.generate_subtitles(translated_segments)
            
            # Step 5: Merge final video
            print("DEBUG: Step 5 - Merging final video", file=sys.stderr, flush=True)
            if not self.merge_final_video(translated_audio_path):
                print("DEBUG: Step 5 - merge_final_video() returned False", file=sys.stderr, flush=True)
                return False
            print("DEBUG: Step 5 - Video merged successfully", file=sys.stderr, flush=True)
            
            emit_progress("completed", 100, "Video translation completed successfully!")
            return True
            
        except Exception as e:
            print(f"DEBUG: Exception in process(): {e}", file=sys.stderr, flush=True)
            import traceback
            traceback.print_exc(file=sys.stderr)
            emit_progress("error", 0, f"Processing failed: {str(e)}")
            return False


def main():
    print("DEBUG: Entering main()", file=sys.stderr, flush=True)
    try:
        parser = argparse.ArgumentParser(description="Process video using Sarvam AI APIs")
        parser.add_argument("--video_path", required=True, help="Path to input video")
        parser.add_argument("--output_dir", required=True, help="Output directory")
        parser.add_argument("--job_id", required=True, help="Job ID")
        parser.add_argument("--source_lang", default="auto", help="Source language code")
        parser.add_argument("--target_lang", default="hi-IN", help="Target language code")
        parser.add_argument("--generate_subtitles", action="store_true", help="Generate subtitle file")
        
        print("DEBUG: Parsing arguments", file=sys.stderr, flush=True)
        args = parser.parse_args()
        print(f"DEBUG: Arguments parsed - job_id: {args.job_id}", file=sys.stderr, flush=True)
        
        # Debug info
        emit_progress("startup", 5, f"Starting processing for job {args.job_id}")
        emit_progress("startup", 5, f"Video: {args.video_path}")
        emit_progress("startup", 5, f"Output: {args.output_dir}")
        emit_progress("startup", 5, f"Source: {args.source_lang} -> Target: {args.target_lang}")
        
        print("DEBUG: Creating processor", file=sys.stderr, flush=True)
        processor = SarvamVideoProcessor(
            video_path=args.video_path,
            output_dir=args.output_dir,
            job_id=args.job_id,
            source_lang=args.source_lang,
            target_lang=args.target_lang,
            generate_subtitles=args.generate_subtitles
        )
        
        print("DEBUG: Starting processor.process()", file=sys.stderr, flush=True)
        success = processor.process()
        print(f"DEBUG: process() returned: {success}", file=sys.stderr, flush=True)
        sys.exit(0 if success else 1)
    except Exception as e:
        print(f"DEBUG: Fatal error: {e}", file=sys.stderr, flush=True)
        import traceback
        traceback.print_exc(file=sys.stderr)
        emit_progress("error", 0, f"Fatal error: {str(e)}")
        emit_progress("error", 0, f"Traceback: {traceback.format_exc()}")
        sys.exit(1)


print("DEBUG: Script loaded, checking __name__", file=sys.stderr, flush=True)
if __name__ == "__main__":
    print("DEBUG: __name__ == __main__, calling main()", file=sys.stderr, flush=True)
    main()
