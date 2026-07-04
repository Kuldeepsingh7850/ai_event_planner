import React, { useState, useEffect, useRef } from 'react';
import { useRouter } from 'next/router';
import { useAuth } from '../../context/AuthContext';
import { useNotifications } from '../../context/NotificationContext';
import { LogoBrand } from '../../components/Logo';
import { resolveImage } from '../../utils/imageResolver';
import {
  Sparkles,
  Users,
  Calendar,
  MapPin,
  DollarSign,
  Clock,
  Compass,
  Utensils,
  Palette,
  CheckCircle,
  FileText,
  Loader2,
  ListTodo,
  Check,
  Plus,
  Building,
  X
} from 'lucide-react';

export default function AIEventPlannerIntermediate() {
  const { authFetch } = useAuth();
  const { showToast } = useNotifications();
  const router = useRouter();

  // --- Form Input States ---
  const [eventTitle, setEventTitle] = useState('');
  const [category, setCategory] = useState('');
  const [location, setLocation] = useState('Udaipur, Rajasthan');
  const [eventDate, setEventDate] = useState('');
  const [eventTime, setEventTime] = useState('17:00');
  const [guestCount, setGuestCount] = useState('');
  const [budget, setBudget] = useState('');
  const [specialRequests, setSpecialRequests] = useState('');

  // --- UI States ---
  const [loading, setLoading] = useState(false);
  const [suggestions, setSuggestions] = useState(null);
  const [chosenVenue, setChosenVenue] = useState(null); // Selected venue card state
  const [selectedVenue, setSelectedVenue] = useState(null); // venue details modal state

  const canvasRef = useRef(null);
  const [posterTheme, setPosterTheme] = useState('indigo');

  const catLower = (category || '').toLowerCase();
  const isCorporate = catLower.includes('corporate') || catLower.includes('conference') || catLower.includes('product') || catLower.includes('exhibition');
  const isFestive = catLower.includes('birthday') || catLower.includes('shower') || catLower.includes('other') || catLower === '';
  const isAcademic = catLower.includes('college') || catLower.includes('cultural') || catLower.includes('fest');
  const isRoyal = !isCorporate && !isFestive && !isAcademic;

  const drawPoster = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    ctx.clearRect(0, 0, 800, 1000);

    // 1. Background Gradient
    let bgColor1 = '#1e1b4b'; // Indigo theme
    let bgColor2 = '#0f172a';
    
    if (posterTheme === 'emerald') {
      bgColor1 = '#062d17';
      bgColor2 = '#021209';
    } else if (posterTheme === 'burgundy') {
      bgColor1 = '#300310';
      bgColor2 = '#140005';
    }

    // Corporate theme colors are slightly cooler steel/slate
    if (isCorporate) {
      if (posterTheme === 'emerald') {
        bgColor1 = '#062c30';
        bgColor2 = '#011215';
      } else if (posterTheme === 'indigo') {
        bgColor1 = '#0f172a';
        bgColor2 = '#020617';
      } else {
        bgColor1 = '#1e293b';
        bgColor2 = '#0f172a';
      }
    }

    const bgGrad = ctx.createRadialGradient(400, 500, 50, 400, 500, 600);
    bgGrad.addColorStop(0, bgColor1);
    bgGrad.addColorStop(1, bgColor2);
    ctx.fillStyle = bgGrad;
    ctx.fillRect(0, 0, 800, 1000);

    // If Festive category, draw subtle background sparkles/confetti circles
    if (isFestive) {
      ctx.save();
      const confettiColors = ['rgba(251, 191, 36, 0.15)', 'rgba(236, 72, 153, 0.15)', 'rgba(59, 130, 246, 0.12)', 'rgba(16, 185, 129, 0.12)'];
      const positions = [
        {x: 100, y: 150, r: 15}, {x: 700, y: 180, r: 25}, {x: 120, y: 800, r: 35}, {x: 680, y: 750, r: 20},
        {x: 200, y: 450, r: 8}, {x: 600, y: 480, r: 12}, {x: 150, y: 300, r: 10}, {x: 650, y: 320, r: 14},
        {x: 350, y: 880, r: 18}, {x: 450, y: 880, r: 12}
      ];
      positions.forEach((pos, idx) => {
        ctx.beginPath();
        ctx.arc(pos.x, pos.y, pos.r, 0, 2 * Math.PI);
        ctx.fillStyle = confettiColors[idx % confettiColors.length];
        ctx.fill();
        ctx.beginPath();
        ctx.arc(pos.x - pos.r/3, pos.y - pos.r/3, pos.r/5, 0, 2 * Math.PI);
        ctx.fillStyle = 'rgba(255, 255, 255, 0.2)';
        ctx.fill();
      });
      ctx.restore();
    }

    // 2. Borders and Accents
    let borderGrad = ctx.createLinearGradient(40, 40, 760, 960);
    if (isCorporate) {
      // Sleek silver/platinum gradient for corporate meetings
      borderGrad.addColorStop(0, '#bdc3c7');
      borderGrad.addColorStop(0.25, '#ffffff');
      borderGrad.addColorStop(0.5, '#7f8c8d');
      borderGrad.addColorStop(0.75, '#ffffff');
      borderGrad.addColorStop(1, '#95a5a6');
    } else {
      // Premium Gold Gradient for royal/wedding/festive
      borderGrad.addColorStop(0, '#bf953f');
      borderGrad.addColorStop(0.25, '#fcf6ba');
      borderGrad.addColorStop(0.5, '#b38728');
      borderGrad.addColorStop(0.75, '#fbf5b7');
      borderGrad.addColorStop(1, '#aa771c');
    }

    ctx.strokeStyle = borderGrad;

    const drawDiamond = (cx, cy, size) => {
      ctx.fillStyle = borderGrad;
      ctx.beginPath();
      ctx.moveTo(cx, cy - size);
      ctx.lineTo(cx + size, cy);
      ctx.lineTo(cx, cy + size);
      ctx.lineTo(cx - size, cy);
      ctx.closePath();
      ctx.fill();
    };

    if (isRoyal) {
      // Traditional royal double gold frame
      ctx.lineWidth = 4;
      ctx.strokeRect(40, 40, 720, 920);

      ctx.lineWidth = 1.5;
      ctx.strokeRect(52, 52, 696, 896);

      const drawCorners = (x1, y1, x2, y2, size) => {
        ctx.strokeStyle = borderGrad;
        ctx.lineWidth = 2;
        ctx.beginPath();
        ctx.moveTo(x1 + size, y1); ctx.lineTo(x1, y1); ctx.lineTo(x1, y1 + size);
        ctx.stroke();

        ctx.beginPath();
        ctx.moveTo(x2 - size, y1); ctx.lineTo(x2, y1); ctx.lineTo(x2, y1 + size);
        ctx.stroke();

        ctx.beginPath();
        ctx.moveTo(x1 + size, y2); ctx.lineTo(x1, y2); ctx.lineTo(x1, y2 - size);
        ctx.stroke();

        ctx.beginPath();
        ctx.moveTo(x2 - size, y2); ctx.lineTo(x2, y2); ctx.lineTo(x2, y2 - size);
        ctx.stroke();
      };

      drawCorners(52, 52, 748, 948, 25);
      drawCorners(40, 40, 760, 960, 35);

      drawDiamond(70, 70, 6);
      drawDiamond(730, 70, 6);
      drawDiamond(70, 930, 6);
      drawDiamond(730, 930, 6);
    } 
    else if (isFestive) {
      // Rounded festive gold frame
      ctx.lineWidth = 3;
      ctx.beginPath();
      ctx.roundRect(40, 40, 720, 920, 30);
      ctx.stroke();

      // Dotted inner frame
      ctx.lineWidth = 1.5;
      ctx.setLineDash([8, 8]);
      ctx.beginPath();
      ctx.roundRect(55, 55, 690, 890, 20);
      ctx.stroke();
      ctx.setLineDash([]); // Reset line dash

      // Little stars in corners
      const drawStar = (cx, cy, spikes, outerRadius, innerRadius) => {
        let rot = Math.PI / 2 * 3;
        let x = cx;
        let y = cy;
        let step = Math.PI / spikes;

        ctx.beginPath();
        ctx.moveTo(cx, cy - outerRadius);
        for (let i = 0; i < spikes; i++) {
          x = cx + Math.cos(rot) * outerRadius;
          y = cy + Math.sin(rot) * outerRadius;
          ctx.lineTo(x, y);
          rot += step;
          x = cx + Math.cos(rot) * innerRadius;
          y = cy + Math.sin(rot) * innerRadius;
          ctx.lineTo(x, y);
          rot += step;
        }
        ctx.lineTo(cx, cy - outerRadius);
        ctx.closePath();
        ctx.fillStyle = borderGrad;
        ctx.fill();
      };

      drawStar(70, 70, 5, 12, 6);
      drawStar(730, 70, 5, 12, 6);
      drawStar(70, 930, 5, 12, 6);
      drawStar(730, 930, 5, 12, 6);
    } 
    else if (isCorporate) {
      // Minimalist tech/professional border with custom bracket accents
      ctx.lineWidth = 2;
      ctx.strokeRect(40, 40, 720, 920);
      
      ctx.lineWidth = 0.75;
      ctx.strokeRect(46, 46, 708, 908);
      
      ctx.lineWidth = 3.5;
      // Top left bracket
      ctx.beginPath(); ctx.moveTo(35, 75); ctx.lineTo(35, 35); ctx.lineTo(75, 35); ctx.stroke();
      // Top right bracket
      ctx.beginPath(); ctx.moveTo(765, 75); ctx.lineTo(765, 35); ctx.lineTo(725, 35); ctx.stroke();
      // Bottom left bracket
      ctx.beginPath(); ctx.moveTo(35, 925); ctx.lineTo(35, 965); ctx.lineTo(75, 965); ctx.stroke();
      // Bottom right bracket
      ctx.beginPath(); ctx.moveTo(765, 925); ctx.lineTo(765, 965); ctx.lineTo(725, 965); ctx.stroke();
    }
    else if (isAcademic) {
      // Geometric modern frame with octagonal corners
      ctx.lineWidth = 3;
      ctx.strokeRect(40, 40, 720, 920);

      ctx.lineWidth = 1.5;
      ctx.beginPath();
      const offset = 35;
      ctx.moveTo(40 + offset, 52);
      ctx.lineTo(760 - offset, 52);
      ctx.lineTo(748, 40 + offset);
      ctx.lineTo(748, 960 - offset);
      ctx.lineTo(760 - offset, 948);
      ctx.lineTo(40 + offset, 948);
      ctx.lineTo(52, 960 - offset);
      ctx.lineTo(52, 40 + offset);
      ctx.closePath();
      ctx.stroke();
    }

    // 3. Emblems and Badges
    if (isRoyal) {
      // Traditional royal mandala emblem
      ctx.save();
      ctx.translate(400, 160);
      ctx.strokeStyle = borderGrad;
      ctx.lineWidth = 1.5;
      for (let i = 0; i < 16; i++) {
        ctx.rotate(Math.PI / 8);
        ctx.beginPath(); ctx.moveTo(0, 0); ctx.lineTo(0, -22); ctx.stroke();
        ctx.beginPath(); ctx.arc(0, -22, 3, 0, 2 * Math.PI); ctx.fillStyle = '#fcf6ba'; ctx.fill();
      }
      ctx.restore();
      ctx.beginPath(); ctx.arc(400, 160, 9, 0, 2 * Math.PI); ctx.fillStyle = borderGrad; ctx.fill();
    } 
    else if (isFestive) {
      // Playful balloons emblem
      ctx.save();
      ctx.translate(400, 150);
      ctx.strokeStyle = borderGrad;
      ctx.lineWidth = 1.2;
      
      const balColors = ['rgba(239, 68, 68, 0.85)', 'rgba(59, 130, 246, 0.85)', 'rgba(245, 158, 11, 0.85)'];
      const offsets = [{x: -12, y: -8}, {x: 12, y: -8}, {x: 0, y: -20}];
      
      offsets.forEach(off => {
        ctx.beginPath();
        ctx.moveTo(off.x, off.y);
        ctx.bezierCurveTo(off.x / 2, 20, 0, 25, 0, 35);
        ctx.stroke();
      });

      offsets.forEach((off, idx) => {
        ctx.beginPath();
        ctx.arc(off.x, off.y, 13, 0, 2 * Math.PI);
        ctx.fillStyle = balColors[idx];
        ctx.fill();
        ctx.beginPath();
        ctx.arc(off.x - 4, off.y - 4, 3, 0, 2 * Math.PI);
        ctx.fillStyle = 'rgba(255, 255, 255, 0.3)';
        ctx.fill();
      });
      ctx.restore();
    }
    else if (isCorporate) {
      // Corporate minimalist hexagon badge
      ctx.save();
      ctx.translate(400, 160);
      ctx.strokeStyle = borderGrad;
      ctx.lineWidth = 2.5;
      
      ctx.beginPath();
      for (let i = 0; i < 6; i++) {
        const angle = i * Math.PI / 3;
        const x = Math.cos(angle) * 20;
        const y = Math.sin(angle) * 20;
        if (i === 0) ctx.moveTo(x, y);
        else ctx.lineTo(x, y);
      }
      ctx.closePath();
      ctx.stroke();

      ctx.beginPath();
      ctx.moveTo(0, -9); ctx.lineTo(9, 0); ctx.lineTo(0, 9); ctx.lineTo(-9, 0);
      ctx.closePath();
      ctx.fillStyle = borderGrad;
      ctx.fill();
      ctx.restore();
    }
    else if (isAcademic) {
      // Academic / college fest graduation hat emblem
      ctx.save();
      ctx.translate(400, 160);
      ctx.strokeStyle = borderGrad;
      ctx.lineWidth = 1.5;
      
      ctx.fillStyle = borderGrad;
      ctx.beginPath();
      ctx.moveTo(0, -13); ctx.lineTo(22, -3); ctx.lineTo(0, 7); ctx.lineTo(-22, -3);
      ctx.closePath();
      ctx.fill();

      ctx.beginPath();
      ctx.roundRect(-9, 3, 18, 5, 2);
      ctx.fill();
      
      ctx.beginPath(); ctx.moveTo(16, -5); ctx.lineTo(20, 10); ctx.stroke();
      ctx.restore();
    }

    // 4. Typography, Layout and Messaging
    ctx.textAlign = 'center';

    let fontName = 'Georgia';
    if (isCorporate) fontName = 'system-ui, -apple-system, sans-serif';
    else if (isFestive) fontName = 'Arial, sans-serif';

    // Wording prefixes based on event type
    let invitePrefix = "YOU ARE CORDIALLY INVITED TO THE";
    if (isCorporate) invitePrefix = "INVITATION TO THE PROFESSIONAL";
    else if (isFestive) invitePrefix = "LET'S PARTY! YOU'RE INVITED TO THE";
    else if (isAcademic) invitePrefix = "WELCOME TO THE CELEBRATION OF THE";

    ctx.font = isCorporate 
      ? 'bold 12px "system-ui", sans-serif'
      : isFestive 
      ? 'bold 13px "Arial", sans-serif' 
      : 'normal 13px "Georgia", serif';
      
    ctx.fillStyle = '#e5e7eb';
    if (ctx.letterSpacing !== undefined) ctx.letterSpacing = isCorporate ? '5px' : '3px';
    ctx.fillText(invitePrefix, 400, 220);

    // Event Category Title Wording
    ctx.font = isCorporate
      ? '900 25px "system-ui", sans-serif'
      : isFestive
      ? '900 27px "Arial", sans-serif'
      : 'bold 22px "Georgia", serif';
      
    ctx.fillStyle = borderGrad;
    if (ctx.letterSpacing !== undefined) ctx.letterSpacing = '5px';
    ctx.fillText((category || 'EVENT CELEBRATION').toUpperCase(), 400, 260);

    // Dynamic Separator line with diamond/star
    ctx.strokeStyle = isCorporate ? 'rgba(189, 195, 199, 0.3)' : 'rgba(191, 149, 63, 0.4)';
    ctx.lineWidth = 1;
    ctx.beginPath();
    ctx.moveTo(320, 290);
    ctx.lineTo(480, 290);
    ctx.stroke();
    
    if (isCorporate) {
      ctx.beginPath(); ctx.moveTo(395, 283); ctx.lineTo(405, 297); ctx.stroke();
    } else if (isFestive) {
      ctx.beginPath(); ctx.arc(400, 290, 4, 0, 2 * Math.PI); ctx.fillStyle = borderGrad; ctx.fill();
    } else {
      drawDiamond(400, 290, 4);
    }

    // Main Event Title (adjust size dynamically if long, and wrap text)
    let titleFontSize = 42;
    if (eventTitle && eventTitle.length > 25) titleFontSize = 32;
    if (eventTitle && eventTitle.length > 40) titleFontSize = 24;
    
    ctx.font = isCorporate
      ? `800 ${titleFontSize}px "system-ui", sans-serif`
      : isFestive
      ? `900 ${titleFontSize}px "Arial", sans-serif`
      : `bold ${titleFontSize}px "Georgia", serif`;
      
    ctx.fillStyle = '#ffffff';
    ctx.shadowColor = 'rgba(0, 0, 0, 0.5)';
    ctx.shadowBlur = isCorporate ? 2 : 4;
    ctx.shadowOffsetX = 2;
    ctx.shadowOffsetY = 2;

    const maxTitleWidth = 640;
    const titleLineHeight = titleFontSize * 1.3;
    const titleText = eventTitle || 'Royal Celebration';
    const words = titleText.split(' ');
    let line = '';
    let titleLines = [];
    for (let n = 0; n < words.length; n++) {
      let testLine = line + words[n] + ' ';
      let metrics = ctx.measureText(testLine);
      let testWidth = metrics.width;
      if (testWidth > maxTitleWidth && n > 0) {
        titleLines.push(line);
        line = words[n] + ' ';
      } else {
        line = testLine;
      }
    }
    titleLines.push(line);
    
    let startY = 360 - ((titleLines.length - 1) * titleLineHeight) / 2;
    for (let i = 0; i < titleLines.length; i++) {
      ctx.fillText(titleLines[i].trim(), 400, startY + (i * titleLineHeight));
    }
    
    ctx.shadowBlur = 0; ctx.shadowOffsetX = 0; ctx.shadowOffsetY = 0;

    // Invitation message text based on category
    let inviteMessage = "to honor and celebrate this auspicious occasion with us";
    if (isCorporate) inviteMessage = "for a day of networking, innovation, and strategic insights";
    else if (isFestive) inviteMessage = "join us for a fantastic day filled with laughter, drinks, and memories";
    else if (isAcademic) inviteMessage = "celebrate the spirit of learning, community, and future achievements";

    ctx.font = isCorporate
      ? 'normal 13px "system-ui", sans-serif'
      : isFestive
      ? 'bold 14px "Arial", sans-serif'
      : 'italic 15px "Georgia", serif';
      
    ctx.fillStyle = '#d1d5db';
    if (ctx.letterSpacing !== undefined) ctx.letterSpacing = 'normal';
    ctx.fillText(inviteMessage, 400, 415);

    // Separator line
    ctx.beginPath();
    ctx.moveTo(280, 455);
    ctx.lineTo(520, 455);
    ctx.stroke();
    
    if (isCorporate) {
      // minimal clean line
    } else if (isFestive) {
      ctx.beginPath(); ctx.arc(400, 455, 4, 0, 2 * Math.PI); ctx.fillStyle = borderGrad; ctx.fill();
    } else {
      drawDiamond(400, 455, 4);
    }

    // Date Section
    ctx.font = isCorporate
      ? 'bold 12px "system-ui", sans-serif'
      : 'bold 15px "Georgia", serif';
    ctx.fillStyle = borderGrad;
    if (ctx.letterSpacing !== undefined) ctx.letterSpacing = '3px';
    ctx.fillText("DATE & TIME", 400, 515);

    // Format Date string
    let formattedDateStr = eventDate;
    if (eventDate) {
      try {
        const dateObj = new Date(eventDate);
        if (!isNaN(dateObj.getTime())) {
          formattedDateStr = dateObj.toLocaleDateString('en-US', {
            weekday: 'long',
            year: 'numeric',
            month: 'long',
            day: 'numeric'
          });
        }
      } catch (e) {}
    }
    
    ctx.font = isCorporate
      ? 'normal 18px "system-ui", sans-serif'
      : 'normal 20px "Georgia", serif';
    ctx.fillStyle = '#ffffff';
    if (ctx.letterSpacing !== undefined) ctx.letterSpacing = 'normal';
    ctx.fillText(formattedDateStr || 'Wednesday, June 24, 2026', 400, 565);

    // Time
    ctx.font = isCorporate
      ? 'normal 15px "system-ui", sans-serif'
      : 'normal 17px "Georgia", serif';
    ctx.fillStyle = '#d1d5db';
    ctx.fillText(`at ${eventTime || '09:00 AM'} onwards`, 400, 615);

    // Separator line
    ctx.beginPath();
    ctx.moveTo(280, 675);
    ctx.lineTo(520, 675);
    ctx.stroke();
    if (isFestive) {
      ctx.beginPath(); ctx.arc(400, 675, 4, 0, 2 * Math.PI); ctx.fillStyle = borderGrad; ctx.fill();
    } else if (!isCorporate) {
      drawDiamond(400, 675, 4);
    }

    // Theme Subtext
    const selectedTheme = suggestions && suggestions.themes ? (typeof suggestions.themes[0] === 'object' ? (suggestions.themes[0].name || suggestions.themes[0].description) : suggestions.themes[0]) : 'Royal / Traditional';
    ctx.font = isCorporate
      ? 'normal 13px "system-ui", sans-serif'
      : 'italic 14px "Georgia", serif';
    ctx.fillStyle = isCorporate ? '#bdc3c7' : '#bf953f';
    ctx.fillText(`Theme: ${selectedTheme || 'Royal Mewari'}`, 400, 745);

    // Footer decoration
    ctx.strokeStyle = isCorporate ? 'rgba(189, 195, 199, 0.15)' : 'rgba(191, 149, 63, 0.2)';
    ctx.lineWidth = 1;
    ctx.beginPath();
    ctx.moveTo(150, 860);
    ctx.lineTo(650, 860);
    ctx.stroke();

    ctx.font = isCorporate
      ? 'bold 11px "system-ui", sans-serif'
      : 'bold 12px "Georgia", serif';
    ctx.fillStyle = 'rgba(255, 255, 255, 0.4)';
    if (ctx.letterSpacing !== undefined) ctx.letterSpacing = '4px';
    ctx.fillText(isCorporate ? "CORPORATE EVENT HUB  •  UDAIPUR HERITAGE" : "AI EVENT PLANNER  •  UDAIPUR HERITAGE", 400, 890);
  };

  const handleDownloadPoster = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const dataUrl = canvas.toDataURL('image/png');
    const link = document.createElement('a');
    link.download = `${eventTitle || 'event'}_poster.png`;
    link.href = dataUrl;
    link.click();
    showToast('Poster downloaded successfully!', 'success');
  };

  useEffect(() => {
    if (suggestions) {
      setTimeout(drawPoster, 100);
    }
  }, [suggestions, posterTheme, eventTitle, category, eventDate, eventTime, location, chosenVenue]);

  const handleGenerate = async (e) => {
    e.preventDefault();
    if (!eventTitle.trim()) {
      return showToast('Please fill out the event title', 'warning');
    }
    if (!category) {
      return showToast('Please select an event category', 'warning');
    }
    if (!eventDate) {
      return showToast('Please select an event date', 'warning');
    }
    if (!guestCount) {
      return showToast('Please enter estimated guest count', 'warning');
    }
    if (!budget) {
      return showToast('Please enter target budget', 'warning');
    }

    setLoading(true);
    setSuggestions(null);
    setChosenVenue(null);
    setSelectedVenue(null);

    // Context query block
    const notesBlock = `Special requests: ${specialRequests}. Location: Udaipur, Rajasthan. Date: ${eventDate}`;

    // Read all active Udaipur venues from local storage (or fallback to defaults) to send to the AI
    const defaultUdaipurVenues = [
      { id: 1, name: 'The Leela Palace Udaipur', type: 'Luxury Hotel', location: 'Lake Pichola, Udaipur', minCapacity: 200, maxCapacity: 500, rating: 4.8, image: '/leela_palace.jpg', description: 'A majestic palace hotel located on the banks of Lake Pichola, offering signature luxury services and exquisite dining setups for royal weddings.' },
      { id: 2, name: 'Fateh Garh Resort', type: 'Heritage Resort', location: 'Sajjangarh, Udaipur', minCapacity: 100, maxCapacity: 300, rating: 4.6, image: '/monsoon_palace.jpg', description: 'Perched on a hill offering panoramic views of the Aravalli ranges, Fateh Garh is a heritage resort perfect for authentic cultural themes and grand receptions.' },
      { id: 3, name: 'Radisson Blu Udaipur', type: 'Hotel', location: 'Rani Road, Udaipur', minCapacity: 100, maxCapacity: 600, rating: 4.4, image: '/hero_udaipur_3.jpg', description: 'Overlooking Lake Fateh Sagar, this resort features spacious indoor halls and a grand pool deck suitable for corporate fests and engagement parties.' },
      { id: 4, name: 'Bhanwar Singh Palace Udaipur', type: 'Palace', location: 'Udaipur', minCapacity: 250, maxCapacity: 800, rating: 4.7, image: '/hero_udaipur_1.jpg', description: 'A luxurious palace resort featuring expansive lawns and royal architecture, offering an ideal setting for destination weddings in Udaipur.' },
      { id: 5, name: 'Ramada Resort Udaipur', type: 'Resort', location: 'Rampura, Udaipur', minCapacity: 100, maxCapacity: 300, rating: 4.5, image: '/shiv_niwas.jpg', description: 'Ramada Resort & Spa features stone walls and traditional architecture, offering multi-tiered lawns and modern banquet halls.' },
      { id: 6, name: 'Bijolai Fort Udaipur', type: 'Heritage Venue', location: 'Udaipur', minCapacity: 50, maxCapacity: 200, rating: 4.4, image: '/jag_mandir.jpg', description: 'Constructed in the 19th century beside a lake, this fort features heritage courtyards perfect for close-knit traditional functions in Udaipur.' },
      { id: 7, name: 'Hotel Hilltop Palace', type: 'Hotel', location: 'Ambavgarh, Udaipur', minCapacity: 100, maxCapacity: 400, rating: 4.3, image: '/hero_udaipur_2.jpg', description: 'Located atop the highest point in Udaipur, this hotel offers stunning lake views and classical Rajasthani hospitality packages.' },
      { id: 8, name: 'Aravali Lawn', type: 'Lawn', location: 'Udaipur', minCapacity: 150, maxCapacity: 600, rating: 4.2, image: 'https://images.unsplash.com/photo-1519167758481-83f550bb49b3?auto=format&fit=crop&w=600&q=80', description: 'A spacious lush green open lawn nestled near the foothills, offering an open-air starlight dining experience for massive gatherings.' },
      { id: 9, name: 'The Oberoi Udaivilas', type: 'Luxury Hotel', location: 'Haridasji Ki Magri, Udaipur', minCapacity: 150, maxCapacity: 450, rating: 4.9, image: '/oberoi_udaivilas.jpg', description: 'Sprawling over 50 acres, Oberoi Udaivilas features dome-shaped architectural structures and lake views for high-profile luxury events.' },
      { id: 10, name: 'Taj Lake Palace', type: 'Luxury Palace', location: 'Lake Pichola, Udaipur', minCapacity: 50, maxCapacity: 120, rating: 4.9, image: '/taj_lake_palace.jpg', description: 'A stunning white marble palace situated in the center of Lake Pichola, offering a exclusive luxury retreat for VIP intimate celebrations.' }
    ];

    const localVenuesData = localStorage.getItem('venues_data');
    let venuesToAnalyze = defaultUdaipurVenues;
    if (localVenuesData) {
      try {
        const parsed = JSON.parse(localVenuesData).filter(v => v.status !== 'inactive');
        if (parsed.length > 0) {
          venuesToAnalyze = parsed;
        }
      } catch (e) {
        console.error('Error parsing local venues data:', e);
      }
    }

    try {
      const res = await authFetch('/ai/suggestions', {
        method: 'POST',
        body: JSON.stringify({
          title: eventTitle,
          eventType: category,
          budget: budget,
          guestCount: guestCount,
          location: location,
          time: eventTime,
          specialRequests: specialRequests,
          description: notesBlock,
          venues: venuesToAnalyze
        })
      });

      if (res.ok) {
        const data = await res.json();
        // Use AI suggested venues if present, otherwise append local Udaipur venues
        data.venues = data.venues || getUdaipurVenues(budget, guestCount);
        setSuggestions(data);
        showToast('Suggestions generated successfully!', 'success');
      } else {
        const data = await res.json();
        throw new Error(data.message || 'Error communicating with AI services');
      }
    } catch (err) {
      showToast(err.message, 'error');
      // Construct clean local mock suggestions if connection times out or fails
      setTimeout(() => {
        setSuggestions({
          isMock: true,
          description: `A customized planning plan for your ${category.toLowerCase()} event "${eventTitle}" for ${guestCount} guests in ${location}.`,
          themes: [`Classic ${category}`, `${category} Elegance`, `Vibrant Rajasthan Theme`],
          decorations: [
            'Lush floral stage backdrop with color matching lights.',
            'Elegant entryway decorations with welcome signage.',
            'Table settings with matching table cloths and central flower vases.'
          ],
          foods: [
            'Welcome Drinks: Seasonal juices and mocktails.',
            'Starters: Paneer Tikka, Veg Poppers, and Crispy rolls.',
            'Main Buffet: Choice of North Indian dishes, Rajasthani specialties, Dal Makhani, Paneer butter masala, Butter rotis, and Jeera Rice.',
            'Desserts: Warm Gulab Jamun with ice cream.'
          ],
          timeline: shiftTimeline([
            '05:00 PM - Guest Welcoming & Welcome Drinks',
            '06:30 PM - Main Ceremony / Event Presentation',
            '08:00 PM - Opening of Dining Buffet',
            '09:30 PM - Musical session / Speeches',
            '10:30 PM - Event wrap up & return gifts'
          ], eventTime),
          budgetAllocation: [
            { category: 'Venue & Catering (40%)', amount: budget * 0.40, description: 'Venue rental and catering package.' },
            { category: 'Decoration & Theme (20%)', amount: budget * 0.20, description: 'Stage decor, flowers, and lighting setup.' },
            { category: 'Entertainment & DJ (15%)', amount: budget * 0.15, description: 'Sound system, emcee, or music performers.' },
            { category: 'Photography & Media (15%)', amount: budget * 0.15, description: 'Photo coverage and highlight clip editing.' },
            { category: 'Buffer & Planning (10%)', amount: budget * 0.10, description: 'Emergency buffer and digital invitations.' }
          ],
          tips: [
            'Book the selected venue at least 6 weeks in advance.',
            'Label food items properly to identify veg/non-veg selections.',
            'Confirm timeline slots with performers 3 days prior.'
          ],
          venues: getUdaipurVenues(budget, guestCount)
        });
      }, 1000);
    } finally {
      setLoading(false);
    }
  };

  const shiftTimeline = (timeline, startTimeStr) => {
    if (!timeline || !Array.isArray(timeline) || timeline.length === 0 || !startTimeStr) return timeline;
    
    const parts = startTimeStr.split(':');
    if (parts.length < 2) return timeline;
    const startHours = parseInt(parts[0]);
    const startMinutes = parseInt(parts[1]);
    if (isNaN(startHours) || isNaN(startMinutes)) return timeline;

    const getEntryText = (entry) => {
      if (!entry) return '';
      if (typeof entry === 'object') {
        return entry.name || entry.description || entry.time || JSON.stringify(entry);
      }
      return String(entry);
    };

    const firstEntry = timeline[0];
    const firstEntryText = getEntryText(firstEntry);
    const match = firstEntryText.match(/^(\d{2}):(\d{2})\s*(AM|PM)/i);
    if (!match) return timeline;
    
    let origHours = parseInt(match[1]);
    const origMinutes = parseInt(match[2]);
    const ampm = match[3].toUpperCase();
    if (ampm === 'PM' && origHours < 12) origHours += 12;
    if (ampm === 'AM' && origHours === 12) origHours = 0;

    const diffMinutes = (startHours * 60 + startMinutes) - (origHours * 60 + origMinutes);

    return timeline.map(entry => {
      if (typeof entry === 'object') {
        const keysToTry = ['time', 'name', 'description'];
        let shiftedEntry = { ...entry };
        for (const key of keysToTry) {
          if (typeof entry[key] === 'string') {
            shiftedEntry[key] = entry[key].replace(/^(\d{2}):(\d{2})\s*(AM|PM)/i, (full, hh, mm, ap) => {
              let h = parseInt(hh);
              let m = parseInt(mm);
              let a = ap.toUpperCase();
              if (a === 'PM' && h < 12) h += 12;
              if (a === 'AM' && h === 12) h = 0;

              let totalMin = h * 60 + m + diffMinutes;
              totalMin = (totalMin + 1440) % 1440;

              let newH = Math.floor(totalMin / 60);
              let newM = totalMin % 60;
              let newAp = 'AM';
              if (newH >= 12) {
                newAp = 'PM';
                if (newH > 12) newH -= 12;
              }
              if (newH === 0) newH = 12;

              const newHStr = String(newH).padStart(2, '0');
              const newMStr = String(newM).padStart(2, '0');
              return `${newHStr}:${newMStr} ${newAp}`;
            });
          }
        }
        return shiftedEntry;
      }

      if (typeof entry !== 'string') return entry;

      return entry.replace(/^(\d{2}):(\d{2})\s*(AM|PM)/i, (full, hh, mm, ap) => {
        let h = parseInt(hh);
        let m = parseInt(mm);
        let a = ap.toUpperCase();
        if (a === 'PM' && h < 12) h += 12;
        if (a === 'AM' && h === 12) h = 0;

        let totalMin = h * 60 + m + diffMinutes;
        totalMin = (totalMin + 1440) % 1440;

        let newH = Math.floor(totalMin / 60);
        let newM = totalMin % 60;
        let newAp = 'AM';
        if (newH >= 12) {
          newAp = 'PM';
          if (newH > 12) newH -= 12;
        }
        if (newH === 0) newH = 12;

        const newHStr = String(newH).padStart(2, '0');
        const newMStr = String(newM).padStart(2, '0');
        return `${newHStr}:${newMStr} ${newAp}`;
      });
    });
  };

  const getUdaipurVenues = (b, guests) => {
    const defaultUdaipurVenues = [
      { id: 1, name: 'The Leela Palace Udaipur', type: 'Luxury Hotel', location: 'Lake Pichola, Udaipur', minCapacity: 200, maxCapacity: 500, rating: 4.8, image: '/leela_palace.jpg', description: 'A majestic palace hotel located on the banks of Lake Pichola, offering signature luxury services and exquisite dining setups for royal weddings.' },
      { id: 2, name: 'Fateh Garh Resort', type: 'Heritage Resort', location: 'Sajjangarh, Udaipur', minCapacity: 100, maxCapacity: 300, rating: 4.6, image: '/monsoon_palace.jpg', description: 'Perched on a hill offering panoramic views of the Aravalli ranges, Fateh Garh is a heritage resort perfect for authentic cultural themes and grand receptions.' },
      { id: 3, name: 'Radisson Blu Udaipur', type: 'Hotel', location: 'Rani Road, Udaipur', minCapacity: 100, maxCapacity: 600, rating: 4.4, image: '/hero_udaipur_3.jpg', description: 'Overlooking Lake Fateh Sagar, this resort features spacious indoor halls and a grand pool deck suitable for corporate fests and engagement parties.' },
      { id: 4, name: 'Bhanwar Singh Palace Udaipur', type: 'Palace', location: 'Udaipur', minCapacity: 250, maxCapacity: 800, rating: 4.7, image: '/hero_udaipur_1.jpg', description: 'A luxurious palace resort featuring expansive lawns and royal architecture, offering an ideal setting for destination weddings in Udaipur.' },
      { id: 5, name: 'Ramada Resort Udaipur', type: 'Resort', location: 'Rampura, Udaipur', minCapacity: 100, maxCapacity: 300, rating: 4.5, image: '/shiv_niwas.jpg', description: 'Ramada Resort & Spa features stone walls and traditional architecture, offering multi-tiered lawns and modern banquet halls.' },
      { id: 6, name: 'Bijolai Fort Udaipur', type: 'Heritage Venue', location: 'Udaipur', minCapacity: 50, maxCapacity: 200, rating: 4.4, image: '/jag_mandir.jpg', description: 'Constructed in the 19th century beside a lake, this fort features heritage courtyards perfect for close-knit traditional functions in Udaipur.' },
      { id: 7, name: 'Hotel Hilltop Palace', type: 'Hotel', location: 'Ambavgarh, Udaipur', minCapacity: 100, maxCapacity: 400, rating: 4.3, image: '/hero_udaipur_2.jpg', description: 'Located atop the highest point in Udaipur, this hotel offers stunning lake views and classical Rajasthani hospitality packages.' },
      { id: 8, name: 'Aravali Lawn', type: 'Lawn', location: 'Udaipur', minCapacity: 150, maxCapacity: 600, rating: 4.2, image: 'https://images.unsplash.com/photo-1519167758481-83f550bb49b3?auto=format&fit=crop&w=600&q=80', description: 'A spacious lush green open lawn nestled near the foothills, offering an open-air starlight dining experience for massive gatherings.' },
      { id: 9, name: 'The Oberoi Udaivilas', type: 'Luxury Hotel', location: 'Haridasji Ki Magri, Udaipur', minCapacity: 150, maxCapacity: 450, rating: 4.9, image: '/oberoi_udaivilas.jpg', description: 'Sprawling over 50 acres, Oberoi Udaivilas features dome-shaped architectural structures and lake views for high-profile luxury events.' },
      { id: 10, name: 'Taj Lake Palace', type: 'Luxury Palace', location: 'Lake Pichola, Udaipur', minCapacity: 50, maxCapacity: 120, rating: 4.9, image: '/taj_lake_palace.jpg', description: 'A stunning white marble palace situated in the center of Lake Pichola, offering a exclusive luxury retreat for VIP intimate celebrations.' }
    ];

    const localVenuesData = localStorage.getItem('venues_data');
    let sourceVenues = defaultUdaipurVenues;
    if (localVenuesData) {
      try {
        const parsed = JSON.parse(localVenuesData).filter(v => v.status !== 'inactive');
        if (parsed.length > 0) {
          sourceVenues = parsed;
        }
      } catch (e) {
        console.error('Error parsing local venues data:', e);
      }
    }

    const sorted = [...sourceVenues].sort((a, b) => {
      const aCapOk = guests >= (a.minCapacity || 0) && guests <= (a.maxCapacity || 9999);
      const bCapOk = guests >= (b.minCapacity || 0) && guests <= (b.maxCapacity || 9999);
      if (aCapOk && !bCapOk) return -1;
      if (!aCapOk && bCapOk) return 1;
      return (b.rating || 0) - (a.rating || 0);
    });

    return sorted.slice(0, 3).map((v, index) => {
      let costMultiplier = 0.3;
      if (v.priceNum) {
        costMultiplier = v.priceNum * 0.1;
      } else if (v.priceTier) {
        costMultiplier = v.priceTier.length * 0.1;
      }
      costMultiplier = Math.max(0.2, Math.min(0.4, costMultiplier));

      return {
        id: v.id ? v.id.toString() : `venue_${index + 1}`,
        name: v.name,
        rating: `${v.rating || 4.5} ★`,
        img: v.image || '/leela_palace.jpg',
        location: v.location,
        capacity: `${v.minCapacity || Math.round(guests * 0.8)} - ${v.maxCapacity || Math.round(guests * 1.5)} Guests`,
        type: v.type || 'Luxury Venue',
        cost: Math.round(b * costMultiplier),
        availability: 'Available',
        desc: v.description || `A highly recommended venue in Udaipur that perfectly matches your guest count of ${guests} and budget preferences.`
      };
    });
  };

  const handleSaveEvent = async () => {
    setLoading(true);
    try {
      const res = await authFetch('/create-event', {
        method: 'POST',
        body: JSON.stringify({
          title: eventTitle,
          event_type: category,
          date: eventDate,
          time: eventTime,
          location: chosenVenue ? `${chosenVenue.name}, Udaipur` : location,
          budget: budget,
          guest_count: guestCount,
          theme: suggestions && suggestions.themes ? (typeof suggestions.themes[0] === 'object' ? (suggestions.themes[0].name || suggestions.themes[0].description || JSON.stringify(suggestions.themes[0])) : suggestions.themes[0]) : 'Royal / Traditional',
          timeline: suggestions ? (Array.isArray(suggestions.timeline) ? suggestions.timeline.map(item => typeof item === 'object' ? (item.time && item.description ? `${item.time} - ${item.description}` : item.name || item.description || JSON.stringify(item)) : String(item)) : []) : [],
          venue: chosenVenue || null
        })
      });

      if (res.ok) {
        const savedEvent = await res.json();
        const canvas = canvasRef.current;
        if (canvas) {
          try {
            const dataUrl = canvas.toDataURL('image/png');
            localStorage.setItem(`event_cover_${savedEvent.id}`, dataUrl);
          } catch (e) {
            console.error('Failed to save poster to localStorage', e);
          }
        }
        showToast(`Event "${eventTitle}" created and saved successfully!`, 'success');
        router.push('/events');
      } else {
        const data = await res.json();
        throw new Error(data.message || 'Failed to register event in database');
      }
    } catch (err) {
      showToast(err.message, 'error');
    } finally {
      setLoading(false);
    }
  };

  const formatRupee = (value) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      maximumFractionDigits: 0
    }).format(value);
  };

  const renderItemSafely = (item) => {
    if (!item) return '';
    if (typeof item === 'object') {
      if (item.name && (item.description || item.desc)) {
        return (
          <>
            <strong className="text-gray-200">{item.name}:</strong>{' '}
            {item.description || item.desc}
          </>
        );
      }
      return item.description || item.desc || item.name || JSON.stringify(item);
    }
    return item;
  };

  return (
    <div className="max-w-6xl mx-auto flex flex-col gap-6 font-sans">
      
      {/* Page Header */}
      <div className="flex flex-col gap-1.5 items-start">
        <h1 className="text-xl sm:text-2xl font-bold tracking-tight text-white dark:text-white">
          AI Event Planner
        </h1>
        <p className="text-xs text-gray-400 mt-1">
          Configure your details on the left to generate customized planning ideas, catering plans, and budget estimations instantly.
        </p>
      </div>

      {/* Two-Column Grid Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        
        {/* LEFT COLUMN: FORM INPUTS (Col span 5) */}
        <div className="lg:col-span-5">
          <div className="glass-panel p-6 rounded-2xl border border-white/5 flex flex-col gap-4 shadow-lg">
            <h3 className="text-xs font-black uppercase tracking-wider text-white border-b border-white/5 pb-2">
              📋 Plan Parameters
            </h3>

            <form onSubmit={handleGenerate} className="flex flex-col gap-4">
              
              {/* Event Title */}
              <div className="flex flex-col gap-1.5">
                <label className="text-[10px] font-bold text-gray-400 uppercase tracking-wider">Event Title</label>
                <input
                  type="text"
                  value={eventTitle}
                  onChange={(e) => setEventTitle(e.target.value)}
                  placeholder="e.g. Birthday Party, Corporate Meetup"
                  className="w-full bg-white/3 border border-white/5 rounded-xl px-3.5 py-2 text-xs text-white focus:outline-none focus:border-indigo-500/50 transition-all font-medium"
                  required
                />
              </div>

              {/* Category selector */}
              <div className="flex flex-col gap-1.5">
                <label className="text-[10px] font-bold text-gray-400 uppercase tracking-wider">Event Category</label>
                <select
                  value={category}
                  onChange={(e) => {
                    const newCat = e.target.value;
                    setCategory(newCat);
                    const newCatLower = newCat.toLowerCase();
                    if (newCatLower.includes('corporate') || newCatLower.includes('conference') || newCatLower.includes('product') || newCatLower.includes('exhibition')) {
                      setPosterTheme('indigo');
                    } else if (newCatLower.includes('birthday') || newCatLower.includes('shower') || newCatLower.includes('other')) {
                      setPosterTheme('burgundy');
                    } else {
                      setPosterTheme('emerald');
                    }
                  }}
                  className="w-full bg-white/3 border border-white/5 rounded-xl px-3 py-2 text-xs text-gray-200 focus:outline-none focus:border-indigo-500/50 transition-all cursor-pointer font-semibold"
                  required
                >
                  <option value="" disabled className="bg-[#151c2c] text-gray-400">Select Event Category</option>
                  {['Wedding', 'Engagement', 'Birthday Party', 'Anniversary', 'Baby Shower', 'Corporate Meeting', 'Conference', 'Product Launch', 'Cultural Event', 'College Fest', 'Exhibition', 'Other'].map(cat => (
                    <option key={cat} value={cat} className="bg-[#151c2c] text-white">{cat}</option>
                  ))}
                </select>
              </div>

              {/* Date & Start Time Grid */}
              <div className="grid grid-cols-2 gap-3">
                <div className="flex flex-col gap-1.5">
                  <label className="text-[10px] font-bold text-gray-400 uppercase tracking-wider">Date</label>
                  <div className="relative">
                    <Calendar className="absolute left-3 top-2.5 w-3.5 h-3.5 text-gray-500" />
                    <input
                      type="date"
                      value={eventDate}
                      onChange={(e) => setEventDate(e.target.value)}
                      className="w-full bg-white/3 border border-white/5 rounded-xl pl-9 pr-2 py-2 text-xs text-white focus:outline-none focus:border-indigo-500/50 transition-all cursor-pointer font-medium"
                      required
                    />
                  </div>
                </div>

                <div className="flex flex-col gap-1.5">
                  <label className="text-[10px] font-bold text-gray-400 uppercase tracking-wider">Start Time</label>
                  <div className="relative">
                    <Clock className="absolute left-3 top-2.5 w-3.5 h-3.5 text-gray-500" />
                    <input
                      type="time"
                      value={eventTime}
                      onChange={(e) => setEventTime(e.target.value)}
                      className="w-full bg-white/3 border border-white/5 rounded-xl pl-9 pr-2 py-2 text-xs text-white focus:outline-none focus:border-indigo-500/50 transition-all cursor-pointer font-medium"
                      required
                    />
                  </div>
                </div>
              </div>

              {/* Guests & Budget Grid */}
              <div className="grid grid-cols-2 gap-3">
                <div className="flex flex-col gap-1.5">
                  <label className="text-[10px] font-bold text-gray-400 uppercase tracking-wider">Estimated Guests</label>
                  <div className="relative">
                    <Users className="absolute left-3 top-2.5 w-3.5 h-3.5 text-gray-500" />
                    <input
                      type="number"
                      value={guestCount}
                      onChange={(e) => setGuestCount(e.target.value === '' ? '' : Math.max(1, parseInt(e.target.value) || 0))}
                      className="w-full bg-white/3 border border-white/5 rounded-xl pl-9 pr-2 py-2 text-xs text-white focus:outline-none focus:border-indigo-500/50 transition-all font-medium"
                      min="1"
                      placeholder="e.g. 200"
                      required
                    />
                  </div>
                </div>

                <div className="flex flex-col gap-1.5">
                  <label className="text-[10px] font-bold text-gray-400 uppercase tracking-wider">Target Budget (₹)</label>
                  <div className="relative">
                    <span className="absolute left-3 top-2 text-xs font-bold text-gray-500">₹</span>
                    <input
                      type="number"
                      value={budget}
                      onChange={(e) => setBudget(e.target.value === '' ? '' : Math.max(1, parseInt(e.target.value) || 0))}
                      className="w-full bg-white/3 border border-white/5 rounded-xl pl-8 pr-2 py-2 text-xs text-white focus:outline-none focus:border-indigo-500/50 transition-all font-medium"
                      placeholder="e.g. 500000"
                      required
                    />
                  </div>
                </div>
              </div>

              {/* Special Requests */}
              <div className="flex flex-col gap-1.5">
                <label className="text-[10px] font-bold text-gray-400 uppercase tracking-wider">Special Requests / Notes</label>
                <textarea
                  value={specialRequests}
                  onChange={(e) => setSpecialRequests(e.target.value)}
                  placeholder="e.g. Garden layout, traditional welcoming, music requirements..."
                  className="w-full h-24 bg-white/3 border border-white/5 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-indigo-500/50 transition-all resize-none font-medium leading-relaxed"
                />
              </div>

              {/* Generate suggestions CTA */}
              <button
                type="submit"
                disabled={loading}
                className="w-full py-2.5 bg-indigo-600 hover:bg-indigo-500 disabled:bg-indigo-600/50 text-white font-semibold text-xs rounded-xl flex items-center justify-center gap-1.5 shadow-lg shadow-indigo-600/10 cursor-pointer transition-colors"
              >
                {loading ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    Generating Plan suggestions...
                  </>
                ) : (
                  <>
                    <Sparkles className="w-4 h-4" />
                    Generate Plan suggestions
                  </>
                )}
              </button>

            </form>
          </div>
        </div>

        {/* RIGHT COLUMN: AI RECOMMENDATIONS PANEL (Col span 7) */}
        <div className="lg:col-span-7 flex flex-col gap-6">
          
          {loading ? (
            /* Loading Spinner Panel */
            <div className="glass-panel p-12 rounded-2xl border border-white/5 flex flex-col items-center justify-center gap-4 text-center h-full min-h-[350px]">
              <Loader2 className="w-9 h-9 text-indigo-400 animate-spin" />
              <div>
                <h4 className="text-sm font-bold text-white">AI Coordinator is compiling options...</h4>
                <p className="text-xs text-gray-500 mt-1">Generating planning tips, food themes, decoration ideas, and schedules.</p>
              </div>
            </div>
          ) : !suggestions ? (
            /* Empty Placeholder Panel */
            <div className="glass-panel p-12 rounded-2xl border border-white/5 flex flex-col items-center justify-center gap-4 text-center h-full min-h-[350px]">
              <div className="w-12 h-12 rounded-2xl bg-indigo-500/10 border border-indigo-500/20 text-indigo-400 flex items-center justify-center mb-1">
                <Compass className="w-6 h-6 animate-pulse" />
              </div>
              <div>
                <h4 className="text-sm font-bold text-white">AI Planning Suggestions Panel</h4>
                <p className="text-xs text-gray-500 mt-1 max-w-sm mx-auto leading-relaxed">
                  Fill in the event parameters on the left and trigger recommendations to see suggested themes, foods, budgets, and checklists.
                </p>
              </div>
            </div>
          ) : (
            /* Recommendations dashboard output */
            <div className="flex flex-col gap-5 animate-fade-in">
              
              {/* Card 0: AI Invitation Poster Generator */}
              <div className="glass-panel p-5 rounded-2xl border border-white/5 flex flex-col gap-4">
                <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2 pb-2 border-b border-white/5">
                  <h3 className="text-xs font-black uppercase tracking-wider text-indigo-400 flex items-center gap-1.5">
                    <Sparkles className="w-4 h-4 text-indigo-400" />
                    AI Event Poster Generator
                  </h3>
                  <div className="flex items-center gap-1.5">
                    <span className="text-[10px] text-gray-400 font-bold uppercase mr-1">Theme:</span>
                    <button
                      type="button"
                      onClick={() => setPosterTheme('emerald')}
                      className={`px-2 py-0.5 text-[9px] rounded font-bold transition-all cursor-pointer border ${
                        posterTheme === 'emerald'
                          ? 'bg-emerald-600 text-white border-emerald-500'
                          : 'bg-white/3 text-gray-400 border-white/5 hover:bg-white/5'
                      }`}
                    >
                      Emerald
                    </button>
                    <button
                      type="button"
                      onClick={() => setPosterTheme('indigo')}
                      className={`px-2 py-0.5 text-[9px] rounded font-bold transition-all cursor-pointer border ${
                        posterTheme === 'indigo'
                          ? 'bg-indigo-600 text-white border-indigo-500'
                          : 'bg-white/3 text-gray-400 border-white/5 hover:bg-white/5'
                      }`}
                    >
                      Indigo
                    </button>
                    <button
                      type="button"
                      onClick={() => setPosterTheme('burgundy')}
                      className={`px-2 py-0.5 text-[9px] rounded font-bold transition-all cursor-pointer border ${
                        posterTheme === 'burgundy'
                          ? 'bg-purple-900 text-white border-purple-800'
                          : 'bg-white/3 text-gray-400 border-white/5 hover:bg-white/5'
                      }`}
                    >
                      Burgundy
                    </button>
                  </div>
                </div>

                <div className="flex flex-col md:flex-row gap-5 items-center justify-center">
                  {/* Canvas Container */}
                  <div className="relative border border-white/10 rounded-xl overflow-hidden shadow-2xl w-full max-w-[240px] shrink-0 bg-black/40">
                    <canvas
                      ref={canvasRef}
                      width={800}
                      height={1000}
                      className="w-full h-auto block"
                    />
                  </div>

                  <div className="flex flex-col gap-3 flex-1 text-left">
                    <h4 className="text-xs font-bold text-white uppercase tracking-wider">
                      {isCorporate ? 'Udaipur Corporate Invitation Card' :
                       isFestive ? 'Udaipur Celebration Invitation Card' :
                       isAcademic ? 'Udaipur Academic Invitation Card' :
                       'Udaipur Royal Invitation Card'}
                    </h4>
                    <p className="text-[10px] text-gray-400 leading-relaxed">
                      {isCorporate
                        ? "Customize your corporate invite theme above. This card is dynamically compiled with sleek professional typography."
                        : isFestive
                        ? "Customize your celebration invite theme above. This card features playful accents and sparkles."
                        : isAcademic
                        ? "Customize your campus invite theme above. This card is styled with geometric cultural borders."
                        : "Customize your royal invite theme above. This card is styled with traditional gold borders and mandala emblem."}
                    </p>
                    <div className="flex flex-col gap-2 w-full mt-2">
                      <button
                        type="button"
                        onClick={handleDownloadPoster}
                        className="w-full py-2 bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-bold rounded-lg shadow-lg flex items-center justify-center gap-1.5 cursor-pointer transition-colors"
                      >
                        Download Invitation Poster (PNG)
                      </button>
                      <p className="text-[9px] text-gray-500 italic text-center">
                        * Note: This poster will automatically save as your Event Cover Image when you click "Create Event & Save Suggestions".
                      </p>
                    </div>
                  </div>
                </div>
              </div>
              
              {/* Card 1: Overview Summary */}
              <div className="glass-panel p-5 rounded-2xl border border-white/5 flex flex-col gap-2.5">
                <h3 className="text-xs font-black uppercase tracking-wider text-indigo-400 flex items-center gap-1.5">
                  <FileText className="w-4 h-4 text-indigo-400" />
                  AI Suggested Overview
                </h3>
                <p className="text-xs text-gray-300 leading-relaxed bg-white/2 p-3 rounded-xl border border-white/5 italic">
                  "{renderItemSafely(suggestions.description)}"
                </p>
              </div>

              {/* Card 2: Suggested Udaipur Venues (NEW) */}
              <div className="glass-panel p-5 rounded-2xl border border-white/5 flex flex-col gap-3">
                <h3 className="text-xs font-black uppercase tracking-wider text-indigo-400 flex items-center gap-1.5">
                  <Building className="w-4 h-4 text-indigo-400" />
                  Suggested Udaipur Venues
                </h3>
                
                <div className="grid grid-cols-1 md:grid-cols-3 gap-3 mt-1">
                  {suggestions.venues && suggestions.venues.map((venue) => (
                    <div
                      key={venue.id}
                      className={`bg-white/2 border rounded-xl overflow-hidden flex flex-col justify-between hover:border-indigo-500/25 transition-all duration-300 shadow-sm ${
                        chosenVenue?.id === venue.id
                          ? 'border-indigo-500 ring-2 ring-indigo-500/50'
                          : 'border-white/5'
                      }`}
                    >
                      <div className="h-20 bg-[#151c2c] relative">
                        <img src={resolveImage(venue.img, 'venue', venue.name)} alt={venue.name} className="w-full h-full object-cover" />
                        {chosenVenue?.id === venue.id && (
                          <div className="absolute top-2 right-2 bg-emerald-600 text-white rounded-full px-1.5 py-0.5 text-[8px] font-bold shadow-md">
                            Selected
                          </div>
                        )}
                      </div>
                      <div className="p-2 flex flex-col gap-1">
                        <div className="flex justify-between items-center text-[8px] bg-emerald-500/10 text-emerald-400 px-1 py-0.5 rounded w-fit font-bold">
                          {venue.rating}
                        </div>
                        <h4 className="text-[10px] font-black text-white leading-tight truncate">{venue.name}</h4>
                        <span className="text-[8px] text-gray-500 truncate">{venue.location}</span>
                        <div className="text-[9px] text-amber-400 font-bold mt-1">
                          {formatRupee(venue.cost)}
                        </div>
                      </div>
                      <div className="p-2 pt-0 border-t border-white/5 flex gap-1.5">
                        <button
                          type="button"
                          onClick={() => setSelectedVenue(venue)}
                          className="flex-1 py-1 text-[8px] bg-white/5 hover:bg-white/10 text-gray-300 font-bold border border-white/10 rounded-md cursor-pointer transition-colors"
                        >
                          Details
                        </button>
                        <button
                          type="button"
                          onClick={() => {
                            if (chosenVenue?.id === venue.id) {
                              setChosenVenue(null);
                              showToast(`Unselected "${venue.name}"!`, 'info');
                            } else {
                              setChosenVenue(venue);
                              showToast(`Selected "${venue.name}" as event venue!`, 'success');
                            }
                          }}
                          className={`flex-1 py-1 text-[8px] font-bold rounded-md cursor-pointer transition-colors ${
                            chosenVenue?.id === venue.id
                              ? 'bg-emerald-600 hover:bg-red-600 text-white'
                              : 'bg-indigo-600/10 hover:bg-indigo-600/20 text-indigo-300 border border-indigo-500/20'
                          }`}
                        >
                          {chosenVenue?.id === venue.id ? 'Unselect' : 'Select'}
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Card 3: Design Styles & Catering Options */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                
                {/* Themes & Decor */}
                <div className="glass-panel p-5 rounded-2xl border border-white/5 flex flex-col gap-3">
                  <h4 className="text-xs font-black uppercase tracking-wider text-purple-400 flex items-center gap-1.5">
                    <Palette className="w-4 h-4 text-purple-400" />
                    Themes & Setup
                  </h4>
                  
                  {/* Theme badges */}
                  <div className="flex flex-wrap gap-1.5 mb-1">
                    {suggestions.themes && suggestions.themes.map((t, idx) => (
                      <span key={idx} className="bg-purple-500/5 border border-purple-500/10 text-purple-300 font-bold px-2 py-0.5 rounded-lg text-[9px] uppercase tracking-wide">
                        {renderItemSafely(t)}
                      </span>
                    ))}
                  </div>

                  <ul className="flex flex-col gap-2 border-t border-white/5 pt-2">
                    {suggestions.decorations && suggestions.decorations.map((decor, idx) => (
                      <li key={idx} className="text-[10px] text-gray-400 flex items-start gap-2 leading-relaxed">
                        <span className="text-purple-400 font-extrabold shrink-0">•</span>
                        {renderItemSafely(decor)}
                      </li>
                    ))}
                  </ul>
                </div>

                {/* Catering Feasts */}
                <div className="glass-panel p-5 rounded-2xl border border-white/5 flex flex-col gap-3">
                  <h4 className="text-xs font-black uppercase tracking-wider text-emerald-400 flex items-center gap-1.5">
                    <Utensils className="w-4 h-4 text-emerald-400" />
                    Dining & Food Plan
                  </h4>
                  <ul className="flex flex-col gap-2">
                    {suggestions.foods && suggestions.foods.map((food, idx) => (
                      <li key={idx} className="text-[10px] text-gray-400 flex items-start gap-2 leading-relaxed">
                        <span className="text-emerald-400 font-extrabold shrink-0">•</span>
                        {renderItemSafely(food)}
                      </li>
                    ))}
                  </ul>
                </div>

              </div>

              {/* Card 4: Estimated Budget Breakdown */}
              <div className="glass-panel p-5 rounded-2xl border border-white/5 flex flex-col gap-3.5">
                <h3 className="text-xs font-black uppercase tracking-wider text-amber-400 flex items-center gap-1.5">
                  <DollarSign className="w-4 h-4 text-amber-400" />
                  Suggested Budget Allocation
                </h3>

                <div className="flex flex-col gap-3">
                  {suggestions.budgetAllocation.map((item, idx) => {
                    const percentage = Math.round((item.amount / budget) * 100);
                    return (
                      <div key={idx} className="flex flex-col gap-1">
                        <div className="flex justify-between items-center text-[10px]">
                          <span className="font-semibold text-gray-300">{item.category} ({percentage}%)</span>
                          <span className="font-bold text-white">{formatRupee(item.amount)}</span>
                        </div>
                        <div className="w-full bg-white/5 border border-white/5 rounded-full h-1.5 overflow-hidden">
                          <div
                            className={`h-full rounded-full ${
                              idx === 0 ? 'bg-indigo-500' :
                              idx === 1 ? 'bg-purple-500' :
                              idx === 2 ? 'bg-pink-500' :
                              idx === 3 ? 'bg-amber-500' :
                              'bg-emerald-500'
                            }`}
                            style={{ width: `${percentage}%` }}
                          ></div>
                        </div>
                        <span className="text-[8px] text-gray-500">{item.description}</span>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Card 5: Proposed Timeline Plan */}
              <div className="glass-panel p-5 rounded-2xl border border-white/5 flex flex-col gap-3">
                <h3 className="text-xs font-black uppercase tracking-wider text-indigo-400 flex items-center gap-1.5">
                  <Clock className="w-4 h-4 text-indigo-400" />
                  Proposed Event Schedule Timeline
                </h3>
                
                <div className="flex flex-col gap-3 mt-1.5 pl-3.5 border-l border-indigo-500/20">
                  {suggestions.timeline && suggestions.timeline.map((timeRow, idx) => (
                    <div key={idx} className="relative flex items-center gap-3">
                      <span className="absolute left-[-20px] w-2 h-2 rounded-full bg-indigo-500 border border-[#0d0f14]"></span>
                      <p className="text-[10px] text-gray-300 font-medium">{renderItemSafely(timeRow)}</p>
                    </div>
                  ))}
                </div>
              </div>

              {/* Card 6: AI Coordinator Checklist & Planning Tips */}
              <div className="glass-panel p-5 rounded-2xl border border-white/5 flex flex-col gap-3">
                <h3 className="text-xs font-black uppercase tracking-wider text-amber-400 flex items-center gap-1.5">
                  <ListTodo className="w-4 h-4 text-amber-400" />
                  AI Coordinator Planning Tips
                </h3>
                <ul className="flex flex-col gap-2.5">
                  {suggestions.tips && suggestions.tips.map((tip, idx) => (
                    <li key={idx} className="text-[10px] text-gray-400 flex items-start gap-2 leading-relaxed">
                      <span className="text-emerald-400 font-extrabold shrink-0 mt-0.5">✓</span>
                      {renderItemSafely(tip)}
                    </li>
                  ))}
                </ul>
              </div>

              {/* CREATE EVENT AND SAVE BUTTON */}
              <div className="flex justify-end pt-2">
                <button
                  type="button"
                  onClick={handleSaveEvent}
                  disabled={loading}
                  className="px-6 py-3 bg-indigo-600 hover:bg-indigo-700 disabled:bg-indigo-600/50 text-white font-bold text-xs rounded-xl flex items-center gap-2 shadow-lg shadow-indigo-600/20 cursor-pointer transition-colors"
                >
                  <Plus className="w-4 h-4" />
                  Create Event & Save Suggestions
                </button>
              </div>

            </div>
          )}

        </div>

      </div>

      {/* ================= INTERACTIVE DETAIL MODAL POPUP ================= */}
      {selectedVenue && (
        <div className="fixed inset-0 bg-black/70 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="glass-panel w-full max-w-lg rounded-2xl border border-white/10 overflow-hidden shadow-2xl flex flex-col animate-scale-in max-h-[90vh]">
            
            {/* Modal Image Banner */}
            <div className="relative h-44 bg-[#151c2c]">
              <img
                src={resolveImage(selectedVenue.img, 'venue', selectedVenue.name)}
                alt={selectedVenue.name}
                className="w-full h-full object-cover"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/85 via-black/30 to-transparent"></div>
              
              {/* Close Button */}
              <button
                onClick={() => setSelectedVenue(null)}
                className="absolute top-4 right-4 w-7 h-7 rounded-full bg-black/50 hover:bg-black/80 text-white flex items-center justify-center cursor-pointer transition-colors border border-white/10"
              >
                <X className="w-4 h-4" />
              </button>

              <div className="absolute bottom-4 left-4 right-4 flex flex-col gap-0.5">
                <span className="bg-emerald-500 text-white font-extrabold text-[9px] px-2 py-0.5 rounded w-fit mb-1 border border-emerald-400/20">
                  {selectedVenue.rating} Rating
                </span>
                <h3 className="text-base font-extrabold text-white leading-tight">{selectedVenue.name}</h3>
                <span className="text-xs text-gray-300 flex items-center gap-1 font-semibold mt-0.5">
                  <MapPin className="w-3.5 h-3.5 text-gray-400" />
                  {selectedVenue.location}
                </span>
              </div>
            </div>

            {/* Modal Body Contents */}
            <div className="p-5 flex flex-col gap-4 overflow-y-auto">
              
              <div className="flex flex-col gap-1.5">
                <span className="text-[10px] font-black uppercase tracking-wider text-gray-500">Property Description</span>
                <p className="text-xs text-gray-300 leading-relaxed font-medium">
                  {selectedVenue.desc}
                </p>
              </div>

              {/* Specs Grid */}
              <div className="grid grid-cols-2 gap-3.5 bg-white/2 border border-white/5 rounded-xl p-3 text-xs">
                <div className="flex flex-col gap-0.5">
                  <span className="text-gray-500 text-[9px] font-black uppercase tracking-wider">Capacity Limits</span>
                  <span className="text-white font-bold">{selectedVenue.capacity}</span>
                </div>
                <div className="flex flex-col gap-0.5">
                  <span className="text-gray-500 text-[9px] font-black uppercase tracking-wider">Classification</span>
                  <span className="text-white font-bold">{selectedVenue.type}</span>
                </div>
                <div className="flex flex-col gap-0.5">
                  <span className="text-gray-500 text-[9px] font-black uppercase tracking-wider">Estimated Cost Share</span>
                  <span className="text-amber-400 font-extrabold">{formatRupee(selectedVenue.cost)}</span>
                </div>
                <div className="flex flex-col gap-0.5">
                  <span className="text-gray-500 text-[9px] font-black uppercase tracking-wider">Availability Status</span>
                  <span className="text-emerald-400 font-bold flex items-center gap-1">
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 inline-block animate-pulse"></span>
                    {selectedVenue.availability}
                  </span>
                </div>
              </div>
            </div>

            {/* Modal Footer Controls */}
            <div className="p-4 border-t border-white/5 bg-white/1 flex gap-3 justify-end">
              <button
                onClick={() => setSelectedVenue(null)}
                className="px-4 py-2 border border-white/5 hover:border-white/10 bg-white/3 hover:bg-white/5 text-gray-300 font-bold text-[10px] rounded-xl cursor-pointer transition-colors"
              >
                Close Details
              </button>
              
              <button
                onClick={() => {
                  setSelectedVenue(null);
                  showToast('Inquiry request successfully sent!', 'success');
                }}
                className="px-5 py-2 bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-[10px] rounded-xl shadow-lg cursor-pointer transition-colors"
              >
                Book Suggested Venue
              </button>
            </div>

          </div>
        </div>
      )}

    </div>
  );
}
