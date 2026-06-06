import React, { useState, useRef, useEffect } from 'react';
import { 
  Upload, 
  Download, 
  Plus, 
  Trash2, 
  RotateCcw, 
  Type, 
  Layout, 
  Palette, 
  Image as ImageIcon, 
  Smile,
  Camera,
  Video
} from 'lucide-react';
import { useLanguage } from '../context/LanguageContext';

// Types & Interfaces
type AspectRatio = '9:16' | '1:1' | '4:5';
type TextureType = 'none' | 'grain' | 'paper' | 'scratches';
type FilterType = 'none' | 'vintage' | 'bw' | 'warm' | 'cool' | 'sepia';
type FontStyle = 'serif' | 'sans' | 'cursive' | 'typewriter';

interface MediaSlot {
  id: number;
  imageSrc: string | null;
  videoSrc: string | null;
  scale: number;      // 1.0 to 4.0
  offsetX: number;    // in pixels
  offsetY: number;    // in pixels
  filter: FilterType;
}

interface TextBox {
  id: string;
  text: string;
  x: number;          // percent (0-100)
  y: number;          // percent (0-100)
  font: FontStyle;
  size: number;        // display size in px (e.g. 14 to 72)
  color: string;
  spacing: number;    // letter spacing
  align: 'left' | 'center' | 'right';
  opacity: number;    // 0 to 1
}

interface TapeSticker {
  id: string;
  x: number;          // percent
  y: number;          // percent
  rotate: number;     // degrees
  color: string;      // rgba color
}

interface TemplateSlotConfig {
  id: number;
  x: number;          // percent
  y: number;          // percent
  w: number;          // percent
  h: number;          // percent
  type: 'rect' | 'polaroid' | 'film';
  rotate?: number;     // for tilted templates
  paddingBottom?: number; // for polaroid label margin
}

interface TemplateConfig {
  id: string;
  nameVi: string;
  nameEn: string;
  slots: TemplateSlotConfig[];
  defaultTexts?: Omit<TextBox, 'id'>[];
  defaultTapes?: TapeSticker[];
}

// Predefined background options
const SOLID_COLORS = [
  { name: 'Cream', value: '#FAF6EE' },
  { name: 'Sage', value: '#E3E8E3' },
  { name: 'Dusty Pink', value: '#F8E8E8' },
  { name: 'Sand', value: '#F0E5D8' },
  { name: 'Soft Grey', value: '#EAEAEA' },
  { name: 'Charcoal', value: '#27272A' },
  { name: 'Warm White', value: '#FAFAFA' }
];

const GRADIENTS = [
  { name: 'Warm Sunset', value: 'linear-gradient(135deg, #FFDEE9 0%, #B5FFFC 100%)' },
  { name: 'Rose Water', value: 'linear-gradient(135deg, #FAD9C1 0%, #F9A1BC 100%)' },
  { name: 'Soft Mint', value: 'linear-gradient(135deg, #E0F2F1 0%, #B2DFDB 100%)' },
  { name: 'Midnight Velvet', value: 'linear-gradient(135deg, #09090B 0%, #27272A 100%)' },
  { name: 'Peach Glow', value: 'linear-gradient(135deg, #FFE29F 0%, #FFA99F 100%)' }
];

// Layout templates definitions
const TEMPLATES: TemplateConfig[] = [
  {
    id: 'classic_minimal',
    nameVi: 'Cổ điển tối giản',
    nameEn: 'Classic Minimalist',
    slots: [
      { id: 0, x: 10, y: 8, w: 80, h: 70, type: 'rect' }
    ],
    defaultTexts: [
      { text: 'A SUMMER STORY', x: 50, y: 84, font: 'serif', size: 28, color: '#333333', spacing: 4, align: 'center', opacity: 0.9 }
    ]
  },
  {
    id: 'split_screen',
    nameVi: 'Chia đôi đối xứng',
    nameEn: 'Symmetrical Split',
    slots: [
      { id: 0, x: 0, y: 0, w: 49.5, h: 100, type: 'rect' },
      { id: 1, x: 50.5, y: 0, w: 49.5, h: 100, type: 'rect' }
    ],
    defaultTexts: [
      { text: '01', x: 25, y: 92, font: 'typewriter', size: 20, color: '#FFFFFF', spacing: 1, align: 'center', opacity: 0.8 },
      { text: '02', x: 75, y: 92, font: 'typewriter', size: 20, color: '#FFFFFF', spacing: 1, align: 'center', opacity: 0.8 }
    ]
  },
  {
    id: 'polaroid_duo',
    nameVi: 'Cặp đôi Polaroid',
    nameEn: 'Polaroid Duo',
    slots: [
      { id: 0, x: 8, y: 10, w: 50, h: 56, type: 'polaroid', rotate: -6, paddingBottom: 12 },
      { id: 1, x: 44, y: 34, w: 48, h: 54, type: 'polaroid', rotate: 4, paddingBottom: 12 }
    ],
    defaultTexts: [
      { text: 'happy moments', x: 30, y: 61, font: 'cursive', size: 24, color: '#27272A', spacing: 1, align: 'center', opacity: 0.8 },
      { text: 'with you 🤍', x: 68, y: 83, font: 'cursive', size: 24, color: '#27272A', spacing: 1, align: 'center', opacity: 0.8 }
    ],
    defaultTapes: [
      { id: 'tape_0', x: 24, y: 9, rotate: -25, color: 'rgba(250, 240, 230, 0.65)' },
      { id: 'tape_1', x: 62, y: 32, rotate: 15, color: 'rgba(235, 245, 255, 0.65)' }
    ]
  },
  {
    id: 'filmstrip_3',
    nameVi: 'Cuộn phim 3 khung',
    nameEn: 'Filmstrip 3-Grid',
    slots: [
      { id: 0, x: 18, y: 6, w: 64, h: 26, type: 'film' },
      { id: 1, x: 18, y: 37, w: 64, h: 26, type: 'film' },
      { id: 2, x: 18, y: 68, w: 64, h: 26, type: 'film' }
    ],
    defaultTexts: [
      { text: 'FUJIFILM SUPERIA 400', x: 50, y: 96, font: 'typewriter', size: 16, color: '#E11D48', spacing: 2, align: 'center', opacity: 0.95 }
    ]
  },
  {
    id: 'asymmetric_3',
    nameVi: 'Bố cục bất đối xứng',
    nameEn: 'Asymmetric Collage',
    slots: [
      { id: 0, x: 6, y: 8, w: 52, h: 84, type: 'rect' },
      { id: 1, x: 62, y: 8, w: 32, h: 39, type: 'rect' },
      { id: 2, x: 62, y: 53, w: 32, h: 39, type: 'rect' }
    ],
    defaultTexts: [
      { text: 'today was good.', x: 78, y: 94, font: 'serif', size: 20, color: '#333333', spacing: 1, align: 'center', opacity: 0.8 }
    ]
  }
];

export const StoryLabTool: React.FC = () => {
  const { lang, t } = useLanguage();

  // State values
  const [aspectRatio, setAspectRatio] = useState<AspectRatio>('9:16');
  const [selectedTemplate, setSelectedTemplate] = useState<TemplateConfig>(TEMPLATES[0]);
  const [backgroundType, setBackgroundType] = useState<'color' | 'gradient'>('color');
  const [backgroundVal, setBackgroundVal] = useState<string>('#FAF6EE');
  const [texture, setTexture] = useState<TextureType>('none');
  const [activeTab, setActiveTab] = useState<'layouts' | 'media' | 'text' | 'style'>('layouts');

  const [mediaSlots, setMediaSlots] = useState<Record<number, MediaSlot>>({
    0: { id: 0, imageSrc: null, videoSrc: null, scale: 1.0, offsetX: 0, offsetY: 0, filter: 'none' },
    1: { id: 1, imageSrc: null, videoSrc: null, scale: 1.0, offsetX: 0, offsetY: 0, filter: 'none' },
    2: { id: 2, imageSrc: null, videoSrc: null, scale: 1.0, offsetX: 0, offsetY: 0, filter: 'none' }
  });

  const [textBoxes, setTextBoxes] = useState<TextBox[]>([]);
  const [tapeStickers, setTapeStickers] = useState<TapeSticker[]>([]);
  
  // Selection states
  const [selectedSlotId, setSelectedSlotId] = useState<number | null>(0);
  const [selectedTextId, setSelectedTextId] = useState<string | null>(null);

  // Dragging states
  const [draggingTextId, setDraggingTextId] = useState<string | null>(null);
  const [draggingSlotId, setDraggingSlotId] = useState<number | null>(null);
  const dragStartPos = useRef({ x: 0, y: 0 });
  const dragStartOffsets = useRef({ x: 0, y: 0 });

  // Refs
  const workspaceCanvasRef = useRef<HTMLDivElement>(null);
  const exportCanvasRef = useRef<HTMLCanvasElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  
  // Element caches for video frame captures
  const videoElementsCache = useRef<Record<number, HTMLVideoElement>>({});

  // Camera Modal States
  const [isCameraOpen, setIsCameraOpen] = useState(false);
  const [showSourcePicker, setShowSourcePicker] = useState(false);
  const [cameraDevices, setCameraDevices] = useState<MediaDeviceInfo[]>([]);
  const [activeCameraId, setActiveCameraId] = useState<string>('');
  const [isRecording, setIsRecording] = useState(false);
  const [recordingDuration, setRecordingDuration] = useState(0);
  const [cameraStream, setCameraStream] = useState<MediaStream | null>(null);
  const [cameraErrorMsg, setCameraErrorMsg] = useState<string>('');

  const videoPreviewRef = useRef<HTMLVideoElement>(null);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const recordedChunksRef = useRef<Blob[]>([]);
  const recordingTimerRef = useRef<any>(null);

  // Cleanup camera stream on unmount
  useEffect(() => {
    return () => {
      if (cameraStream) {
        cameraStream.getTracks().forEach(track => track.stop());
      }
      if (recordingTimerRef.current) {
        clearInterval(recordingTimerRef.current);
      }
    };
  }, [cameraStream]);

  // Camera functions
  const openCameraModal = async () => {
    setIsCameraOpen(true);
    setCameraErrorMsg('');
    setRecordingDuration(0);
    setIsRecording(false);
    recordedChunksRef.current = [];

    try {
      let stream: MediaStream;
      try {
        stream = await navigator.mediaDevices.getUserMedia({ 
          video: { facingMode: 'user' }, 
          audio: true 
        });
      } catch (audioErr) {
        console.warn("Camera request with audio failed, trying video only...", audioErr);
        stream = await navigator.mediaDevices.getUserMedia({ 
          video: { facingMode: 'user' }, 
          audio: false 
        });
      }

      setCameraStream(stream);
      // Wait for a small timeout to let the modal ref mount
      setTimeout(() => {
        if (videoPreviewRef.current) {
          videoPreviewRef.current.srcObject = stream;
        }
      }, 100);

      // Enumerate available video inputs
      const devices = await navigator.mediaDevices.enumerateDevices();
      const videoDevices = devices.filter(d => d.kind === 'videoinput');
      setCameraDevices(videoDevices);
      if (videoDevices.length > 0 && !activeCameraId) {
        setActiveCameraId(videoDevices[0].deviceId);
      }
    } catch (err) {
      console.error("Failed to open camera:", err);
      setCameraErrorMsg(t('storylab.cameraError'));
    }
  };

  const switchCamera = async (deviceId: string) => {
    if (cameraStream) {
      cameraStream.getTracks().forEach(track => track.stop());
    }
    setActiveCameraId(deviceId);
    setRecordingDuration(0);
    setIsRecording(false);

    try {
      let stream: MediaStream;
      try {
        stream = await navigator.mediaDevices.getUserMedia({ 
          video: { deviceId: { exact: deviceId } }, 
          audio: true 
        });
      } catch (audioErr) {
        stream = await navigator.mediaDevices.getUserMedia({ 
          video: { deviceId: { exact: deviceId } }, 
          audio: false 
        });
      }

      setCameraStream(stream);
      if (videoPreviewRef.current) {
        videoPreviewRef.current.srcObject = stream;
      }
    } catch (err) {
      console.error("Failed to switch camera:", err);
      setCameraErrorMsg(t('storylab.cameraError'));
    }
  };

  const closeCameraModal = () => {
    if (cameraStream) {
      cameraStream.getTracks().forEach(track => track.stop());
    }
    if (recordingTimerRef.current) {
      clearInterval(recordingTimerRef.current);
    }
    setCameraStream(null);
    setIsCameraOpen(false);
    setIsRecording(false);
    setRecordingDuration(0);
  };

  const capturePhoto = () => {
    if (!videoPreviewRef.current || selectedSlotId === null) return;
    const video = videoPreviewRef.current;
    
    const canvas = document.createElement('canvas');
    canvas.width = video.videoWidth || 640;
    canvas.height = video.videoHeight || 480;
    
    const ctx = canvas.getContext('2d');
    if (ctx) {
      ctx.translate(canvas.width, 0);
      ctx.scale(-1, 1);
      ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
      
      const imageSrc = canvas.toDataURL('image/jpeg', 0.95);
      setMediaSlots(prev => ({
        ...prev,
        [selectedSlotId]: {
          ...prev[selectedSlotId],
          imageSrc,
          videoSrc: null
        }
      }));
      closeCameraModal();
    }
  };

  const startRecording = () => {
    if (!cameraStream || selectedSlotId === null) return;

    recordedChunksRef.current = [];
    let options: MediaRecorderOptions = {};
    if (MediaRecorder.isTypeSupported('video/webm;codecs=vp9')) {
      options = { mimeType: 'video/webm;codecs=vp9' };
    } else if (MediaRecorder.isTypeSupported('video/webm')) {
      options = { mimeType: 'video/webm' };
    } else if (MediaRecorder.isTypeSupported('video/mp4')) {
      options = { mimeType: 'video/mp4' };
    }

    try {
      const recorder = new MediaRecorder(cameraStream, options);
      mediaRecorderRef.current = recorder;

      recorder.ondataavailable = (e) => {
        if (e.data && e.data.size > 0) {
          recordedChunksRef.current.push(e.data);
        }
      };

      recorder.onstop = () => {
        const mime = options.mimeType || 'video/webm';
        const blob = new Blob(recordedChunksRef.current, { type: mime });
        const videoSrc = URL.createObjectURL(blob);

        // Preload video cache
        const video = document.createElement('video');
        video.src = videoSrc;
        video.loop = true;
        video.muted = true;
        video.playsInline = true;
        video.autoplay = true;
        video.play().catch(() => {});
        videoElementsCache.current[selectedSlotId] = video;

        setMediaSlots(prev => ({
          ...prev,
          [selectedSlotId]: {
            ...prev[selectedSlotId],
            imageSrc: null,
            videoSrc
          }
        }));
        closeCameraModal();
      };

      recorder.start();
      setIsRecording(true);
      setRecordingDuration(0);

      recordingTimerRef.current = setInterval(() => {
        setRecordingDuration(prev => {
          if (prev >= 8) {
            if (mediaRecorderRef.current && mediaRecorderRef.current.state !== 'inactive') {
              mediaRecorderRef.current.stop();
            }
            if (recordingTimerRef.current) clearInterval(recordingTimerRef.current);
            return 8;
          }
          return prev + 1;
        });
      }, 1000);

    } catch (err) {
      console.error("MediaRecorder setup error:", err);
    }
  };

  const stopRecording = () => {
    if (mediaRecorderRef.current && mediaRecorderRef.current.state !== 'inactive') {
      mediaRecorderRef.current.stop();
    }
    if (recordingTimerRef.current) {
      clearInterval(recordingTimerRef.current);
    }
  };

  // Append Google Fonts to head dynamically
  useEffect(() => {
    const linkId = 'storylab-google-fonts';
    if (!document.getElementById(linkId)) {
      const link = document.createElement('link');
      link.id = linkId;
      link.rel = 'stylesheet';
      link.href = 'https://fonts.googleapis.com/css2?family=Caveat:wght@600&family=Courier+Prime&family=Outfit:wght@400;600;800&family=Playfair+Display:ital,wght@0,500;0,700;1,400&display=swap';
      document.head.appendChild(link);
    }
  }, []);

  // Set default templates text/tape when template change
  useEffect(() => {
    applyTemplate(selectedTemplate);
  }, [selectedTemplate]);

  const applyTemplate = (tpl: TemplateConfig) => {
    // Reset media offsets but keep loaded source images/videos for slots
    const updatedSlots = { ...mediaSlots };
    tpl.slots.forEach(slot => {
      if (!updatedSlots[slot.id]) {
        updatedSlots[slot.id] = { id: slot.id, imageSrc: null, videoSrc: null, scale: 1.0, offsetX: 0, offsetY: 0, filter: 'none' };
      } else {
        updatedSlots[slot.id] = { ...updatedSlots[slot.id], scale: 1.0, offsetX: 0, offsetY: 0 };
      }
    });
    setMediaSlots(updatedSlots);

    // Apply default text boxes
    if (tpl.defaultTexts) {
      const texts = tpl.defaultTexts.map((txt, index) => ({
        ...txt,
        id: `text_${tpl.id}_${index}`
      }));
      setTextBoxes(texts);
      setSelectedTextId(texts[0]?.id || null);
    } else {
      setTextBoxes([]);
      setSelectedTextId(null);
    }

    // Apply default stickers (tape strips)
    if (tpl.defaultTapes) {
      setTapeStickers(tpl.defaultTapes);
    } else {
      setTapeStickers([]);
    }
    
    // Select first slot by default
    if (tpl.slots.length > 0) {
      setSelectedSlotId(tpl.slots[0].id);
    } else {
      setSelectedSlotId(null);
    }
  };

  // File loading
  const triggerMediaUpload = (slotId: number) => {
    setSelectedSlotId(slotId);
    setShowSourcePicker(true);
  };

  const triggerMultiMediaUpload = () => {
    // If no slot is selected, default to the first slot as starting index
    if (selectedSlotId === null && selectedTemplate.slots.length > 0) {
      setSelectedSlotId(0);
    }
    fileInputRef.current?.click();
  };

  const loadMediaFileForSlot = (file: File, slotId: number) => {
    const reader = new FileReader();
    const isVideo = file.type.startsWith('video/');
    const isImage = file.type.startsWith('image/');

    if (isImage) {
      reader.onload = (event) => {
        setMediaSlots(prev => ({
          ...prev,
          [slotId]: {
            ...prev[slotId],
            imageSrc: event.target?.result as string,
            videoSrc: null
          }
        }));
      };
      reader.readAsDataURL(file);
    } else if (isVideo) {
      const url = URL.createObjectURL(file);
      
      // Cache the video element immediately
      const video = document.createElement('video');
      video.src = url;
      video.loop = true;
      video.muted = true;
      video.playsInline = true;
      video.autoplay = true;
      video.play().catch(() => {});
      videoElementsCache.current[slotId] = video;

      setMediaSlots(prev => ({
        ...prev,
        [slotId]: {
          ...prev[slotId],
          imageSrc: null,
          videoSrc: url
        }
      }));
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;

    const fileArray = Array.from(files);

    if (fileArray.length === 1 && selectedSlotId !== null) {
      // Single selection: load into current slot
      loadMediaFileForSlot(fileArray[0], selectedSlotId);
    } else {
      // Multiple selection: auto populate empty slots starting from current selection or slot 0
      const startSlotId = selectedSlotId !== null ? selectedSlotId : 0;
      const totalSlots = selectedTemplate.slots.length;

      fileArray.forEach((file, index) => {
        const targetSlotId = (startSlotId + index) % totalSlots;
        loadMediaFileForSlot(file, targetSlotId);
      });
    }
    
    // reset input
    if (e.target) e.target.value = '';
  };

  const removeSlotMedia = (slotId: number) => {
    setMediaSlots(prev => ({
      ...prev,
      [slotId]: {
        ...prev[slotId],
        imageSrc: null,
        videoSrc: null,
        scale: 1.0,
        offsetX: 0,
        offsetY: 0
      }
    }));
    if (videoElementsCache.current[slotId]) {
      delete videoElementsCache.current[slotId];
    }
  };

  // Text utilities
  const addTextBox = () => {
    const newText: TextBox = {
      id: `text_box_${Date.now()}`,
      text: t('storylab.textPlaceholder'),
      x: 50,
      y: 50,
      font: 'serif',
      size: 24,
      color: backgroundVal === '#27272A' ? '#FFFFFF' : '#27272A',
      spacing: 2,
      align: 'center',
      opacity: 1
    };
    setTextBoxes(prev => [...prev, newText]);
    setSelectedTextId(newText.id);
    setActiveTab('text');
  };

  const updateSelectedTextBox = (fields: Partial<TextBox>) => {
    if (!selectedTextId) return;
    setTextBoxes(prev => prev.map(tBox => {
      if (tBox.id === selectedTextId) {
        return { ...tBox, ...fields };
      }
      return tBox;
    }));
  };

  const deleteSelectedTextBox = () => {
    if (!selectedTextId) return;
    setTextBoxes(prev => prev.filter(tBox => tBox.id !== selectedTextId));
    setSelectedTextId(null);
  };

  // Stickers utilities
  const addTapeSticker = () => {
    const newTape: TapeSticker = {
      id: `tape_${Date.now()}`,
      x: 35 + Math.random() * 30, // center areas
      y: 35 + Math.random() * 30,
      rotate: -30 + Math.random() * 60,
      color: 'rgba(250, 240, 230, 0.65)' // Default paper colored masking tape
    };
    setTapeStickers(prev => [...prev, newTape]);
  };

  const removeTapeSticker = (id: string) => {
    setTapeStickers(prev => prev.filter(tape => tape.id !== id));
  };

  // Dragging event handlers
  const handleCanvasMouseMove = (e: React.MouseEvent) => {
    if (draggingTextId && workspaceCanvasRef.current) {
      const rect = workspaceCanvasRef.current.getBoundingClientRect();
      const deltaX = e.clientX - dragStartPos.current.x;
      const deltaY = e.clientY - dragStartPos.current.y;
      
      const pctDeltaX = (deltaX / rect.width) * 100;
      const pctDeltaY = (deltaY / rect.height) * 100;

      setTextBoxes(prev => prev.map(tBox => {
        if (tBox.id === draggingTextId) {
          return {
            ...tBox,
            x: Math.max(0, Math.min(100, dragStartOffsets.current.x + pctDeltaX)),
            y: Math.max(0, Math.min(100, dragStartOffsets.current.y + pctDeltaY))
          };
        }
        return tBox;
      }));
    } else if (draggingSlotId !== null) {
      const deltaX = e.clientX - dragStartPos.current.x;
      const deltaY = e.clientY - dragStartPos.current.y;

      setMediaSlots(prev => ({
        ...prev,
        [draggingSlotId]: {
          ...prev[draggingSlotId],
          offsetX: dragStartOffsets.current.x + deltaX,
          offsetY: dragStartOffsets.current.y + deltaY
        }
      }));
    }
  };

  const handleCanvasMouseUp = () => {
    setDraggingTextId(null);
    setDraggingSlotId(null);
  };

  const handleTextMouseDown = (e: React.MouseEvent, tBox: TextBox) => {
    e.stopPropagation();
    setSelectedTextId(tBox.id);
    setDraggingTextId(tBox.id);
    dragStartPos.current = { x: e.clientX, y: e.clientY };
    dragStartOffsets.current = { x: tBox.x, y: tBox.y };
  };

  const handleSlotMouseDown = (e: React.MouseEvent, slotId: number) => {
    const slot = mediaSlots[slotId];
    if (!slot || (!slot.imageSrc && !slot.videoSrc)) return;
    
    setSelectedSlotId(slotId);
    setDraggingSlotId(slotId);
    dragStartPos.current = { x: e.clientX, y: e.clientY };
    dragStartOffsets.current = { x: slot.offsetX, y: slot.offsetY };
  };

  // Helper mapping Font style to CSS font family stack
  const getFontFamilyStack = (style: FontStyle) => {
    switch(style) {
      case 'serif': return '"Playfair Display", "Georgia", serif';
      case 'sans': return '"Outfit", "Inter", sans-serif';
      case 'cursive': return '"Caveat", "Brush Script MT", cursive';
      case 'typewriter': return '"Courier Prime", "Courier New", monospace';
    }
  };

  // Render direct helper for CSS canvas filter class
  const getFilterStyle = (filterType: FilterType) => {
    switch (filterType) {
      case 'vintage': return 'contrast(1.15) sepia(0.25) saturate(0.85)';
      case 'bw': return 'grayscale(1)';
      case 'warm': return 'sepia(0.2) saturate(1.1) hue-rotate(-5deg)';
      case 'cool': return 'saturate(0.9) hue-rotate(5deg)';
      case 'sepia': return 'sepia(1)';
      default: return 'none';
    }
  };

  // High resolution Canvas drawing & export
  const exportStory = async () => {
    const canvas = exportCanvasRef.current;
    if (!canvas) return;

    // Export sizing
    let exportW = 1080;
    let exportH = 1920; // 9:16
    if (aspectRatio === '1:1') {
      exportH = 1080;
    } else if (aspectRatio === '4:5') {
      exportH = 1350;
    }

    canvas.width = exportW;
    canvas.height = exportH;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    ctx.clearRect(0, 0, exportW, exportH);

    // 1. Draw Background
    if (backgroundType === 'color') {
      ctx.fillStyle = backgroundVal;
      ctx.fillRect(0, 0, exportW, exportH);
    } else {
      // Simple gradient generator
      // Create gradient representing common modern CSS styles
      let gradient;
      if (backgroundVal.includes('#FFDEE9')) {
        gradient = ctx.createLinearGradient(0, 0, exportW, exportH);
        gradient.addColorStop(0, '#FFDEE9');
        gradient.addColorStop(1, '#B5FFFC');
      } else if (backgroundVal.includes('#FAD9C1')) {
        gradient = ctx.createLinearGradient(0, 0, exportW, exportH);
        gradient.addColorStop(0, '#FAD9C1');
        gradient.addColorStop(1, '#F9A1BC');
      } else if (backgroundVal.includes('#E0F2F1')) {
        gradient = ctx.createLinearGradient(0, 0, exportW, exportH);
        gradient.addColorStop(0, '#E0F2F1');
        gradient.addColorStop(1, '#B2DFDB');
      } else if (backgroundVal.includes('#09090B')) {
        gradient = ctx.createLinearGradient(0, 0, exportW, exportH);
        gradient.addColorStop(0, '#09090B');
        gradient.addColorStop(1, '#27272A');
      } else {
        // Peach Glow
        gradient = ctx.createLinearGradient(0, 0, exportW, exportH);
        gradient.addColorStop(0, '#FFE29F');
        gradient.addColorStop(1, '#FFA99F');
      }
      ctx.fillStyle = gradient;
      ctx.fillRect(0, 0, exportW, exportH);
    }

    // 2. Draw slots (and polaroid bases)
    for (const slotConfig of selectedTemplate.slots) {
      const slot = mediaSlots[slotConfig.id];
      if (!slot) continue;

      const slotX = (slotConfig.x / 100) * exportW;
      const slotY = (slotConfig.y / 100) * exportH;
      const slotW = (slotConfig.w / 100) * exportW;
      const slotH = (slotConfig.h / 100) * exportH;

      ctx.save();

      // If tilted or polaroid card base is needed
      if (slotConfig.type === 'polaroid') {
        const centerX = slotX + slotW / 2;
        const centerY = slotY + slotH / 2;
        
        ctx.translate(centerX, centerY);
        ctx.rotate(((slotConfig.rotate || 0) * Math.PI) / 180);

        // Draw Polaroid card base
        // card body
        ctx.shadowColor = 'rgba(0, 0, 0, 0.1)';
        ctx.shadowBlur = 25;
        ctx.shadowOffsetX = 2;
        ctx.shadowOffsetY = 10;

        ctx.fillStyle = '#FFFFFF';
        ctx.beginPath();
        ctx.roundRect(-slotW / 2, -slotH / 2, slotW, slotH, 8);
        ctx.fill();

        // Remove shadow for inner things
        ctx.shadowColor = 'transparent';

        // Photo bounds inside polaroid
        const inset = slotW * 0.07; // 7% inset margins
        const photoW = slotW - inset * 2;
        const photoH = slotH - inset * 2 - (slotConfig.paddingBottom || 0) * 2;
        const photoX = -slotW / 2 + inset;
        const photoY = -slotH / 2 + inset;

        // Draw photo slot placeholder
        ctx.fillStyle = '#18181B';
        ctx.fillRect(photoX, photoY, photoW, photoH);

        // Draw Image/Video
        if (slot.imageSrc || slot.videoSrc) {
          ctx.save();
          ctx.beginPath();
          ctx.rect(photoX, photoY, photoW, photoH);
          ctx.clip();

          // Get raw img/video dimensions
          let sourceEl: CanvasImageSource | null = null;
          if (slot.imageSrc) {
            const img = new Image();
            img.src = slot.imageSrc;
            // Wait for image loading (since in base64 it is instant but in other URLs it might take a ms, we read from loaded DOM img ref or await)
            await new Promise((resolve) => {
              if (img.complete) resolve(true);
              img.onload = () => resolve(true);
            });
            sourceEl = img;
          } else if (slot.videoSrc && videoElementsCache.current[slot.id]) {
            sourceEl = videoElementsCache.current[slot.id];
          }

          if (sourceEl) {
            const srcW = (sourceEl as any).videoWidth || (sourceEl as any).naturalWidth || (sourceEl as any).width || 100;
            const srcH = (sourceEl as any).videoHeight || (sourceEl as any).naturalHeight || (sourceEl as any).height || 100;

            const scale = slot.scale;
            // Calculate scale to cover slot
            const ratioW = photoW / srcW;
            const ratioH = photoH / srcH;
            const fitRatio = Math.max(ratioW, ratioH) * scale;

            const drawW = srcW * fitRatio;
            const drawH = srcH * fitRatio;

            // Display offsets are responsive, we scale them by ratio of high-res canvas
            const scaleMultiplier = exportW / (workspaceCanvasRef.current?.getBoundingClientRect().width || exportW);
            const dx = photoX + (photoW - drawW) / 2 + slot.offsetX * scaleMultiplier;
            const dy = photoY + (photoH - drawH) / 2 + slot.offsetY * scaleMultiplier;

            // Apply filter
            if (slot.filter !== 'none') {
              ctx.filter = getFilterStyle(slot.filter);
            }

            ctx.drawImage(sourceEl, dx, dy, drawW, drawH);
            ctx.filter = 'none';
          }
          ctx.restore();
        }

        // Card photo inner border
        ctx.strokeStyle = 'rgba(0, 0, 0, 0.05)';
        ctx.lineWidth = 2;
        ctx.strokeRect(photoX, photoY, photoW, photoH);

      } else if (slotConfig.type === 'film') {
        // Draw black Film strip background card
        ctx.fillStyle = '#18181B';
        ctx.fillRect(slotX, slotY, slotW, slotH);

        // Draw sprocket holes on left & right
        ctx.fillStyle = backgroundVal === '#27272A' ? '#18181B' : '#EAEAEA';
        const holeW = slotW * 0.04;
        const holeH = slotH * 0.12;
        const holeYOffset = slotH * 0.1;
        
        // holes left
        ctx.fillRect(slotX + slotW * 0.05, slotY + holeYOffset, holeW, holeH);
        ctx.fillRect(slotX + slotW * 0.05, slotY + slotH - holeH - holeYOffset, holeW, holeH);
        // holes right
        ctx.fillRect(slotX + slotW * 0.91, slotY + holeYOffset, holeW, holeH);
        ctx.fillRect(slotX + slotW * 0.91, slotY + slotH - holeH - holeYOffset, holeW, holeH);

        // Photo slot boundaries
        const photoX = slotX + slotW * 0.15;
        const photoY = slotY + slotH * 0.05;
        const photoW = slotW * 0.7;
        const photoH = slotH * 0.9;

        // Draw photo slot placeholder
        ctx.fillStyle = '#09090B';
        ctx.fillRect(photoX, photoY, photoW, photoH);

        if (slot.imageSrc || slot.videoSrc) {
          ctx.save();
          ctx.beginPath();
          ctx.rect(photoX, photoY, photoW, photoH);
          ctx.clip();

          let sourceEl: CanvasImageSource | null = null;
          if (slot.imageSrc) {
            const img = new Image();
            img.src = slot.imageSrc;
            await new Promise(resolve => {
              if (img.complete) resolve(true);
              img.onload = () => resolve(true);
            });
            sourceEl = img;
          } else if (slot.videoSrc && videoElementsCache.current[slot.id]) {
            sourceEl = videoElementsCache.current[slot.id];
          }

          if (sourceEl) {
            const srcW = (sourceEl as any).videoWidth || (sourceEl as any).naturalWidth || (sourceEl as any).width || 100;
            const srcH = (sourceEl as any).videoHeight || (sourceEl as any).naturalHeight || (sourceEl as any).height || 100;

            const scale = slot.scale;
            const ratioW = photoW / srcW;
            const ratioH = photoH / srcH;
            const fitRatio = Math.max(ratioW, ratioH) * scale;

            const drawW = srcW * fitRatio;
            const drawH = srcH * fitRatio;

            const scaleMultiplier = exportW / (workspaceCanvasRef.current?.getBoundingClientRect().width || exportW);
            const dx = photoX + (photoW - drawW) / 2 + slot.offsetX * scaleMultiplier;
            const dy = photoY + (photoH - drawH) / 2 + slot.offsetY * scaleMultiplier;

            if (slot.filter !== 'none') {
              ctx.filter = getFilterStyle(slot.filter);
            }
            ctx.drawImage(sourceEl, dx, dy, drawW, drawH);
            ctx.filter = 'none';
          }
          ctx.restore();
        }

      } else {
        // Standard rectangular slot
        // Photo slot boundaries
        ctx.beginPath();
        ctx.rect(slotX, slotY, slotW, slotH);
        ctx.clip();

        // Draw media
        if (slot.imageSrc || slot.videoSrc) {
          let sourceEl: CanvasImageSource | null = null;
          if (slot.imageSrc) {
            const img = new Image();
            img.src = slot.imageSrc;
            await new Promise(resolve => {
              if (img.complete) resolve(true);
              img.onload = () => resolve(true);
            });
            sourceEl = img;
          } else if (slot.videoSrc && videoElementsCache.current[slot.id]) {
            sourceEl = videoElementsCache.current[slot.id];
          }

          if (sourceEl) {
            const srcW = (sourceEl as any).videoWidth || (sourceEl as any).naturalWidth || (sourceEl as any).width || 100;
            const srcH = (sourceEl as any).videoHeight || (sourceEl as any).naturalHeight || (sourceEl as any).height || 100;

            const scale = slot.scale;
            const ratioW = slotW / srcW;
            const ratioH = slotH / srcH;
            const fitRatio = Math.max(ratioW, ratioH) * scale;

            const drawW = srcW * fitRatio;
            const drawH = srcH * fitRatio;

            const scaleMultiplier = exportW / (workspaceCanvasRef.current?.getBoundingClientRect().width || exportW);
            const dx = slotX + (slotW - drawW) / 2 + slot.offsetX * scaleMultiplier;
            const dy = slotY + (slotH - drawH) / 2 + slot.offsetY * scaleMultiplier;

            if (slot.filter !== 'none') {
              ctx.filter = getFilterStyle(slot.filter);
            }
            ctx.drawImage(sourceEl, dx, dy, drawW, drawH);
            ctx.filter = 'none';
          }
        } else {
          // Empty color placeholder
          ctx.fillStyle = backgroundVal === '#27272A' ? '#18181B' : '#E8E5DF';
          ctx.fillRect(slotX, slotY, slotW, slotH);
        }
      }

      ctx.restore();
    }

    // 3. Draw Tape Stickers
    for (const tape of tapeStickers) {
      const tapeX = (tape.x / 100) * exportW;
      const tapeY = (tape.y / 100) * exportH;
      const tapeW = exportW * 0.16; // 16% of width
      const tapeH = exportH * 0.024; // 2.4% of height

      ctx.save();
      ctx.translate(tapeX, tapeY);
      ctx.rotate((tape.rotate * Math.PI) / 180);

      // Draw semi-transparent tape body
      ctx.fillStyle = tape.color;
      ctx.shadowColor = 'rgba(0, 0, 0, 0.03)';
      ctx.shadowBlur = 4;
      ctx.shadowOffsetY = 1;
      
      // Draw washi tape rect
      ctx.fillRect(-tapeW / 2, -tapeH / 2, tapeW, tapeH);

      // Draw dashed frayed end styles on canvas ends
      ctx.strokeStyle = 'rgba(255, 255, 255, 0.4)';
      ctx.lineWidth = 2;
      ctx.setLineDash([2, 2]);
      ctx.beginPath();
      ctx.moveTo(-tapeW / 2, -tapeH / 2);
      ctx.lineTo(-tapeW / 2, tapeH / 2);
      ctx.moveTo(tapeW / 2, -tapeH / 2);
      ctx.lineTo(tapeW / 2, tapeH / 2);
      ctx.stroke();

      ctx.restore();
    }

    // 4. Draw Typography Overlays
    for (const tBox of textBoxes) {
      const textX = (tBox.x / 100) * exportW;
      const textY = (tBox.y / 100) * exportH;
      
      // Calculate responsive text size for export
      const scaleMultiplier = exportW / (workspaceCanvasRef.current?.getBoundingClientRect().width || exportW);
      const scaledFontSize = tBox.size * scaleMultiplier;

      ctx.save();
      
      // Set letter spacing if modern browser api exists
      if ('letterSpacing' in ctx) {
        (ctx as any).letterSpacing = (tBox.spacing * scaleMultiplier) + 'px';
      }

      ctx.font = `${scaledFontSize}px ${getFontFamilyStack(tBox.font)}`;
      ctx.fillStyle = tBox.color;
      ctx.textAlign = tBox.align;
      ctx.textBaseline = 'middle';
      ctx.globalAlpha = tBox.opacity;

      ctx.fillText(tBox.text, textX, textY);
      ctx.restore();
    }

    // 5. Draw Texture overlays
    if (texture === 'grain') {
      ctx.save();
      // Generate noise pattern
      const noiseCanvas = document.createElement('canvas');
      noiseCanvas.width = 128;
      noiseCanvas.height = 128;
      const nCtx = noiseCanvas.getContext('2d');
      if (nCtx) {
        const nImgData = nCtx.createImageData(128, 128);
        const data = nImgData.data;
        for (let i = 0; i < data.length; i += 4) {
          const val = Math.random() * 255;
          data[i] = val;     // R
          data[i+1] = val;   // G
          data[i+2] = val;   // B
          data[i+3] = 15;    // low opacity alpha
        }
        nCtx.putImageData(nImgData, 0, 0);
        const pattern = ctx.createPattern(noiseCanvas, 'repeat');
        if (pattern) {
          ctx.fillStyle = pattern;
          ctx.fillRect(0, 0, exportW, exportH);
        }
      }
      ctx.restore();
    } else if (texture === 'paper') {
      ctx.save();
      ctx.strokeStyle = 'rgba(255,255,255,0.18)';
      ctx.lineWidth = 3;
      // crease 1
      ctx.beginPath();
      ctx.moveTo(-10, exportH * 0.3);
      ctx.lineTo(exportW + 10, exportH * 0.45);
      ctx.stroke();

      // crease 2
      ctx.strokeStyle = 'rgba(0,0,0,0.04)';
      ctx.beginPath();
      ctx.moveTo(exportW * 0.4, -10);
      ctx.lineTo(exportW * 0.55, exportH + 10);
      ctx.stroke();

      // Crumpled paper multiply filter simulation
      ctx.fillStyle = 'rgba(0, 0, 0, 0.015)';
      ctx.fillRect(0, 0, exportW, exportH);
      ctx.restore();
    } else if (texture === 'scratches') {
      ctx.save();
      ctx.strokeStyle = 'rgba(255, 255, 255, 0.25)';
      ctx.lineWidth = 1.5;
      
      // Draw scratch line 1
      ctx.beginPath();
      ctx.moveTo(exportW * 0.2, exportH * 0.1);
      ctx.quadraticCurveTo(exportW * 0.21, exportH * 0.25, exportW * 0.19, exportH * 0.4);
      ctx.stroke();

      // Draw scratch line 2 (dark)
      ctx.strokeStyle = 'rgba(0, 0, 0, 0.1)';
      ctx.lineWidth = 1;
      ctx.beginPath();
      ctx.moveTo(exportW * 0.75, exportH * 0.5);
      ctx.lineTo(exportW * 0.73, exportH * 0.7);
      ctx.stroke();

      // Dust specs
      ctx.fillStyle = 'rgba(255, 255, 255, 0.4)';
      for (let i = 0; i < 35; i++) {
        ctx.fillRect(Math.random() * exportW, Math.random() * exportH, 2, 2);
      }
      ctx.restore();
    }

    // Trigger download
    const dataUrl = canvas.toDataURL('image/png');
    const link = document.createElement('a');
    link.download = `percylab-story-${selectedTemplate.id}-${Date.now()}.png`;
    link.href = dataUrl;
    link.click();
  };

  const selectedTextObj = textBoxes.find(tBox => tBox.id === selectedTextId);

  return (
    <div className="tool-container">
      {/* Header */}
      <div className="tool-header">
        <h2 className="title-primary text-gradient">{t('storylab.title')}</h2>
        <p style={{ color: 'var(--text-secondary)' }}>
          {lang === 'vi' 
            ? 'Thiết kế Reels, Instagram Stories hoặc Collage ảnh nghệ thuật với các bộ lọc màu phim retro, nhãn dán, chữ ký và vân giấy phong cách Unfold chuyên nghiệp.' 
            : 'Design Instagram stories, reels, or photo collages with vintage overlays, tape stickers, elegant signatures, and customizable layouts.'}
        </p>
      </div>

      <div className="tool-grid">
        
        {/* Left Side: WYSIWYG Editor Workspace */}
        <div className="tool-card glass editor-preview-card" style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center' }}>
          
          <div className="preview-header-bar" style={{ width: '100%', display: 'flex', justifyContent: 'space-between', marginBottom: 16 }}>
            <span style={{ fontSize: '0.88rem', fontWeight: 600, color: 'var(--text-secondary)' }}>
              {aspectRatio === '9:16' ? 'Instagram Story (9:16)' : aspectRatio === '1:1' ? 'Square Post (1:1)' : 'Portrait Post (4:5)'}
            </span>
            <button 
              onClick={() => {
                // reset everything
                removeSlotMedia(0);
                removeSlotMedia(1);
                removeSlotMedia(2);
                applyTemplate(selectedTemplate);
              }} 
              className="btn-clear" 
              style={{ fontSize: '0.8rem' }}
            >
              <RotateCcw size={12} style={{ marginRight: 4 }} />
              {t('storylab.reset')}
            </button>
          </div>

          {/* Core Interactive Canvas Wrapper */}
          <div 
            ref={workspaceCanvasRef}
            className={`story-canvas-viewport ratio-${aspectRatio.replace(':', '-')}`}
            onMouseMove={handleCanvasMouseMove}
            onMouseUp={handleCanvasMouseUp}
            onMouseLeave={handleCanvasMouseUp}
            style={{ 
              position: 'relative',
              background: backgroundType === 'color' ? backgroundVal : backgroundVal,
              overflow: 'hidden',
              boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.25)',
              borderRadius: '16px',
              border: '2px solid var(--card-border)'
            }}
          >
            {/* 1. Render Slots */}
            {selectedTemplate.slots.map(slotConfig => {
              const slot = mediaSlots[slotConfig.id] || { id: slotConfig.id, imageSrc: null, videoSrc: null, scale: 1.0, offsetX: 0, offsetY: 0, filter: 'none' };
              
              // Map slot styles
              const isPolaroid = slotConfig.type === 'polaroid';
              const isFilm = slotConfig.type === 'film';

              const slotStyle: React.CSSProperties = {
                position: 'absolute',
                left: `${slotConfig.x}%`,
                top: `${slotConfig.y}%`,
                width: `${slotConfig.w}%`,
                height: `${slotConfig.h}%`,
                transform: isPolaroid ? `rotate(${slotConfig.rotate || 0}deg)` : 'none',
                transformOrigin: 'center center',
                transition: draggingSlotId === slotConfig.id ? 'none' : 'transform 0.15s ease',
              };

              // Photo frame boundaries style inside Polaroid
              const innerPhotoStyle: React.CSSProperties = isPolaroid ? {
                position: 'absolute',
                top: '7%',
                left: '7%',
                width: '86%',
                height: '76%',
                overflow: 'hidden',
                background: '#18181B',
              } : isFilm ? {
                position: 'absolute',
                top: '5%',
                left: '15%',
                width: '70%',
                height: '90%',
                overflow: 'hidden',
                background: '#09090B',
              } : {
                width: '100%',
                height: '100%',
                overflow: 'hidden',
                position: 'relative'
              };

              const isSelected = selectedSlotId === slotConfig.id;

              return (
                <div 
                  key={slotConfig.id}
                  style={slotStyle}
                  className={`media-slot-card ${isPolaroid ? 'polaroid-body' : isFilm ? 'filmstrip-body' : ''} ${isSelected ? 'selected' : ''}`}
                  onClick={(e) => {
                    e.stopPropagation();
                    setSelectedSlotId(slotConfig.id);
                    setSelectedTextId(null);
                    setActiveTab('media');
                  }}
                >
                  
                  {/* Polaroid Frame Border */}
                  {isPolaroid && <div className="polaroid-shadow-card"></div>}

                  {/* Filmstrip Sprockets */}
                  {isFilm && (
                    <div className="film-holes-wrapper">
                      <div className="sprocket-hole l-top"></div>
                      <div className="sprocket-hole l-bot"></div>
                      <div className="sprocket-hole r-top"></div>
                      <div className="sprocket-hole r-bot"></div>
                    </div>
                  )}

                  {/* Inner Photo Area */}
                  <div 
                    style={innerPhotoStyle}
                    className="photo-content-viewport"
                    onMouseDown={(e) => handleSlotMouseDown(e, slotConfig.id)}
                  >
                    {!slot.imageSrc && !slot.videoSrc ? (
                      <div 
                        className="slot-placeholder"
                        onClick={() => triggerMediaUpload(slotConfig.id)}
                        style={{
                          width: '100%',
                          height: '100%',
                          display: 'flex',
                          flexDirection: 'column',
                          alignItems: 'center',
                          justifyContent: 'center',
                          color: isFilm ? '#52525B' : 'var(--text-secondary)',
                          background: isFilm ? '#111' : 'rgba(0,0,0,0.03)',
                          cursor: 'pointer',
                          gap: 6
                        }}
                      >
                        <Upload size={18} />
                        <span style={{ fontSize: '0.68rem', fontWeight: 600 }}>{t('storylab.noMedia')}</span>
                      </div>
                    ) : (
                      <div style={{ width: '100%', height: '100%', position: 'relative' }}>
                        {slot.imageSrc ? (
                          <img 
                            src={slot.imageSrc} 
                            alt="Story element"
                            draggable={false}
                            style={{
                              width: '100%',
                              height: '100%',
                              objectFit: 'cover',
                              transform: `scale(${slot.scale}) translate(${slot.offsetX}px, ${slot.offsetY}px)`,
                              transformOrigin: 'center center',
                              filter: getFilterStyle(slot.filter),
                              pointerEvents: 'none',
                              userSelect: 'none'
                            }}
                          />
                        ) : (
                          <video 
                            src={slot.videoSrc || ''} 
                            loop 
                            muted 
                            playsInline 
                            autoPlay
                            style={{
                              width: '100%',
                              height: '100%',
                              objectFit: 'cover',
                              transform: `scale(${slot.scale}) translate(${slot.offsetX}px, ${slot.offsetY}px)`,
                              transformOrigin: 'center center',
                              filter: getFilterStyle(slot.filter),
                              pointerEvents: 'none'
                            }}
                          />
                        )}
                        
                        {/* Selected overlay border indicator */}
                        {isSelected && (
                          <div style={{
                            position: 'absolute',
                            top: 0, left: 0, right: 0, bottom: 0,
                            border: '2px solid var(--accent)',
                            pointerEvents: 'none'
                          }} />
                        )}
                      </div>
                    )}
                  </div>
                </div>
              );
            })}

            {/* 2. Render Washi Tape Stickers */}
            {tapeStickers.map(tape => {
              return (
                <div
                  key={tape.id}
                  style={{
                    position: 'absolute',
                    left: `${tape.x}%`,
                    top: `${tape.y}%`,
                    width: '16%',
                    height: '3%',
                    transform: `translate(-50%, -50%) rotate(${tape.rotate}deg)`,
                    background: tape.color,
                    cursor: 'pointer',
                    boxShadow: '0 1px 3px rgba(0,0,0,0.05)',
                    borderRadius: '1px',
                    zIndex: 10,
                    borderLeft: '1.5px dashed rgba(255,255,255,0.4)',
                    borderRight: '1.5px dashed rgba(255,255,255,0.4)'
                  }}
                  onClick={(e) => {
                    e.stopPropagation();
                    // Delete tape sticker on click to keep it clean
                    removeTapeSticker(tape.id);
                  }}
                  title={lang === 'vi' ? 'Nhấp để xóa băng keo' : 'Click to delete tape'}
                />
              );
            })}

            {/* 3. Render Text Overlays */}
            {textBoxes.map(tBox => {
              const isSelected = selectedTextId === tBox.id;
              return (
                <div
                  key={tBox.id}
                  onMouseDown={(e) => handleTextMouseDown(e, tBox)}
                  style={{
                    position: 'absolute',
                    left: `${tBox.x}%`,
                    top: `${tBox.y}%`,
                    transform: `translate(-50%, -50%)`,
                    fontFamily: getFontFamilyStack(tBox.font),
                    fontSize: `${tBox.size}px`,
                    color: tBox.color,
                    letterSpacing: `${tBox.spacing}px`,
                    textAlign: tBox.align,
                    opacity: tBox.opacity,
                    cursor: draggingTextId === tBox.id ? 'grabbing' : 'grab',
                    border: isSelected ? '1.5px dashed var(--accent)' : '1.5px solid transparent',
                    padding: '4px 8px',
                    whiteSpace: 'nowrap',
                    userSelect: 'none',
                    zIndex: 20
                  }}
                  onDoubleClick={() => {
                    const val = prompt(lang === 'vi' ? 'Nhập nội dung chữ:' : 'Edit Text:', tBox.text);
                    if (val !== null) updateSelectedTextBox({ text: val });
                  }}
                >
                  {tBox.text}
                </div>
              );
            })}

            {/* 4. Textures overlay */}
            {texture === 'grain' && <div className="texture-grain-overlay"></div>}
            {texture === 'paper' && <div className="texture-paper-overlay"></div>}
            {texture === 'scratches' && <div className="texture-scratches-overlay"></div>}
          </div>

          {/* Floating Instructions */}
          <div className="canvas-drag-tips">
            <span style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>
              💡 {t('storylab.dragPrompt')}
            </span>
          </div>
        </div>

        {/* Right Side: Sidebar Controllers Panel */}
        <div className="tool-card glass controllers-card animate-fade">
          
          {/* Tabs switch */}
          <div className="tab-switch-row" style={{ marginBottom: 20 }}>
            <button
              onClick={() => setActiveTab('layouts')}
              className={`tab-switch-btn ${activeTab === 'layouts' ? 'active' : ''}`}
            >
              <Layout size={14} />
              <span>{lang === 'vi' ? 'Bố cục' : 'Layout'}</span>
            </button>
            <button
              onClick={() => setActiveTab('media')}
              className={`tab-switch-btn ${activeTab === 'media' ? 'active' : ''}`}
            >
              <ImageIcon size={14} />
              <span>Media</span>
            </button>
            <button
              onClick={() => setActiveTab('text')}
              className={`tab-switch-btn ${activeTab === 'text' ? 'active' : ''}`}
            >
              <Type size={14} />
              <span>{lang === 'vi' ? 'Chữ' : 'Text'}</span>
            </button>
            <button
              onClick={() => setActiveTab('style')}
              className={`tab-switch-btn ${activeTab === 'style' ? 'active' : ''}`}
            >
              <Palette size={14} />
              <span>{lang === 'vi' ? 'Nền & Vân' : 'Styling'}</span>
            </button>
          </div>

          {/* TAB 1: Layouts options */}
          {activeTab === 'layouts' && (
            <div className="controller-section animate-fade">
              {/* Aspect Ratio choice */}
              <div className="form-group">
                <label>{t('storylab.ratio')}</label>
                <div className="ratio-selectors-grid">
                  {(['9:16', '1:1', '4:5'] as AspectRatio[]).map(ratio => (
                    <button
                      key={ratio}
                      onClick={() => setAspectRatio(ratio)}
                      className={`ratio-btn ${aspectRatio === ratio ? 'active' : ''}`}
                    >
                      <span className="ratio-rect" style={{ 
                        aspectRatio: ratio === '9:16' ? '9/16' : ratio === '1:1' ? '1/1' : '4/5'
                      }}></span>
                      <span style={{ fontSize: '0.8rem', fontWeight: 700 }}>{ratio}</span>
                    </button>
                  ))}
                </div>
              </div>

              {/* Templates selector */}
              <div className="form-group" style={{ marginTop: 24 }}>
                <label>{t('storylab.selectTemplate')}</label>
                <div className="template-thumbnails-stack">
                  {TEMPLATES.map(tpl => (
                    <button
                      key={tpl.id}
                      onClick={() => setSelectedTemplate(tpl)}
                      className={`tpl-thumbnail-btn ${selectedTemplate.id === tpl.id ? 'active' : ''}`}
                    >
                      <div className="tpl-visual-box">
                        {/* Mini abstract representation of slot grids */}
                        {tpl.slots.map(s => (
                          <div 
                            key={s.id}
                            style={{
                              position: 'absolute',
                              left: `${s.x}%`,
                              top: `${s.y}%`,
                              width: `${s.w}%`,
                              height: `${s.h}%`,
                              background: s.type === 'polaroid' ? '#FFF' : 'rgba(46,125,96,0.3)',
                              border: '1px solid rgba(0,0,0,0.1)',
                              transform: s.type === 'polaroid' ? `rotate(${s.rotate || 0}deg)` : 'none',
                              borderRadius: '1px'
                            }}
                          />
                        ))}
                      </div>
                      <span className="tpl-name">{lang === 'vi' ? tpl.nameVi : tpl.nameEn}</span>
                    </button>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* TAB 2: Media configurations */}
          {activeTab === 'media' && (
            <div className="controller-section animate-fade">
              {selectedSlotId === null ? (
                <div className="no-selection-prompt" style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
                  <div>{lang === 'vi' ? 'Hãy nhấp vào một ô ảnh/video trên Canvas để chỉnh sửa.' : 'Click a media slot on the Canvas to configure.'}</div>
                  
                  <div style={{ borderTop: '1px dashed var(--card-border)', paddingTop: 16, marginTop: 8 }}>
                    <p style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', marginBottom: 12 }}>
                      {lang === 'vi' ? 'Hoặc chọn nhanh nhiều tệp cùng lúc để tự động lấp đầy bố cục:' : 'Or quickly choose multiple files to automatically fill the layout:'}
                    </p>
                    <button 
                      onClick={triggerMultiMediaUpload}
                      className="btn btn-secondary"
                      style={{ width: '100%', padding: '10px 14px', fontSize: '0.88rem' }}
                    >
                      <Plus size={14} style={{ marginRight: 6 }} />
                      {t('storylab.importMultiBtn')}
                    </button>
                  </div>
                </div>
              ) : (
                <div className="media-config-workspace">
                  <div className="slot-selection-indicator">
                    <span className="badge-slot">Slot #{selectedSlotId + 1}</span>
                    <span style={{ fontSize: '0.82rem', color: 'var(--text-secondary)' }}>
                      {mediaSlots[selectedSlotId]?.imageSrc ? (lang === 'vi' ? 'Đã tải ảnh' : 'Image Loaded') : mediaSlots[selectedSlotId]?.videoSrc ? (lang === 'vi' ? 'Đã tải video' : 'Video Loaded') : (lang === 'vi' ? 'Chưa có media' : 'No Media')}
                    </span>
                  </div>

                  <div className="media-actions-row">
                    <button 
                      onClick={() => triggerMediaUpload(selectedSlotId)}
                      className="btn btn-primary"
                      style={{ flex: 1, padding: '10px 14px', fontSize: '0.88rem' }}
                    >
                      <Upload size={14} style={{ marginRight: 6 }} />
                      {t('storylab.changeMedia')}
                    </button>
                    {(mediaSlots[selectedSlotId]?.imageSrc || mediaSlots[selectedSlotId]?.videoSrc) && (
                      <button 
                        onClick={() => removeSlotMedia(selectedSlotId)}
                        className="btn btn-danger-outline"
                        style={{ padding: 10 }}
                      >
                        <Trash2 size={16} />
                      </button>
                    )}
                  </div>

                  {/* Camera capture & multi import options */}
                  <div style={{ display: 'flex', gap: 8, marginTop: 10 }}>
                    <button 
                      onClick={openCameraModal}
                      className="btn btn-secondary"
                      style={{ flex: 1, padding: '8px 12px', fontSize: '0.82rem', gap: 4 }}
                    >
                      <Camera size={14} />
                      <span>{t('storylab.cameraBtn')}</span>
                    </button>

                    <button 
                      onClick={triggerMultiMediaUpload}
                      className="btn btn-secondary"
                      style={{ flex: 1, padding: '8px 12px', fontSize: '0.82rem', gap: 4 }}
                    >
                      <Plus size={14} />
                      <span>{t('storylab.importMultiBtn')}</span>
                    </button>
                  </div>

                  {(mediaSlots[selectedSlotId]?.imageSrc || mediaSlots[selectedSlotId]?.videoSrc) && (
                    <div style={{ marginTop: 24 }}>
                      {/* Zoom slider */}
                      <div className="form-group">
                        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 8 }}>
                          <label>{t('storylab.zoom')}</label>
                          <span style={{ color: 'var(--accent)', fontWeight: 700 }}>{Math.round(mediaSlots[selectedSlotId].scale * 100)}%</span>
                        </div>
                        <input 
                          type="range"
                          min="1.0"
                          max="4.0"
                          step="0.05"
                          value={mediaSlots[selectedSlotId].scale}
                          onChange={(e) => setMediaSlots(prev => ({
                            ...prev,
                            [selectedSlotId]: {
                              ...prev[selectedSlotId],
                              scale: parseFloat(e.target.value)
                            }
                          }))}
                          className="slider-input"
                        />
                      </div>

                      {/* Filters choice */}
                      <div className="form-group" style={{ marginTop: 24 }}>
                        <label>{t('storylab.filter')}</label>
                        <div className="filters-grid">
                          {(['none', 'vintage', 'bw', 'warm', 'cool', 'sepia'] as FilterType[]).map(filter => (
                            <button
                              key={filter}
                              onClick={() => setMediaSlots(prev => ({
                                ...prev,
                                [selectedSlotId]: {
                                  ...prev[selectedSlotId],
                                  filter
                                }
                              }))}
                              className={`filter-btn ${mediaSlots[selectedSlotId].filter === filter ? 'active' : ''}`}
                            >
                              <div className={`filter-preview ${filter}`}></div>
                              <span style={{ fontSize: '0.72rem', fontWeight: 600, textTransform: 'capitalize' }}>{filter}</span>
                            </button>
                          ))}
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              )}
            </div>
          )}

          {/* TAB 3: Text boxes */}
          {activeTab === 'text' && (
            <div className="controller-section animate-fade">
              <button 
                onClick={addTextBox}
                className="btn btn-primary"
                style={{ width: '100%', padding: '12px 14px' }}
              >
                <Plus size={16} style={{ marginRight: 6 }} />
                {t('storylab.addTextBtn')}
              </button>

              {selectedTextId === null || !selectedTextObj ? (
                <div className="no-selection-prompt" style={{ marginTop: 20 }}>
                  {lang === 'vi' ? 'Hãy nhấp vào một dòng chữ trên Canvas để định dạng.' : 'Select a text overlay on the Canvas to style.'}
                </div>
              ) : (
                <div className="text-config-workspace" style={{ marginTop: 24 }}>
                  
                  {/* Text Input */}
                  <div className="form-group">
                    <label>{lang === 'vi' ? 'Nội dung chữ' : 'Text Content'}</label>
                    <input 
                      type="text" 
                      value={selectedTextObj.text} 
                      onChange={(e) => updateSelectedTextBox({ text: e.target.value })}
                      className="form-input"
                    />
                  </div>

                  {/* Font Style selectors */}
                  <div className="form-group" style={{ marginTop: 20 }}>
                    <label>{t('storylab.fontFamily')}</label>
                    <div className="font-selectors-row">
                      {(['serif', 'sans', 'cursive', 'typewriter'] as FontStyle[]).map(font => (
                        <button
                          key={font}
                          onClick={() => updateSelectedTextBox({ font })}
                          className={`font-select-btn ${selectedTextObj.font === font ? 'active' : ''}`}
                          style={{ fontFamily: getFontFamilyStack(font) }}
                        >
                          Aa
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Size slider */}
                  <div className="form-group" style={{ marginTop: 20 }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 8 }}>
                      <label>{t('storylab.fontSize')}</label>
                      <span style={{ fontWeight: 700, color: 'var(--accent)' }}>{selectedTextObj.size}px</span>
                    </div>
                    <input 
                      type="range"
                      min="12"
                      max="72"
                      value={selectedTextObj.size}
                      onChange={(e) => updateSelectedTextBox({ size: parseInt(e.target.value) })}
                      className="slider-input"
                    />
                  </div>

                  {/* Spacing slider */}
                  <div className="form-group" style={{ marginTop: 20 }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 8 }}>
                      <label>{t('storylab.letterSpacing')}</label>
                      <span style={{ fontWeight: 700, color: 'var(--accent)' }}>{selectedTextObj.spacing}px</span>
                    </div>
                    <input 
                      type="range"
                      min="0"
                      max="12"
                      value={selectedTextObj.spacing}
                      onChange={(e) => updateSelectedTextBox({ spacing: parseInt(e.target.value) })}
                      className="slider-input"
                    />
                  </div>

                  {/* Opacity slider */}
                  <div className="form-group" style={{ marginTop: 20 }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 8 }}>
                      <label>{t('storylab.opacity')}</label>
                      <span style={{ fontWeight: 700, color: 'var(--accent)' }}>{Math.round(selectedTextObj.opacity * 100)}%</span>
                    </div>
                    <input 
                      type="range"
                      min="0.1"
                      max="1.0"
                      step="0.05"
                      value={selectedTextObj.opacity}
                      onChange={(e) => updateSelectedTextBox({ opacity: parseFloat(e.target.value) })}
                      className="slider-input"
                    />
                  </div>

                  {/* Align & Color Row */}
                  <div style={{ display: 'flex', gap: 16, marginTop: 20 }}>
                    <div className="form-group" style={{ flex: 1 }}>
                      <label>{t('storylab.textColor')}</label>
                      <div className="color-picker-row">
                        {['#333333', '#FFFFFF', '#E11D48', '#FFB03B', '#1E6B3F'].map(color => (
                          <button
                            key={color}
                            onClick={() => updateSelectedTextBox({ color })}
                            className={`color-dot ${selectedTextObj.color === color ? 'active' : ''}`}
                            style={{ background: color, border: color === '#FFFFFF' ? '1px solid #CCC' : 'none' }}
                          />
                        ))}
                      </div>
                    </div>

                    <div className="form-group" style={{ flex: 1 }}>
                      <label>{lang === 'vi' ? 'Căn lề' : 'Alignment'}</label>
                      <div className="tab-switch-row" style={{ padding: 2 }}>
                        {(['left', 'center', 'right'] as const).map(align => (
                          <button
                            key={align}
                            onClick={() => updateSelectedTextBox({ align })}
                            className={`tab-switch-btn ${selectedTextObj.align === align ? 'active' : ''}`}
                            style={{ padding: '4px 8px', fontSize: '0.75rem' }}
                          >
                            {align}
                          </button>
                        ))}
                      </div>
                    </div>
                  </div>

                  {/* Delete Text box button */}
                  <button 
                    onClick={deleteSelectedTextBox}
                    className="btn btn-danger-outline"
                    style={{ width: '100%', marginTop: 24 }}
                  >
                    <Trash2 size={14} style={{ marginRight: 6 }} />
                    {t('storylab.deleteText')}
                  </button>

                </div>
              )}
            </div>
          )}

          {/* TAB 4: Background & Textures overlay */}
          {activeTab === 'style' && (
            <div className="controller-section animate-fade">
              
              {/* Background solid/gradient toggle */}
              <div className="form-group">
                <label>{t('storylab.background')}</label>
                <div className="tab-switch-row">
                  <button
                    onClick={() => { setBackgroundType('color'); setBackgroundVal(SOLID_COLORS[0].value); }}
                    className={`tab-switch-btn ${backgroundType === 'color' ? 'active' : ''}`}
                  >
                    {t('storylab.bgColor')}
                  </button>
                  <button
                    onClick={() => { setBackgroundType('gradient'); setBackgroundVal(GRADIENTS[0].value); }}
                    className={`tab-switch-btn ${backgroundType === 'gradient' ? 'active' : ''}`}
                  >
                    {t('storylab.bgGradient')}
                  </button>
                </div>

                {/* Predefined colors grids */}
                <div className="bg-colors-presets-grid" style={{ marginTop: 16 }}>
                  {backgroundType === 'color' ? (
                    SOLID_COLORS.map(c => (
                      <button
                        key={c.value}
                        onClick={() => setBackgroundVal(c.value)}
                        className={`bg-color-dot ${backgroundVal === c.value ? 'active' : ''}`}
                        style={{ background: c.value }}
                        title={c.name}
                      />
                    ))
                  ) : (
                    GRADIENTS.map(g => (
                      <button
                        key={g.value}
                        onClick={() => setBackgroundVal(g.value)}
                        className={`bg-color-dot gradient ${backgroundVal === g.value ? 'active' : ''}`}
                        style={{ background: g.value }}
                        title={g.name}
                      />
                    ))
                  )}
                </div>
              </div>

              {/* Texture Overlays selectors */}
              <div className="form-group" style={{ marginTop: 24 }}>
                <label>{t('storylab.texture')}</label>
                <div className="texture-selectors-stack">
                  {(['none', 'grain', 'paper', 'scratches'] as TextureType[]).map(tStyle => (
                    <button
                      key={tStyle}
                      onClick={() => setTexture(tStyle)}
                      className={`texture-btn ${texture === tStyle ? 'active' : ''}`}
                    >
                      <div className={`texture-preview-mini ${tStyle}`}></div>
                      <span className="texture-name">
                        {tStyle === 'none' ? t('storylab.textureNone') :
                         tStyle === 'grain' ? t('storylab.textureGrain') :
                         tStyle === 'paper' ? t('storylab.texturePaper') :
                         t('storylab.textureScratches')}
                      </span>
                    </button>
                  ))}
                </div>
              </div>

              {/* Stickers/Tape additions */}
              <div className="form-group" style={{ marginTop: 24 }}>
                <label>{t('storylab.stickers')}</label>
                <button
                  onClick={addTapeSticker}
                  className="btn btn-primary"
                  style={{ width: '100%', background: 'rgba(250, 240, 230, 0.9)', color: '#27272A', border: '1.5px solid var(--card-border)', display: 'flex', justifyContent: 'center', gap: 6 }}
                >
                  <Smile size={16} />
                  {t('storylab.addSticker')}
                </button>
              </div>

            </div>
          )}

          {/* Export & Warning Banner */}
          <div className="sidebar-bottom-actions" style={{ marginTop: 'auto', paddingTop: 20, borderTop: '1.5px dashed var(--card-border)' }}>
            
            <div className="export-warning-card">
              <span className="warning-text">⚠️ {t('storylab.exportWarning')}</span>
            </div>

            <button 
              onClick={exportStory}
              className="btn btn-primary btn-generate"
              style={{ width: '100%', display: 'flex', justifyContent: 'center', gap: 8 }}
            >
              <Download size={18} />
              <span>{t('storylab.exportImage')}</span>
            </button>
          </div>

        </div>

      </div>

      {/* Hidden file input */}
      <input 
        type="file" 
        ref={fileInputRef} 
        onChange={handleFileChange}
        accept="image/*,video/*"
        multiple
        style={{ display: 'none' }}
      />

      {/* Hidden export canvas */}
      <canvas ref={exportCanvasRef} style={{ display: 'none' }}></canvas>

      {/* Media Source Picker Modal */}
      {showSourcePicker && (
        <div className="camera-modal-overlay" onClick={() => setShowSourcePicker(false)}>
          <div className="camera-modal-container source-picker-container" onClick={(e) => e.stopPropagation()}>
            <div className="camera-modal-header">
              <h3>{lang === 'vi' ? 'Chọn Phương Thức Nhập' : 'Choose Import Source'}</h3>
              <button className="camera-close-btn" onClick={() => setShowSourcePicker(false)}>×</button>
            </div>
            <div style={{ padding: '24px', display: 'flex', flexDirection: 'column', gap: '14px' }}>
              <button 
                className="source-picker-option-btn upload"
                onClick={() => {
                  setShowSourcePicker(false);
                  fileInputRef.current?.click();
                }}
              >
                <Upload size={18} />
                {lang === 'vi' ? 'Tải tệp lên từ thiết bị' : 'Upload file from device'}
              </button>

              <button 
                className="source-picker-option-btn camera"
                onClick={() => {
                  setShowSourcePicker(false);
                  openCameraModal();
                }}
              >
                <Camera size={18} />
                {lang === 'vi' ? 'Chụp / Quay trực tiếp' : 'Shoot / Record webcam'}
              </button>

              <button 
                className="btn-clear" 
                style={{ width: '100%', padding: '8px', marginTop: '4px', fontSize: '0.88rem', fontWeight: 600, color: 'var(--text-secondary)' }}
                onClick={() => setShowSourcePicker(false)}
              >
                {lang === 'vi' ? 'Hủy bỏ' : 'Cancel'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Camera Capture Modal */}
      {isCameraOpen && (
        <div className="camera-modal-overlay">
          <div className="camera-modal-container">
            <div className="camera-modal-header">
              <h3>{t('storylab.cameraModalTitle')}</h3>
              <button className="camera-close-btn" onClick={closeCameraModal}>×</button>
            </div>
            
            <div className="camera-modal-content">
              {cameraErrorMsg ? (
                <div className="camera-error">
                  <p>{cameraErrorMsg}</p>
                </div>
              ) : (
                <div className="camera-preview-wrapper">
                  <video 
                    ref={videoPreviewRef} 
                    autoPlay 
                    muted 
                    playsInline 
                    className="camera-video-element"
                  />
                  {isRecording && (
                    <div className="camera-recording-badge">
                      <span className="rec-dot"></span>
                      <span>{t('storylab.recordingTime')} {recordingDuration}s / 8s</span>
                    </div>
                  )}
                </div>
              )}
            </div>

            {!cameraErrorMsg && (
              <div className="camera-modal-footer">
                {cameraDevices.length > 1 && (
                  <div className="camera-device-select">
                    <label>{t('storylab.switchCamera')}: </label>
                    <select 
                      value={activeCameraId} 
                      onChange={(e) => switchCamera(e.target.value)}
                      className="form-input"
                      style={{ padding: '4px 8px', fontSize: '0.8rem', width: 'auto', display: 'inline-block' }}
                    >
                      {cameraDevices.map((device, idx) => (
                        <option key={device.deviceId} value={device.deviceId}>
                          {device.label || `Camera ${idx + 1}`}
                        </option>
                      ))}
                    </select>
                  </div>
                )}

                <div className="camera-control-buttons">
                  {!isRecording ? (
                    <>
                      {/* Photo Button */}
                      <button 
                        onClick={capturePhoto} 
                        className="btn btn-primary"
                        style={{ gap: 6 }}
                      >
                        <Camera size={16} />
                        {t('storylab.takePhoto')}
                      </button>

                      {/* Record Video Button */}
                      <button 
                        onClick={startRecording} 
                        className="btn"
                        style={{ gap: 6, background: '#EF4444', color: 'white', borderColor: 'var(--text-primary)', boxShadow: '3px 3px 0px 0px var(--text-primary)' }}
                      >
                        <Video size={16} />
                        {t('storylab.startRecord')}
                      </button>
                    </>
                  ) : (
                    <button 
                      onClick={stopRecording} 
                      className="btn"
                      style={{ background: '#EF4444', color: 'white', borderColor: 'var(--text-primary)', boxShadow: '3px 3px 0px 0px var(--text-primary)', gap: 6 }}
                    >
                      <span className="rec-dot" style={{ background: 'white' }}></span>
                      {t('storylab.stopRecord')}
                    </button>
                  )}
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* CSS Styles */}
      <style>{`
        /* Canvas Viewports ratios */
        .story-canvas-viewport {
          transform-origin: center center;
          transition: background 0.3s ease;
        }

        .story-canvas-viewport.ratio-9-16 {
          width: 315px;
          height: 560px;
        }

        .story-canvas-viewport.ratio-1-1 {
          width: 380px;
          height: 380px;
        }

        .story-canvas-viewport.ratio-4-5 {
          width: 352px;
          height: 440px;
        }

        /* Responsive ratios wrapper */
        @media (max-width: 500px) {
          .story-canvas-viewport.ratio-9-16 {
            width: 250px;
            height: 444px;
          }
          .story-canvas-viewport.ratio-1-1 {
            width: 280px;
            height: 280px;
          }
          .story-canvas-viewport.ratio-4-5 {
            width: 260px;
            height: 325px;
          }
        }

        /* Polaroid styling */
        .polaroid-body {
          background: #FFFFFF;
          box-shadow: 0 4px 15px rgba(0,0,0,0.08);
          border-radius: 4px;
          padding: 8px;
        }

        .polaroid-shadow-card {
          position: absolute;
          top: 0; left: 0; right: 0; bottom: 0;
          box-shadow: inset 0 0 20px rgba(0,0,0,0.02);
          pointer-events: none;
          z-index: 5;
        }

        /* Film strip styling */
        .filmstrip-body {
          background: #18181B;
          border-radius: 2px;
        }

        .film-holes-wrapper {
          position: absolute;
          top: 0; left: 0; right: 0; bottom: 0;
          pointer-events: none;
          z-index: 5;
        }

        .sprocket-hole {
          position: absolute;
          width: 4%;
          height: 12%;
          background: var(--bg-cream);
          opacity: 0.9;
          border-radius: 1px;
        }
        
        /* Apply reactive theme background colors to hole sprocket markers */
        [data-theme='dark'] .sprocket-hole {
          background: #27272A !important;
        }

        .sprocket-hole.l-top { left: 5%; top: 10%; }
        .sprocket-hole.l-bot { left: 5%; bottom: 10%; }
        .sprocket-hole.r-top { right: 5%; top: 10%; }
        .sprocket-hole.r-bot { right: 5%; bottom: 10%; }

        /* Media slot border overlays */
        .media-slot-card {
          border: 1px solid transparent;
          box-sizing: border-box;
        }

        .media-slot-card.selected {
          border: 1.5px solid var(--accent);
          box-shadow: 0 0 0 2px rgba(46,125,96,0.1);
        }

        /* Textures overlays */
        .texture-grain-overlay {
          position: absolute;
          top: 0; left: 0; right: 0; bottom: 0;
          background-image: url("data:image/svg+xml,%3Csvg viewBox='0 0 200 200' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noise'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.8' numOctaves='3' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noise)'/%3E%3C/svg%3E");
          opacity: 0.08;
          pointer-events: none;
          z-index: 30;
          mix-blend-mode: overlay;
        }

        .texture-paper-overlay {
          position: absolute;
          top: 0; left: 0; right: 0; bottom: 0;
          background-image: linear-gradient(145deg, rgba(255,255,255,0.15) 20%, rgba(0,0,0,0.03) 80%);
          pointer-events: none;
          z-index: 30;
        }

        .texture-paper-overlay::before {
          content: '';
          position: absolute;
          top: 0; left: 0; right: 0; bottom: 0;
          border-top: 1.5px solid rgba(255,255,255,0.25);
          border-bottom: 1px solid rgba(0,0,0,0.05);
          transform: rotate(-15deg) scale(1.4);
          pointer-events: none;
        }

        .texture-scratches-overlay {
          position: absolute;
          top: 0; left: 0; right: 0; bottom: 0;
          pointer-events: none;
          z-index: 30;
          opacity: 0.15;
        }
        
        .texture-scratches-overlay::after {
          content: '';
          position: absolute;
          top: 10%; left: 35%; width: 1.5px; height: 60%;
          background: rgba(255,255,255,0.3);
          transform: rotate(4deg);
        }

        /* Filters presets style helpers for editor sidebar previews */
        .filter-btn {
          display: flex;
          flex-direction: column;
          align-items: center;
          background: transparent;
          border: 1.5px solid var(--card-border);
          border-radius: var(--radius-sm);
          padding: 6px;
          cursor: pointer;
          transition: var(--transition-bounce);
          gap: 6px;
        }

        .filter-btn.active {
          border-color: var(--accent);
          background: rgba(46,125,96,0.03);
          box-shadow: 2px 2px 0px var(--accent);
        }

        .filter-preview {
          width: 48px;
          height: 48px;
          border-radius: 4px;
          background: #EAEAEA;
          background-image: linear-gradient(to right, #B5FFFC, #FFDEE9);
        }

        .filter-preview.vintage { filter: contrast(1.15) sepia(0.25) saturate(0.85); }
        .filter-preview.bw { filter: grayscale(1); }
        .filter-preview.warm { filter: sepia(0.2) saturate(1.1) hue-rotate(-5deg); }
        .filter-preview.cool { filter: saturate(0.9) hue-rotate(5deg); }
        .filter-preview.sepia { filter: sepia(1); }

        .filters-grid {
          display: grid;
          grid-template-columns: repeat(3, 1fr);
          gap: 8px;
          margin-top: 8px;
        }

        /* Layout templates thumbs */
        .template-thumbnails-stack {
          display: grid;
          grid-template-columns: repeat(2, 1fr);
          gap: 12px;
          margin-top: 8px;
        }

        .tpl-thumbnail-btn {
          display: flex;
          flex-direction: column;
          align-items: center;
          background: var(--bg-cream);
          border: 1.5px solid var(--card-border);
          border-radius: var(--radius-md);
          padding: 10px;
          cursor: pointer;
          transition: var(--transition-bounce);
          gap: 8px;
        }

        .tpl-thumbnail-btn.active {
          border-color: var(--accent);
          background: var(--card-bg);
          box-shadow: 3px 3px 0 var(--accent);
          transform: translateY(-2px);
        }

        .tpl-visual-box {
          width: 80px;
          height: 110px;
          background: #eef2f5;
          position: relative;
          border-radius: 4px;
          overflow: hidden;
          border: 1px solid var(--card-border);
        }

        .tpl-name {
          font-size: 0.72rem;
          font-weight: 700;
          color: var(--text-primary);
        }

        /* Ratio buttons styles */
        .ratio-selectors-grid {
          display: grid;
          grid-template-columns: repeat(3, 1fr);
          gap: 8px;
          margin-top: 8px;
        }

        .ratio-btn {
          display: flex;
          flex-direction: column;
          align-items: center;
          background: var(--card-bg);
          border: 1.5px solid var(--card-border);
          border-radius: var(--radius-sm);
          padding: 8px;
          cursor: pointer;
          transition: var(--transition-bounce);
          gap: 6px;
        }

        .ratio-btn.active {
          border-color: var(--accent);
          background: rgba(46,125,96,0.03);
          box-shadow: 2px 2px 0 var(--accent);
        }

        .ratio-rect {
          width: 20px;
          background: rgba(46,125,96,0.15);
          border: 1.5px solid var(--card-border);
          border-radius: 2px;
        }

        .ratio-btn.active .ratio-rect {
          background: var(--accent);
          border-color: var(--accent);
        }

        /* Font selectors style */
        .font-selectors-row {
          display: flex;
          gap: 8px;
          margin-top: 8px;
        }

        .font-select-btn {
          flex: 1;
          height: 38px;
          border-radius: 8px;
          border: 1.5px solid var(--card-border);
          background: var(--card-bg);
          color: var(--text-primary);
          font-size: 1rem;
          cursor: pointer;
          transition: var(--transition-bounce);
        }

        .font-select-btn.active {
          border-color: var(--accent);
          background: var(--accent);
          color: #FFFFFF;
        }

        /* Background selectors color grids */
        .bg-colors-presets-grid {
          display: grid;
          grid-template-columns: repeat(7, 1fr);
          gap: 6px;
        }

        .bg-color-dot {
          width: 28px;
          height: 28px;
          border-radius: 50%;
          border: 1px solid rgba(0,0,0,0.06);
          cursor: pointer;
          transition: var(--transition-bounce);
        }

        .bg-color-dot.active {
          transform: scale(1.15);
          border: 2px solid var(--accent) !important;
          box-shadow: 0 2px 8px rgba(0,0,0,0.15);
        }

        /* Textures select button options */
        .texture-selectors-stack {
          display: grid;
          grid-template-columns: repeat(2, 1fr);
          gap: 10px;
          margin-top: 8px;
        }

        .texture-btn {
          display: flex;
          align-items: center;
          gap: 10px;
          padding: 8px;
          border: 1.5px solid var(--card-border);
          border-radius: var(--radius-sm);
          background: var(--card-bg);
          cursor: pointer;
          transition: var(--transition-bounce);
        }

        .texture-btn.active {
          border-color: var(--accent);
          background: rgba(46,125,96,0.03);
          box-shadow: 2px 2px 0 var(--accent);
        }

        .texture-preview-mini {
          width: 26px;
          height: 26px;
          border-radius: 4px;
          background: #FFF;
          border: 1px solid var(--card-border);
          position: relative;
          overflow: hidden;
        }
        
        .texture-preview-mini.grain {
          background-image: url("data:image/svg+xml,%3Csvg viewBox='0 0 100 100' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noise'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='1'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noise)'/%3E%3C/svg%3E");
          opacity: 0.15;
        }

        .texture-preview-mini.paper {
          background-image: linear-gradient(135deg, #FFF 60%, #EEE 100%);
        }
        
        .texture-preview-mini.paper::before {
          content: '';
          position: absolute;
          top: 0; left: 0; right: 0; bottom: 0;
          border-top: 1px solid rgba(0,0,0,0.08);
          transform: rotate(-25deg);
        }

        .texture-preview-mini.scratches::after {
          content: '';
          position: absolute;
          top: 10%; left: 40%; width: 1px; height: 80%;
          background: rgba(0,0,0,0.15);
          transform: rotate(5deg);
        }

        .texture-name {
          font-size: 0.76rem;
          font-weight: 700;
          color: var(--text-primary);
        }

        /* Color dot pickers */
        .color-picker-row {
          display: flex;
          gap: 6px;
          margin-top: 8px;
        }

        .color-dot {
          width: 24px;
          height: 24px;
          border-radius: 50%;
          cursor: pointer;
          transition: var(--transition-bounce);
        }

        .color-dot.active {
          transform: scale(1.25);
          border: 2px solid var(--accent) !important;
        }

        /* Helper layouts warning and indicator styles */
        .slot-selection-indicator {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: 12px;
          padding: 8px 12px;
          background: rgba(46,125,96,0.04);
          border-radius: var(--radius-sm);
          border: 1px dashed rgba(46,125,96,0.15);
        }

        .badge-slot {
          font-size: 0.72rem;
          font-weight: 700;
          color: var(--accent);
          background: var(--accent-light);
          padding: 2px 6px;
          border-radius: 4px;
        }

        .media-actions-row {
          display: flex;
          gap: 8px;
          margin-bottom: 20px;
        }

        .no-selection-prompt {
          padding: 30px;
          text-align: center;
          font-size: 0.88rem;
          color: var(--text-secondary);
          border: 1.5px dashed var(--card-border);
          border-radius: var(--radius-md);
        }

        .canvas-drag-tips {
          margin-top: 16px;
          text-align: center;
        }

        .export-warning-card {
          background: rgba(251, 191, 36, 0.05);
          border: 1px solid rgba(251, 191, 36, 0.15);
          padding: 8px 12px;
          border-radius: var(--radius-sm);
          margin-bottom: 12px;
          text-align: center;
        }

        .warning-text {
          font-size: 0.72rem;
          color: #D97706;
          font-weight: 600;
        }

        /* Tab switches styles */
        .tab-switch-row {
          display: flex;
          background: rgba(46, 125, 96, 0.05);
          border: 1px solid rgba(46, 125, 96, 0.08);
          padding: 4px;
          border-radius: var(--radius-sm);
          gap: 4px;
        }

        [data-theme="dark"] .tab-switch-row {
          background: rgba(16, 185, 129, 0.05);
          border-color: rgba(16, 185, 129, 0.08);
        }

        .tab-switch-btn {
          flex: 1;
          background: transparent;
          border: none;
          padding: 8px 4px;
          border-radius: 6px;
          font-size: 0.8rem;
          font-weight: 700;
          color: var(--text-secondary);
          cursor: pointer;
          transition: var(--transition-bounce);
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 6px;
        }

        .tab-switch-btn:hover {
          color: var(--text-primary);
          background: rgba(46, 125, 96, 0.03);
        }

        [data-theme="dark"] .tab-switch-btn:hover {
          background: rgba(16, 185, 129, 0.03);
        }

        .tab-switch-btn.active {
          background: var(--card-bg);
          color: var(--accent);
          box-shadow: 0 2px 8px rgba(46, 125, 96, 0.1);
        }

        /* Range slider styles */
        .slider-input {
          width: 100%;
          accent-color: var(--accent);
          height: 6px;
          border-radius: 3px;
          outline: none;
          cursor: pointer;
        }

        /* Danger outline buttons style */
        .btn-danger-outline {
          background: transparent;
          color: #EF4444;
          border: 2px solid #EF4444;
          box-shadow: 3px 3px 0px 0px #EF4444;
        }

        .btn-danger-outline:hover {
          background: #FEF2F2;
          transform: translate(-2px, -2px);
          box-shadow: 5px 5px 0px 0px #EF4444;
        }

        [data-theme="dark"] .btn-danger-outline:hover {
          background: rgba(239, 68, 68, 0.1);
        }

        .btn-danger-outline:active {
          transform: translate(0, 0);
          box-shadow: 1px 1px 0px 0px #EF4444;
        }

        /* Camera capture modal styles */
        .camera-modal-overlay {
          position: fixed;
          top: 0;
          left: 0;
          right: 0;
          bottom: 0;
          background: rgba(0, 0, 0, 0.6);
          backdrop-filter: blur(8px);
          display: flex;
          align-items: center;
          justify-content: center;
          z-index: 1000;
          animation: fadeIn 0.3s ease;
        }

        .camera-modal-container {
          background: var(--card-bg);
          border: 3px solid var(--text-primary);
          border-radius: var(--radius-lg);
          box-shadow: 8px 8px 0px 0px var(--text-primary);
          width: 90%;
          max-width: 500px;
          overflow: hidden;
          display: flex;
          flex-direction: column;
        }

        .camera-modal-container.source-picker-container {
          max-width: 380px;
        }

        .source-picker-option-btn {
          width: 100%;
          padding: 14px;
          border-radius: 12px;
          font-size: 0.95rem;
          font-weight: 700;
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 10px;
          cursor: pointer;
          transition: var(--transition-bounce);
        }

        .source-picker-option-btn.upload {
          background: #10B981;
          color: white;
          border: 2px solid var(--text-primary);
          box-shadow: 4px 4px 0px var(--text-primary);
        }

        .source-picker-option-btn.upload:hover {
          transform: translate(-2px, -2px);
          box-shadow: 6px 6px 0px var(--text-primary);
        }

        .source-picker-option-btn.upload:active {
          transform: translate(0px, 0px);
          box-shadow: 2px 2px 0px var(--text-primary);
        }

        .source-picker-option-btn.camera {
          background: #fff;
          color: var(--text-primary);
          border: 2px solid var(--text-primary);
          box-shadow: 4px 4px 0px var(--text-primary);
        }

        .source-picker-option-btn.camera:hover {
          transform: translate(-2px, -2px);
          box-shadow: 6px 6px 0px var(--text-primary);
        }

        .source-picker-option-btn.camera:active {
          transform: translate(0px, 0px);
          box-shadow: 2px 2px 0px var(--text-primary);
        }

        [data-theme="dark"] .source-picker-option-btn.camera {
          background: #1f1f23;
          color: #fff;
        }

        .camera-modal-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          padding: 16px 20px;
          border-bottom: 2px solid var(--card-border);
          background: var(--bg-cream);
        }

        .camera-modal-header h3 {
          margin: 0;
          font-family: var(--font-sans);
          font-size: 1.1rem;
          font-weight: 800;
          color: var(--text-primary);
        }

        .camera-close-btn {
          background: transparent;
          border: none;
          font-size: 1.8rem;
          line-height: 1;
          cursor: pointer;
          color: var(--text-primary);
          font-weight: 700;
          transition: var(--transition-bounce);
        }

        .camera-close-btn:hover {
          transform: scale(1.1) rotate(90deg);
        }

        .camera-modal-content {
          background: #000;
          position: relative;
          aspect-ratio: 4 / 3;
          display: flex;
          align-items: center;
          justify-content: center;
          overflow: hidden;
        }

        .camera-preview-wrapper {
          width: 100%;
          height: 100%;
          position: relative;
        }

        .camera-video-element {
          width: 100%;
          height: 100%;
          object-fit: cover;
          transform: scaleX(-1); /* mirror effect */
        }

        .camera-recording-badge {
          position: absolute;
          top: 12px;
          left: 12px;
          background: rgba(0, 0, 0, 0.75);
          color: #FFF;
          padding: 6px 10px;
          border-radius: 20px;
          font-size: 0.72rem;
          font-weight: 700;
          display: flex;
          align-items: center;
          gap: 6px;
          border: 1px solid rgba(255, 255, 255, 0.2);
          z-index: 10;
        }

        .rec-dot {
          width: 8px;
          height: 8px;
          background: #EF4444;
          border-radius: 50%;
          animation: recBlink 1s infinite alternate;
          display: inline-block;
        }

        @keyframes recBlink {
          0% { opacity: 0.3; }
          100% { opacity: 1; }
        }

        .camera-modal-footer {
          padding: 20px;
          display: flex;
          flex-direction: column;
          gap: 16px;
          align-items: center;
          background: var(--bg-cream);
          border-top: 2px solid var(--card-border);
        }

        .camera-device-select {
          display: flex;
          align-items: center;
          gap: 8px;
          font-size: 0.8rem;
          font-weight: 600;
          color: var(--text-secondary);
        }

        .camera-control-buttons {
          display: flex;
          gap: 12px;
          width: 100%;
          justify-content: center;
        }

        .camera-error {
          padding: 40px 20px;
          text-align: center;
          color: #EF4444;
          font-weight: 600;
          font-size: 0.9rem;
        }
      `}</style>
    </div>
  );
};
