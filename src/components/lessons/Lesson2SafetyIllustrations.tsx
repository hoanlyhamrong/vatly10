import React from 'react';

export const LabEquipmentSymbolsIllustration: React.FC = () => (
  <svg
    className="w-full h-full min-h-[220px]"
    viewBox="0 0 960 540"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
  >
    {/* Background Grid */}
    <rect width="960" height="540" fill="#070E1C" />
    <path
      d="M0 60H960 M0 120H960 M0 180H960 M0 240H960 M0 300H960 M0 360H960 M0 420H960 M0 480H960"
      stroke="#14213d"
      strokeWidth="1"
    />
    <path
      d="M120 0V540 M240 0V540 M360 0V540 M480 0V540 M600 0V540 M720 0V540 M840 0V540"
      stroke="#14213d"
      strokeWidth="1"
    />

    {/* Section Title Banner */}
    <rect x="40" y="30" width="880" height="50" rx="12" fill="#0F172A" stroke="#00D4FF" strokeWidth="1.5" />
    <text x="480" y="62" fill="#00D4FF" fontSize="18" fontWeight="bold" textAnchor="middle" letterSpacing="1">
      MỘT SỐ KÝ HIỆU TRÊN CÁC THIẾT BỊ THÍ NGHIỆM VẬT LÍ
    </text>

    {/* Grid of 6 Symbol Cards */}
    {/* Card 1: DC (Dòng điện một chiều) */}
    <g transform="translate(60, 105)">
      <rect width="260" height="185" rx="14" fill="#0F1F38" stroke="#38BDF8" strokeWidth="1.5" />
      <rect x="20" y="20" width="220" height="85" rx="10" fill="#071224" stroke="#1E293B" />
      {/* DC Symbol */}
      <line x1="60" y1="52" x2="200" y2="52" stroke="#EF4444" strokeWidth="6" strokeLinecap="round" />
      <line x1="60" y1="72" x2="85" y2="72" stroke="#94A3B8" strokeWidth="5" strokeLinecap="round" />
      <line x1="98" y1="72" x2="123" y2="72" stroke="#94A3B8" strokeWidth="5" strokeLinecap="round" />
      <line x1="137" y1="72" x2="162" y2="72" stroke="#94A3B8" strokeWidth="5" strokeLinecap="round" />
      <line x1="175" y1="72" x2="200" y2="72" stroke="#94A3B8" strokeWidth="5" strokeLinecap="round" />
      
      <text x="130" y="132" fill="#38BDF8" fontSize="15" fontWeight="bold" textAnchor="middle">
        Ký hiệu DC / ( — )
      </text>
      <text x="130" y="153" fill="#E2E8F0" fontSize="12" textAnchor="middle">
        Dòng điện một chiều
      </text>
      <text x="130" y="172" fill="#F87171" fontSize="11" fontWeight="bold" textAnchor="middle">
        (+) Cực đỏ &bull; (-) Cực đen
      </text>
    </g>

    {/* Card 2: AC (Dòng điện xoay chiều) */}
    <g transform="translate(350, 105)">
      <rect width="260" height="185" rx="14" fill="#0F1F38" stroke="#F59E0B" strokeWidth="1.5" />
      <rect x="20" y="20" width="220" height="85" rx="10" fill="#071224" stroke="#1E293B" />
      {/* AC Symbol (Sine wave) */}
      <path
        d="M 60 62 Q 95 20 130 62 T 200 62"
        stroke="#F59E0B"
        strokeWidth="6"
        fill="none"
        strokeLinecap="round"
      />
      <text x="130" y="132" fill="#F59E0B" fontSize="15" fontWeight="bold" textAnchor="middle">
        Ký hiệu AC / ( ~ )
      </text>
      <text x="130" y="153" fill="#E2E8F0" fontSize="12" textAnchor="middle">
        Dòng điện xoay chiều
      </text>
      <text x="130" y="172" fill="#FDE047" fontSize="11" fontWeight="bold" textAnchor="middle">
        220V Lưới điện nguy hiểm
      </text>
    </g>

    {/* Card 3: Ground / Nối đất */}
    <g transform="translate(640, 105)">
      <rect width="260" height="185" rx="14" fill="#0F1F38" stroke="#10B981" strokeWidth="1.5" />
      <rect x="20" y="20" width="220" height="85" rx="10" fill="#071224" stroke="#1E293B" />
      {/* Ground Symbol */}
      <line x1="130" y1="35" x2="130" y2="60" stroke="#10B981" strokeWidth="5" strokeLinecap="round" />
      <line x1="85" y1="60" x2="175" y2="60" stroke="#10B981" strokeWidth="5" strokeLinecap="round" />
      <line x1="100" y1="72" x2="160" y2="72" stroke="#10B981" strokeWidth="4.5" strokeLinecap="round" />
      <line x1="115" y1="84" x2="145" y2="84" stroke="#10B981" strokeWidth="4" strokeLinecap="round" />

      <text x="130" y="132" fill="#10B981" fontSize="15" fontWeight="bold" textAnchor="middle">
        Ký hiệu Tiếp đất ( ⏚ )
      </text>
      <text x="130" y="153" fill="#E2E8F0" fontSize="12" textAnchor="middle">
        Cực nối đất an toàn (EARTH)
      </text>
      <text x="130" y="172" fill="#86EFAC" fontSize="11" fontWeight="bold" textAnchor="middle">
        Triệt tiêu rò rỉ điện vỏ máy
      </text>
    </g>

    {/* Bottom Row */}
    {/* Card 4: Dụng cụ đo Ampe kế & Vôn kế */}
    <g transform="translate(60, 310)">
      <rect width="260" height="195" rx="14" fill="#0F1F38" stroke="#818CF8" strokeWidth="1.5" />
      <circle cx="90" cy="65" r="32" fill="#1E1B4B" stroke="#818CF8" strokeWidth="2.5" />
      <text x="90" y="73" fill="#A5B4FC" fontSize="22" fontWeight="bold" textAnchor="middle">A</text>

      <circle cx="170" cy="65" r="32" fill="#1E1B4B" stroke="#00D4FF" strokeWidth="2.5" />
      <text x="170" y="73" fill="#00D4FF" fontSize="22" fontWeight="bold" textAnchor="middle">V</text>

      <text x="130" y="135" fill="#A5B4FC" fontSize="14" fontWeight="bold" textAnchor="middle">
        Ampe kế (A) &amp; Vôn kế (V)
      </text>
      <text x="130" y="156" fill="#E2E8F0" fontSize="11.5" textAnchor="middle">
        A mắc nối tiếp &bull; V mắc song song
      </text>
      <text x="130" y="176" fill="#FCA5A5" fontSize="11" fontWeight="bold" textAnchor="middle">
        KHÔNG đo vượt quá giới hạn đo
      </text>
    </g>

    {/* Card 5: Cầu chì (Fuse) & Công tắc */}
    <g transform="translate(350, 310)">
      <rect width="260" height="195" rx="14" fill="#0F1F38" stroke="#EC4899" strokeWidth="1.5" />
      <rect x="40" y="45" width="85" height="35" rx="5" fill="#1E293B" stroke="#F472B6" strokeWidth="2" />
      <line x1="25" y1="62" x2="140" y2="62" stroke="#F472B6" strokeWidth="2.5" />

      {/* Switch open */}
      <circle cx="170" cy="62" r="5" fill="#F472B6" />
      <circle cx="215" cy="62" r="5" fill="#F472B6" />
      <line x1="170" y1="62" x2="205" y2="40" stroke="#F472B6" strokeWidth="3" strokeLinecap="round" />

      <text x="130" y="135" fill="#F472B6" fontSize="14" fontWeight="bold" textAnchor="middle">
        Cầu chì &amp; Khóa K (Công tắc)
      </text>
      <text x="130" y="156" fill="#E2E8F0" fontSize="11.5" textAnchor="middle">
        Tự ngắt khi quá tải dòng điện
      </text>
      <text x="130" y="176" fill="#F9A8D4" fontSize="11" fontWeight="bold" textAnchor="middle">
        Luôn ngắt K trước khi mắc mạch
      </text>
    </g>

    {/* Card 6: Điện trở & Biến trở */}
    <g transform="translate(640, 310)">
      <rect width="260" height="195" rx="14" fill="#0F1F38" stroke="#00FFCC" strokeWidth="1.5" />
      {/* Resistor zig-zag */}
      <path
        d="M 45 60 L 65 60 L 75 45 L 90 75 L 105 45 L 120 75 L 130 60 L 150 60"
        stroke="#00FFCC"
        strokeWidth="3"
        fill="none"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      {/* Variable arrow */}
      <line x1="80" y1="80" x2="135" y2="40" stroke="#FDE047" strokeWidth="2.5" markerEnd="url(#arrow)" />

      <text x="130" y="135" fill="#00FFCC" fontSize="14" fontWeight="bold" textAnchor="middle">
        Điện trở (R) &amp; Biến trở (Rx)
      </text>
      <text x="130" y="156" fill="#E2E8F0" fontSize="11.5" textAnchor="middle">
        Điều chỉnh cường độ dòng điện
      </text>
      <text x="130" y="176" fill="#86EFAC" fontSize="11" fontWeight="bold" textAnchor="middle">
        Đơn vị: Ohm (&Omega;), k&Omega;, M&Omega;
      </text>
    </g>
  </svg>
);

export const IndustrialWarningsIllustration: React.FC = () => (
  <svg
    className="w-full h-full min-h-[220px]"
    viewBox="0 0 960 540"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
  >
    {/* Background Grid */}
    <rect width="960" height="540" fill="#070E1C" />
    <path
      d="M0 60H960 M0 120H960 M0 180H960 M0 240H960 M0 300H960 M0 360H960 M0 420H960 M0 480H960"
      stroke="#14213d"
      strokeWidth="1"
    />
    <path
      d="M120 0V540 M240 0V540 M360 0V540 M480 0V540 M600 0V540 M720 0V540 M840 0V540"
      stroke="#14213d"
      strokeWidth="1"
    />

    {/* Title Banner */}
    <rect x="40" y="30" width="880" height="50" rx="12" fill="#1E1B4B" stroke="#F59E0B" strokeWidth="1.5" />
    <text x="480" y="62" fill="#F59E0B" fontSize="18" fontWeight="bold" textAnchor="middle" letterSpacing="1">
      CÁC BIỂN CẢNH BÁO NGUY HIỂM CÔNG NGHIỆP &amp; PHÒNG THỰC HÀNH
    </text>

    {/* Sign 1: High Voltage */}
    <g transform="translate(60, 105)">
      <rect width="260" height="190" rx="14" fill="#0F172A" stroke="#EAB308" strokeWidth="2" />
      {/* Yellow Triangle */}
      <polygon points="130,22 210,120 50,120" fill="#FEF08A" stroke="#CA8A04" strokeWidth="2" />
      {/* Lightning bolt */}
      <path d="M130,42 L112,80 L132,80 L120,112 L150,72 L132,72 Z" fill="#000" />
      <text x="130" y="148" fill="#FEF08A" fontSize="14" fontWeight="bold" textAnchor="middle">
        ĐIỆN ÁP CAO THẾ
      </text>
      <text x="130" y="170" fill="#E2E8F0" fontSize="11" textAnchor="middle">
        Nguy hiểm tử vong do điện giật
      </text>
    </g>

    {/* Sign 2: Flammable */}
    <g transform="translate(350, 105)">
      <rect width="260" height="190" rx="14" fill="#0F172A" stroke="#EF4444" strokeWidth="2" />
      {/* Red Diamond / Triangle */}
      <polygon points="130,22 210,120 50,120" fill="#FEE2E2" stroke="#DC2626" strokeWidth="2" />
      {/* Flame */}
      <path
        d="M 130 45 C 115 65 125 90 130 110 C 135 90 145 65 130 45 Z"
        fill="#DC2626"
      />
      <path
        d="M 120 70 C 110 85 118 102 125 110 C 118 95 115 80 120 70 Z"
        fill="#EA580C"
      />
      <text x="130" y="148" fill="#FCA5A5" fontSize="14" fontWeight="bold" textAnchor="middle">
        CHẤT DỄ CHÁY NỔ
      </text>
      <text x="130" y="170" fill="#E2E8F0" fontSize="11" textAnchor="middle">
        Tránh xa nguồn nhiệt &amp; ngọn lửa
      </text>
    </g>

    {/* Sign 3: Toxic Hazard */}
    <g transform="translate(640, 105)">
      <rect width="260" height="190" rx="14" fill="#0F172A" stroke="#F97316" strokeWidth="2" />
      <polygon points="130,22 210,120 50,120" fill="#FFEDD5" stroke="#EA580C" strokeWidth="2" />
      {/* Skull */}
      <circle cx="130" cy="65" r="18" fill="#000" />
      <rect x="123" y="78" width="14" height="10" fill="#000" />
      <circle cx="123" cy="65" r="4" fill="#FFF" />
      <circle cx="137" cy="65" r="4" fill="#FFF" />
      <line x1="95" y1="100" x2="165" y2="100" stroke="#000" strokeWidth="4" />
      <line x1="105" y1="85" x2="155" y2="115" stroke="#000" strokeWidth="3" />
      <line x1="105" y1="115" x2="155" y2="85" stroke="#000" strokeWidth="3" />

      <text x="130" y="148" fill="#FED7AA" fontSize="14" fontWeight="bold" textAnchor="middle">
        CHẤT ĐỘC NGUY HẠI
      </text>
      <text x="130" y="170" fill="#E2E8F0" fontSize="11" textAnchor="middle">
        Tuyệt đối không hít hoặc nếm
      </text>
    </g>

    {/* Sign 4: Laser Radiation */}
    <g transform="translate(60, 315)">
      <rect width="260" height="190" rx="14" fill="#0F172A" stroke="#38BDF8" strokeWidth="2" />
      <polygon points="130,22 210,120 50,120" fill="#FEF08A" stroke="#CA8A04" strokeWidth="2" />
      {/* Laser sun symbol */}
      <circle cx="130" cy="72" r="10" fill="#000" />
      <line x1="130" y1="48" x2="130" y2="96" stroke="#000" strokeWidth="3" />
      <line x1="106" y1="72" x2="154" y2="72" stroke="#000" strokeWidth="3" />
      <line x1="113" y1="55" x2="147" y2="89" stroke="#000" strokeWidth="2.5" />
      <line x1="113" y1="89" x2="147" y2="55" stroke="#000" strokeWidth="2.5" />
      <line x1="145" y1="72" x2="185" y2="72" stroke="#DC2626" strokeWidth="3.5" />

      <text x="130" y="148" fill="#7DD3FC" fontSize="14" fontWeight="bold" textAnchor="middle">
        BỨC XẠ TIA LASER
      </text>
      <text x="130" y="170" fill="#E2E8F0" fontSize="11" textAnchor="middle">
        Không nhìn thẳng vào chùm tia
      </text>
    </g>

    {/* Sign 5: Corrosive Acid */}
    <g transform="translate(350, 315)">
      <rect width="260" height="190" rx="14" fill="#0F172A" stroke="#A855F7" strokeWidth="2" />
      <polygon points="130,22 210,120 50,120" fill="#F3E8FF" stroke="#9333EA" strokeWidth="2" />
      {/* Test tubes dripping */}
      <rect x="95" y="48" width="12" height="32" rx="4" transform="rotate(-30 95 48)" fill="#000" />
      <rect x="155" y="42" width="12" height="32" rx="4" transform="rotate(30 155 42)" fill="#000" />
      <circle cx="118" cy="85" r="3" fill="#DC2626" />
      <circle cx="142" cy="85" r="3" fill="#DC2626" />
      {/* Hand being burned */}
      <rect x="110" y="95" width="40" height="12" rx="4" fill="#000" />

      <text x="130" y="148" fill="#D8B4FE" fontSize="14" fontWeight="bold" textAnchor="middle">
        HÓA CHẤT ĂN MÒN
      </text>
      <text x="130" y="170" fill="#E2E8F0" fontSize="11" textAnchor="middle">
        Gây bỏng sâu da &amp; hỏng mắt
      </text>
    </g>

    {/* Sign 6: Biohazard / Radioactivity */}
    <g transform="translate(640, 315)">
      <rect width="260" height="190" rx="14" fill="#0F172A" stroke="#EC4899" strokeWidth="2" />
      <polygon points="130,22 210,120 50,120" fill="#FEF08A" stroke="#CA8A04" strokeWidth="2" />
      {/* Radioactive Trefoil */}
      <circle cx="130" cy="75" r="7" fill="#000" />
      <path d="M 130 75 L 115 45 A 25 25 0 0 1 145 45 Z" fill="#000" />
      <path d="M 130 75 L 155 85 A 25 25 0 0 1 140 105 Z" fill="#000" />
      <path d="M 130 75 L 105 85 A 25 25 0 0 0 120 105 Z" fill="#000" />

      <text x="130" y="148" fill="#F472B6" fontSize="14" fontWeight="bold" textAnchor="middle">
        NGUỒN PHÓNG XẠ
      </text>
      <text x="130" y="170" fill="#E2E8F0" fontSize="11" textAnchor="middle">
        Khu vực phát tán ion hóa nguy hiểm
      </text>
    </g>
  </svg>
);

export const TrafficSignsIllustration: React.FC = () => (
  <svg
    className="w-full h-full min-h-[220px]"
    viewBox="0 0 960 540"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
  >
    {/* Background Grid */}
    <rect width="960" height="540" fill="#070E1C" />
    <path
      d="M0 60H960 M0 120H960 M0 180H960 M0 240H960 M0 300H960 M0 360H960 M0 420H960 M0 480H960"
      stroke="#14213d"
      strokeWidth="1"
    />
    <path
      d="M120 0V540 M240 0V540 M360 0V540 M480 0V540 M600 0V540 M720 0V540 M840 0V540"
      stroke="#14213d"
      strokeWidth="1"
    />

    {/* Title Banner */}
    <rect x="40" y="30" width="880" height="50" rx="12" fill="#1C1917" stroke="#DC2626" strokeWidth="1.5" />
    <text x="480" y="62" fill="#FCA5A5" fontSize="18" fontWeight="bold" textAnchor="middle" letterSpacing="1">
      CÁC BIỂN BÁO CẢNH BÁO NGUY HIỂM GIAO THÔNG ĐƯỜNG BỘ
    </text>

    {/* Traffic Sign 1: Chỗ ngoặt nguy hiểm (W.201a) */}
    <g transform="translate(60, 105)">
      <rect width="260" height="190" rx="14" fill="#0C1424" stroke="#DC2626" strokeWidth="1.5" />
      {/* Standard Road Traffic Warning Triangle */}
      <polygon points="130,20 215,122 45,122" fill="#FDE047" stroke="#DC2626" strokeWidth="6" strokeLinejoin="round" />
      {/* Left sharp turn arrow */}
      <path
        d="M 145 105 V 75 L 115 55"
        stroke="#000"
        strokeWidth="6"
        fill="none"
        strokeLinecap="round"
      />
      <polygon points="105,52 125,45 120,65" fill="#000" />

      <text x="130" y="148" fill="#FDE047" fontSize="13.5" fontWeight="bold" textAnchor="middle">
        Biển W.201: Chỗ ngoặt nguy hiểm
      </text>
      <text x="130" y="170" fill="#E2E8F0" fontSize="11" textAnchor="middle">
        Cua gấp có nguy cơ lật xe
      </text>
    </g>

    {/* Traffic Sign 2: Đường trơn trượt (W.222) */}
    <g transform="translate(350, 105)">
      <rect width="260" height="190" rx="14" fill="#0C1424" stroke="#DC2626" strokeWidth="1.5" />
      <polygon points="130,20 215,122 45,122" fill="#FDE047" stroke="#DC2626" strokeWidth="6" strokeLinejoin="round" />
      {/* Slippery car tracks */}
      <rect x="115" y="50" width="30" height="20" rx="4" fill="#000" />
      <path
        d="M 115 75 Q 105 90 120 105 T 110 115"
        stroke="#000"
        strokeWidth="4"
        fill="none"
      />
      <path
        d="M 145 75 Q 135 90 150 105 T 140 115"
        stroke="#000"
        strokeWidth="4"
        fill="none"
      />

      <text x="130" y="148" fill="#FDE047" fontSize="13.5" fontWeight="bold" textAnchor="middle">
        Biển W.222: Đường trơn trượt
      </text>
      <text x="130" y="170" fill="#E2E8F0" fontSize="11" textAnchor="middle">
        Giảm tốc độ, tránh phanh gấp
      </text>
    </g>

    {/* Traffic Sign 3: Trẻ em qua đường (W.225) */}
    <g transform="translate(640, 105)">
      <rect width="260" height="190" rx="14" fill="#0C1424" stroke="#DC2626" strokeWidth="1.5" />
      <polygon points="130,20 215,122 45,122" fill="#FDE047" stroke="#DC2626" strokeWidth="6" strokeLinejoin="round" />
      {/* Two children walking */}
      <circle cx="115" cy="58" r="6" fill="#000" />
      <line x1="115" y1="64" x2="115" y2="85" stroke="#000" strokeWidth="4" />
      <line x1="115" y1="85" x2="105" y2="105" stroke="#000" strokeWidth="3.5" />
      <line x1="115" y1="85" x2="125" y2="105" stroke="#000" strokeWidth="3.5" />

      <circle cx="145" cy="65" r="5" fill="#000" />
      <line x1="145" y1="70" x2="145" y2="88" stroke="#000" strokeWidth="3.5" />
      <line x1="145" y1="88" x2="138" y2="105" stroke="#000" strokeWidth="3" />
      <line x1="145" y1="88" x2="152" y2="105" stroke="#000" strokeWidth="3" />

      <text x="130" y="148" fill="#FDE047" fontSize="13.5" fontWeight="bold" textAnchor="middle">
        Biển W.225: Trẻ em qua đường
      </text>
      <text x="130" y="170" fill="#E2E8F0" fontSize="11" textAnchor="middle">
        Khu vực gần trường học
      </text>
    </g>

    {/* Traffic Sign 4: Giao thông hai chiều (W.204) */}
    <g transform="translate(60, 315)">
      <rect width="260" height="190" rx="14" fill="#0C1424" stroke="#DC2626" strokeWidth="1.5" />
      <polygon points="130,20 215,122 45,122" fill="#FDE047" stroke="#DC2626" strokeWidth="6" strokeLinejoin="round" />
      {/* Up arrow and down arrow */}
      <line x1="115" y1="105" x2="115" y2="55" stroke="#000" strokeWidth="5" />
      <polygon points="115,48 105,62 125,62" fill="#000" />

      <line x1="145" y1="55" x2="145" y2="105" stroke="#000" strokeWidth="5" />
      <polygon points="145,112 135,98 155,98" fill="#000" />

      <text x="130" y="148" fill="#FDE047" fontSize="13.5" fontWeight="bold" textAnchor="middle">
        Biển W.204: Đường hai chiều
      </text>
      <text x="130" y="170" fill="#E2E8F0" fontSize="11" textAnchor="middle">
        Chú ý xe ngược chiều lấn làn
      </text>
    </g>

    {/* Traffic Sign 5: Đường có gồ giảm tốc (W.221) */}
    <g transform="translate(350, 315)">
      <rect width="260" height="190" rx="14" fill="#0C1424" stroke="#DC2626" strokeWidth="1.5" />
      <polygon points="130,20 215,122 45,122" fill="#FDE047" stroke="#DC2626" strokeWidth="6" strokeLinejoin="round" />
      {/* Speed bump curve */}
      <path
        d="M 80 95 H 105 Q 130 55 155 95 H 180"
        stroke="#000"
        strokeWidth="6"
        fill="none"
        strokeLinecap="round"
      />

      <text x="130" y="148" fill="#FDE047" fontSize="13.5" fontWeight="bold" textAnchor="middle">
        Biển W.221: Gờ giảm tốc
      </text>
      <text x="130" y="170" fill="#E2E8F0" fontSize="11" textAnchor="middle">
        Đoạn đường có gờ nhô cao
      </text>
    </g>

    {/* Traffic Sign 6: Giao nhau đường sắt có rào chắn (W.210) */}
    <g transform="translate(640, 315)">
      <rect width="260" height="190" rx="14" fill="#0C1424" stroke="#DC2626" strokeWidth="1.5" />
      <polygon points="130,20 215,122 45,122" fill="#FDE047" stroke="#DC2626" strokeWidth="6" strokeLinejoin="round" />
      {/* Fence / Gate symbol */}
      <line x1="85" y1="75" x2="175" y2="75" stroke="#000" strokeWidth="4" />
      <line x1="85" y1="95" x2="175" y2="95" stroke="#000" strokeWidth="4" />
      <line x1="100" y1="65" x2="100" y2="105" stroke="#000" strokeWidth="3" />
      <line x1="120" y1="65" x2="120" y2="105" stroke="#000" strokeWidth="3" />
      <line x1="140" y1="65" x2="140" y2="105" stroke="#000" strokeWidth="3" />
      <line x1="160" y1="65" x2="160" y2="105" stroke="#000" strokeWidth="3" />

      <text x="130" y="148" fill="#FDE047" fontSize="13.5" fontWeight="bold" textAnchor="middle">
        Biển W.210: Giao với đường sắt
      </text>
      <text x="130" y="170" fill="#E2E8F0" fontSize="11" textAnchor="middle">
        Đoạn đường sắt có rào chắn
      </text>
    </g>
  </svg>
);
